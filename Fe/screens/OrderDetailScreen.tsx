import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, radius } from '../constants/theme';
import { useOrders } from '../context/OrderContext';
import { getOrderTotal } from '../data/orders';
import { formatPrice, getProductById } from '../data/products';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { getOrderById } = useOrders();
  const order = getOrderById(route.params.orderId);

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy đơn hàng.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.id}>{order.id}</Text>
        <Text style={styles.meta}>Ngày: {order.date}</Text>
        <Text style={styles.meta}>Trạng thái: {order.status}</Text>
        <Text style={styles.meta}>Thanh toán: {order.payment}</Text>
        {order.deposit !== undefined ? <Text style={styles.meta}>Đã cọc 20%: {formatPrice(order.deposit)}</Text> : null}
        {order.remaining !== undefined ? <Text style={styles.meta}>Còn lại: {formatPrice(order.remaining)}</Text> : null}
      </View>

      <Text style={styles.section}>Giao tới</Text>
      <View style={styles.card}>
        <Text style={styles.bold}>{order.name}</Text>
        <Text style={styles.meta}>{order.phone}</Text>
        <Text style={styles.meta}>{order.address}</Text>
      </View>

      <Text style={styles.section}>Sản phẩm</Text>
      <View style={styles.card}>
        {order.items.map((item) => {
          const product = getProductById(item.productId);
          const reviewed = order.reviewedProductIds.includes(item.productId);
          return (
            <View key={item.productId} style={styles.product}>
              <Image
                source={{ uri: product?.image }}
                style={styles.image}
                contentFit="cover"
              />
              <View style={styles.info}>
                <Text style={styles.bold}>{product?.name ?? item.productId}</Text>
                <Text style={styles.meta}>
                  {item.sku ? `${item.sku} · ` : ''}x{item.quantity} · {formatPrice(item.price)}
                </Text>
                {order.status === 'Đã giao' ? (
                  <Pressable
                    disabled={reviewed}
                    onPress={() =>
                      navigation.navigate('ProductReview', {
                        orderId: order.id,
                        productId: item.productId,
                      })
                    }
                  >
                    <Text style={[styles.review, reviewed && styles.reviewed]}>
                      {reviewed ? 'Đã đánh giá' : 'Đánh giá sản phẩm'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <View style={styles.totalRow}>
          <Text style={styles.bold}>Tổng tiền</Text>
          <Text style={styles.total}>{formatPrice(getOrderTotal(order))}</Text>
        </View>
      </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 8,
    marginTop: 8,
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    gap: 6,
  },
  id: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  meta: {
    color: colors.muted,
  },
  bold: {
    fontWeight: '700',
    color: colors.ink,
  },
  product: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  image: {
    width: 64,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#EDE6DC',
  },
  info: {
    flex: 1,
  },
  review: {
    marginTop: 6,
    color: colors.accent,
    fontWeight: '700',
  },
  reviewed: {
    color: colors.muted,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  total: {
    fontWeight: '800',
    color: colors.accent,
  },
});
