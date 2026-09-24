import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors, radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { defaultAddress } from '../data/address';
import { formatPrice } from '../data/products';
import { getApiAddresses } from '../services/api';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: Props) {
  const { items, total, clear, isLoading } = useCart();
  const { user } = useAuth();
  const { addOrder, isLoading: isOrderLoading, error } = useOrders();
  const [name, setName] = useState(user?.name || defaultAddress.name);
  const [phone, setPhone] = useState(user?.phone || defaultAddress.phone);
  const [address, setAddress] = useState(user?.address || defaultAddress.address);
  const [addressId, setAddressId] = useState<number | undefined>();
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const shippingFee = 30000;
  const grandTotal = total + shippingFee;
  const deposit = Math.round(grandTotal * 0.2);
  const remaining = grandTotal - deposit;

  useEffect(() => {
    getApiAddresses().then((addresses) => {
      const current = addresses[0];
      if (!current) return;
      setAddressId(current.MaDiaChi);
      setName(current.TenNguoiNhan);
      setPhone(current.SoDienThoai);
      setAddress(current.DiaChiChiTiet);
    }).catch(() => undefined);
  }, []);

  async function placeOrder() {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Hãy thêm sản phẩm trước khi đặt hàng.');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ địa chỉ nhận hàng.');
      return;
    }

    try {
      const order = await addOrder({
        name: name.trim(),
        addressId,
        phone: phone.trim(),
        address: address.trim(),
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
        deposit,
        remaining,
      });

      setPendingOrderId(order.id);
      setPaymentVisible(true);
    } catch (error) {
      Alert.alert('Không thể đặt hàng', error instanceof Error ? error.message : 'Đơn hàng chưa được lưu.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Địa chỉ nhận hàng</Text>
      <View style={styles.card}>
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
          <Text>{formatPrice(total)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.muted}>Phí vận chuyển</Text>
          <Text>{formatPrice(shippingFee)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.bold}>Tổng cộng</Text>
          <Text style={styles.grandTotal}>{formatPrice(grandTotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.depositLabel}>Cọc trước 20%</Text>
          <Text style={styles.depositValue}>{formatPrice(deposit)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.muted}>Thanh toán khi nhận hàng</Text>
          <Text>{formatPrice(remaining)}</Text>
        </View>
      </View>

      <Text style={styles.section}>Phương thức thanh toán</Text>
      <View style={[styles.card, styles.payment]}>
        <Ionicons name="radio-button-on" size={20} color={colors.accent} />
        <View>
          <Text style={styles.bold}>Cọc 20% qua QR + thanh toán phần còn lại khi nhận hàng</Text>
          <Text style={styles.hint}>Cọc ngay {formatPrice(deposit)}, nhận hàng thanh toán {formatPrice(remaining)}</Text>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <AppButton
        label={isOrderLoading || isLoading ? 'ĐANG XỬ LÝ...' : 'TẠO ĐƠN VÀ THANH TOÁN CỌC'}
        onPress={placeOrder}
        disabled={isOrderLoading || isLoading}
      />

      <Modal visible={paymentVisible} animationType="slide" transparent onRequestClose={() => setPaymentVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.paymentModal}>
            <Text style={styles.modalTitle}>Thanh toán tiền cọc</Text>
            <Text style={styles.modalHint}>Quét mã QR bằng ứng dụng ngân hàng của bạn</Text>
            <Image
              source={{
                uri: `https://img.vietqr.io/image/MB-0868087112-compact2.png?amount=${deposit}&addInfo=${encodeURIComponent(`COC ${pendingOrderId ?? ''}`)}&accountName=NGUYEN%20VAN%20AN`,
              }}
              style={styles.qr}
              contentFit="contain"
            />
            <View style={styles.transferDetails}>
              <Text style={styles.transferLine}>Ngân hàng: <Text style={styles.bold}>MB Bank</Text></Text>
              <Text style={styles.transferLine}>Số tài khoản: <Text style={styles.bold}>0868087112</Text></Text>
              <Text style={styles.transferLine}>Chủ tài khoản: <Text style={styles.bold}>NGUYEN VAN AN</Text></Text>
              <Text style={styles.transferLine}>Số tiền cọc: <Text style={styles.depositValue}>{formatPrice(deposit)}</Text></Text>
              <Text style={styles.transferLine}>Nội dung: <Text style={styles.bold}>COC {pendingOrderId}</Text></Text>
            </View>
            <Text style={styles.verificationHint}>Đơn hàng sẽ được giao sau khi cửa hàng kiểm tra giao dịch.</Text>
            <AppButton
              label="TÔI ĐÃ CHUYỂN KHOẢN"
              onPress={() => {
                setPaymentVisible(false);
                clear();
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }}
            />
            <Pressable onPress={() => setPaymentVisible(false)} style={styles.cancelPayment}>
              <Text style={styles.cancelPaymentText}>Để tôi thanh toán sau</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
