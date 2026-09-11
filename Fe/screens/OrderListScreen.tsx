import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { colors, radius } from '../constants/theme';
import { useOrders } from '../context/OrderContext';
import { getOrderTotal, OrderStatus } from '../data/orders';
import { formatPrice, getProductById } from '../data/products';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderList'>;

function statusColor(status: OrderStatus) {
  if (status === 'Đã giao') return '#2e7d32';
  if (status === 'Đã xác nhận') return '#1565c0';
  if (status === 'Đang giao') return '#ef6c00';
  if (status === 'Đã hủy') return '#c0392b';
  return colors.muted;
}

export default function OrderListScreen({ navigation }: Props) {
  const { orders } = useOrders();

  if (orders.length === 0) {
    return (
      <EmptyState title="Chưa có đơn hàng" message="Đặt hàng từ giỏ hàng để thấy đơn mẫu." icon="receipt-outline" />
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const first = getProductById(item.items[0]?.productId);
        return (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          >
            {first ? (
              <Image source={{ uri: first.image }} style={styles.thumb} contentFit="cover" />
            ) : null}
            <View style={styles.body}>
              <View style={styles.row}>
                <Text style={styles.id}>{item.id}</Text>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
              </View>
              <Text style={styles.meta}>
                {item.date} · {item.payment} · {item.items.length} SP
              </Text>
              <Text style={styles.total}>{formatPrice(getOrderTotal(item))}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.bg,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 72,
    height: 92,
    borderRadius: 12,
    backgroundColor: '#EDE6DC',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  id: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.ink,
  },
  status: {
    fontWeight: '700',
  },
  meta: {
    marginTop: 6,
    color: colors.muted,
  },
  total: {
    marginTop: 8,
    fontWeight: '800',
    color: colors.accent,
  },
});
