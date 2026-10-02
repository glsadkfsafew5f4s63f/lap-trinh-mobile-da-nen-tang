import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors, radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { formatPrice } from '../data/products';
import { ApiCheckoutQuote, createAddressApi, createMomoPaymentApi, getApiAddresses, getApiCheckoutQuote, getApiOrder, updateAddressApi } from '../services/api';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: Props) {
  const { items, total, clear, isLoading } = useCart();
  const { user } = useAuth();
  const { addOrder, refreshOrders, isLoading: isOrderLoading, error } = useOrders();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [addressId, setAddressId] = useState<number | undefined>();
  const [addresses, setAddresses] = useState<Awaited<ReturnType<typeof getApiAddresses>>>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState('');
  const [checkoutQuote, setCheckoutQuote] = useState<ApiCheckoutQuote | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO'>('COD');
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const shippingFee = checkoutQuote?.PhiGiaoHang ?? null;
  const voucherDiscount = checkoutQuote?.GiamGia ?? 0;
  const grandTotal = checkoutQuote?.ThanhTien ?? 0;

  useEffect(() => {
    let active = true;
    const loadAddresses = () => {
      void getApiAddresses().then((rows) => {
        if (!active) return;
        setAddresses(rows);
        const current = rows.find((item) => item.MaDiaChi === addressId) || rows[0];
        if (current) {
          setAddressId(current.MaDiaChi);
          setName(current.TenNguoiNhan);
          setPhone(current.SoDienThoai);
          setAddress(current.DiaChiChiTiet);
          setWard(current.PhuongXa || '');
          setDistrict(current.QuanHuyen || '');
          setProvince(current.TinhThanh || '');
        }
      }).catch(() => undefined);
    };
    loadAddresses();
    const unsubscribe = navigation.addListener('focus', loadAddresses);
    return () => { active = false; unsubscribe(); };
  }, [navigation, addressId]);

  useEffect(() => {
    let active = true;
    setIsLoadingQuote(true);
    getApiCheckoutQuote(appliedVoucherCode || undefined)
      .then((quote) => { if (active) setCheckoutQuote(quote); })
      .catch((error) => {
        if (!active) return;
        setCheckoutQuote(null);
        if (appliedVoucherCode) setVoucherError(error instanceof Error ? error.message : 'Mã giảm giá không hợp lệ.');
      })
      .finally(() => { if (active) setIsLoadingQuote(false); });
    return () => { active = false; };
  }, [total, appliedVoucherCode]);
  async function checkVoucher() {
    if (!voucherCode.trim()) {
      setVoucherError('Nhập mã giảm giá trước khi kiểm tra.');
      return;
    }
    setIsCheckingVoucher(true);
    setVoucherError('');
    try {
      const result = await getApiCheckoutQuote(voucherCode.trim());
      setCheckoutQuote(result);
      setAppliedVoucherCode(voucherCode.trim());
    } catch (error) {
      setAppliedVoucherCode('');
      setVoucherError(error instanceof Error ? error.message : 'Mã giảm giá không hợp lệ.');
      try {
        setCheckoutQuote(await getApiCheckoutQuote());
      } catch {
        setCheckoutQuote(null);
      }
    } finally {
      setIsCheckingVoucher(false);
    }
  }

  async function placeOrder() {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Hãy thêm sản phẩm trước khi đặt hàng.');
      return;
    }
    if (shippingFee === null || isLoadingQuote) {
      Alert.alert('Chưa sẵn sàng', 'Chưa lấy được tổng tiền chính thức từ máy chủ.');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ địa chỉ nhận hàng.');
      return;
    }

    try {
      const addressPayload = {
        TenNguoiNhan: name.trim(),
        SoDienThoai: phone.trim(),
        DiaChiChiTiet: address.trim(),
        PhuongXa: ward.trim(),
        QuanHuyen: district.trim(),
        TinhThanh: province.trim(),
        LaMacDinh: 1,
      };
      const savedAddressId = addressId
        ? (await updateAddressApi(addressId, addressPayload), addressId)
        : (await createAddressApi(addressPayload)).insertId;
      setAddressId(savedAddressId);
      const order = await addOrder({
        name: name.trim(),
        addressId: savedAddressId,
        phone: phone.trim(),
        address: address.trim(),
        paymentMethod,
        voucherCode: appliedVoucherCode || undefined,
        items: items.map((item) => ({
          productId: item.id,
          variantId: item.variantId,
          sku: item.sku,
          colorIndex: item.colorIndex,
          sizeIndex: item.sizeIndex,
          color: item.colors[item.colorIndex]?.name ?? '',
          size: item.sizes[item.sizeIndex] ?? '',
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      await clear();
      if (paymentMethod === 'MOMO' && order.serverId) {
        try {
          const payment = await createMomoPaymentApi(order.serverId);
          if (payment.mock) {
            await refreshOrders();
            await getApiOrder(order.serverId);
            Alert.alert(
              'Thanh toán giả lập thành công',
              `Đơn ${order.id} đã được đánh dấu đã thanh toán. Không thu tiền thật.`,
              [{ text: 'Xem đơn hàng', onPress: () => navigation.navigate('OrderDetail', { orderId: String(order.serverId) }) }],
            );
          } else {
            const browserResult = await WebBrowser.openAuthSessionAsync(payment.payUrl!, payment.redirectUrl!);
            await refreshOrders();
            const latest = await getApiOrder(order.serverId);
            const paid = latest.TrangThaiThanhToan === 'DA_THANH_TOAN';
            Alert.alert(
              paid ? 'Thanh toán thành công' : 'Đơn hàng đang chờ thanh toán',
              paid ? `Đơn ${order.id} đã được thanh toán.` : browserResult.type === 'cancel' ? `Đơn ${order.id} đã tạo nhưng chưa thanh toán. Bạn có thể thanh toán lại trong chi tiết đơn.` : 'MoMo chưa xác nhận thanh toán. Trạng thái đơn sẽ được cập nhật khi máy chủ nhận kết quả.',
              [{ text: 'Xem đơn hàng', onPress: () => navigation.navigate('OrderDetail', { orderId: String(order.serverId) }) }],
            );
          }
        } catch (paymentError) {
          Alert.alert(
            'Đơn đã tạo, chưa thanh toán',
            paymentError instanceof Error ? paymentError.message : 'Không khởi tạo được thanh toán MoMo. Bạn có thể thử lại trong chi tiết đơn.',
            [{ text: 'Xem đơn hàng', onPress: () => navigation.navigate('OrderDetail', { orderId: String(order.serverId) }) }],
          );
        }
      } else {
        Alert.alert('Đặt hàng thành công', `Đơn ${order.id} đã được lưu.`, [
          { text: 'Xem đơn hàng', onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' }) },
        ]);
      }
    } catch (error) {
      Alert.alert('Không thể đặt hàng', error instanceof Error ? error.message : 'Đơn hàng chưa được lưu.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Địa chỉ nhận hàng</Text>
      <View style={styles.card}>
        {addresses.map((item) => (
          <Pressable
            key={item.MaDiaChi}
            style={[styles.savedAddress, item.MaDiaChi === addressId && styles.savedAddressSelected]}
            onPress={() => {
              setAddressId(item.MaDiaChi);
              setName(item.TenNguoiNhan);
              setPhone(item.SoDienThoai);
              setAddress(item.DiaChiChiTiet);
              setWard(item.PhuongXa || '');
              setDistrict(item.QuanHuyen || '');
              setProvince(item.TinhThanh || '');
            }}
          >
            <Text style={styles.savedAddressName}>{item.TenNguoiNhan}{item.LaMacDinh ? ' · Mặc định' : ''}</Text>
            <Text style={styles.savedAddressText}>{item.SoDienThoai} · {[item.DiaChiChiTiet, item.PhuongXa, item.QuanHuyen, item.TinhThanh].filter(Boolean).join(', ')}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => navigation.navigate('Address')}>
          <Text style={styles.manageAddresses}>Quản lý địa chỉ</Text>
        </Pressable>
        <AppInput value={name} onChangeText={setName} placeholder="Họ tên" label="Người nhận" />
        <AppInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          label="Số điện thoại"
        />
        <AppInput
          value={address}
          onChangeText={setAddress}
          placeholder="Địa chỉ"
          multiline
          label="Địa chỉ"
          style={styles.address}
        />
        <AppInput value={ward} onChangeText={setWard} placeholder="Phường / xã" label="Phường / xã" />
        <AppInput value={district} onChangeText={setDistrict} placeholder="Quận / huyện" label="Quận / huyện" />
        <AppInput value={province} onChangeText={setProvince} placeholder="Tỉnh / thành phố" label="Tỉnh / thành phố" />
      </View>

      <Text style={styles.section}>Sản phẩm</Text>
      <View style={styles.card}>
        {items.map((item) => (
          <View key={item.id} style={styles.productRow}>
            <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productMeta}>
                {item.colors[item.colorIndex]?.name} · {item.sizes[item.sizeIndex]} · x{item.quantity} ·{' '}
                {formatPrice(item.price)}
              </Text>
            </View>
            <Text style={styles.productPrice}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Tổng tiền</Text>
      <View style={styles.card}>
        <View style={styles.totalRow}>
          <Text style={styles.muted}>Tạm tính</Text>
          <Text>{formatPrice(checkoutQuote?.TongTien ?? 0)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.muted}>Giảm giá</Text>
          <Text>-{formatPrice(voucherDiscount)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.muted}>Phí vận chuyển</Text>
          <Text>{formatPrice(shippingFee ?? 0)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.bold}>Tổng cộng</Text>
          <Text style={styles.grandTotal}>{formatPrice(grandTotal)}</Text>
        </View>
      </View>

      <Text style={styles.section}>Mã giảm giá</Text>
      <View style={styles.card}>
        <View style={styles.voucherRow}>
          <AppInput value={voucherCode} onChangeText={(value) => { setVoucherCode(value); setVoucherError(''); if (value.trim() !== appliedVoucherCode) setAppliedVoucherCode(''); }} placeholder="Nhập mã giảm giá" />
          <AppButton label={isCheckingVoucher ? 'ĐANG KIỂM TRA' : 'ÁP DỤNG'} variant="outline" disabled={isCheckingVoucher} onPress={checkVoucher} />
        </View>
        {voucherError ? <Text style={styles.errorText}>{voucherError}</Text> : null}
        {appliedVoucherCode && voucherDiscount > 0 ? <Text style={styles.hint}>Đã giảm {formatPrice(voucherDiscount)} với mã {appliedVoucherCode}.</Text> : null}
      </View>

      <Text style={styles.section}>Phương thức thanh toán</Text>
      <View style={styles.card}>
        <Pressable style={styles.paymentOption} onPress={() => setPaymentMethod('COD')}>
          <Ionicons name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.accent} />
          <Text style={styles.bold}>Thanh toán khi nhận hàng (COD)</Text>
        </Pressable>
        <Pressable style={styles.paymentOption} onPress={() => setPaymentMethod('MOMO')}>
          <Ionicons name={paymentMethod === 'MOMO' ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.accent} />
          <Text style={styles.bold}>Ví MoMo</Text>
        </Pressable>
        <Text style={styles.hint}>Tổng thanh toán {formatPrice(grandTotal)}.</Text>
        <Text style={styles.hint}>{paymentMethod === 'MOMO' ? 'Bạn sẽ được chuyển tới MoMo để xác nhận thanh toán.' : 'Thanh toán trực tiếp cho nhân viên giao hàng khi nhận đơn.'}</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <AppButton
        label={isOrderLoading || isLoading ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG'}
        onPress={placeOrder}
        disabled={isOrderLoading || isLoading || isLoadingQuote || shippingFee === null}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 8,
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  address: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  savedAddress: { padding: 10, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, gap: 4 },
  savedAddressSelected: { borderColor: colors.accent },
  savedAddressName: { color: colors.ink, fontWeight: '700' },
  savedAddressText: { color: colors.muted, fontSize: 12 },
  manageAddresses: { color: colors.accent, fontWeight: '700' },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  image: {
    width: 58,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#EDE6DC',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: '600',
    color: colors.ink,
  },
  productMeta: {
    color: colors.muted,
    marginTop: 2,
    fontSize: 13,
  },
  productPrice: {
    fontWeight: '800',
    color: colors.accent,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  muted: {
    color: colors.muted,
  },
  bold: {
    fontWeight: '700',
    color: colors.ink,
  },
  grandTotal: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.accent,
  },
  depositLabel: {
    fontWeight: '700',
    color: colors.ink,
  },
  depositValue: {
    fontWeight: '800',
    color: colors.accent,
  },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  errorText: {
    color: '#b42318',
    marginBottom: 12,
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  paymentModal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
  },
  modalHint: {
    color: colors.muted,
    marginTop: 4,
    marginBottom: 12,
  },
  qr: {
    width: 250,
    height: 250,
    backgroundColor: '#fff',
  },
  transferDetails: {
    width: '100%',
    padding: 14,
    marginVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    gap: 5,
  },
  transferLine: {
    color: colors.ink,
    fontSize: 13,
  },
  verificationHint: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  cancelPayment: {
    padding: 12,
  },
  cancelPaymentText: {
    color: colors.muted,
    fontWeight: '600',
  },
});
