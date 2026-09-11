import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors, radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { defaultAddress } from '../data/address';
import { formatPrice } from '../data/products';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: Props) {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const [name, setName] = useState(user?.name || defaultAddress.name);
  const [phone, setPhone] = useState(user?.phone || defaultAddress.phone);
  const [address, setAddress] = useState(user?.address || defaultAddress.address);

  function placeOrder() {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Hãy thêm sản phẩm trước khi đặt hàng.');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ địa chỉ nhận hàng.');
      return;
    }

    const order = addOrder({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: items.map((item) => ({
        productId: item.id,
                colorIndex: item.colorIndex,
                sizeIndex: item.sizeIndex,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    Alert.alert(
      'Đặt hàng thành công',
      `Mã đơn ${order.id} · COD ${formatPrice(total + 30000)}. (Dữ liệu local, chưa gửi API)`,
      [
        {
          text: 'OK',
          onPress: () => {
            clear();
            navigation.navigate('MainTabs', { screen: 'Profile' });
          },
        },
      ]
    );
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
          <Text>{formatPrice(30000)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.bold}>Tổng cộng</Text>
          <Text style={styles.grandTotal}>{formatPrice(total + 30000)}</Text>
        </View>
      </View>

      <Text style={styles.section}>Phương thức thanh toán</Text>
      <View style={[styles.card, styles.payment]}>
        <Ionicons name="radio-button-on" size={20} color={colors.accent} />
        <View>
          <Text style={styles.bold}>COD</Text>
          <Text style={styles.hint}>Thanh toán khi nhận hàng</Text>
        </View>
      </View>

      <AppButton label="ĐẶT HÀNG COD" onPress={placeOrder} />
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
});
