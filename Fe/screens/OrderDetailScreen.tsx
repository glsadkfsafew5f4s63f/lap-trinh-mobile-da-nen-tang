import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors, radius } from '../constants/theme';
import { mapApiOrder, useOrders } from '../context/OrderContext';
import { useReviews } from '../context/ReviewContext';
import { getOrderTotal, Order } from '../data/orders';
import { formatPrice, getProductById } from '../data/products';
import { getApiOrder, retryPaymentApi } from '../services/api';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { getOrderById, markReviewed, cancelOrder } = useOrders();
  const { addReview } = useReviews();
  const [serverOrder, setServerOrder] = useState<Order | undefined>(() => getOrderById(route.params.orderId));
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const serverId = Number(route.params.orderId);
    if (!serverId) return () => { active = false; };
    void getApiOrder(serverId)
      .then((row) => { if (active) setServerOrder(mapApiOrder(row)); })
      .catch((error) => { if (active) Alert.alert('Không tải được đơn hàng', error instanceof Error ? error.message : 'Vui lòng thử lại.'); });
    return () => { active = false; };
  }, [route.params.orderId]);

  const order = serverOrder ?? getOrderById(route.params.orderId);

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
        <Text style={styles.meta}>Trạng thái thanh toán: {order.paymentStatus || 'Chưa có dữ liệu'}</Text>
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
                <Text style={styles.bold}>{item.name || product?.name || item.productId}</Text>
                <Text style={styles.meta}>
                  {item.sku ? `${item.sku} · ` : ''}x{item.quantity} · {formatPrice(item.price)}
                </Text>
                {order.status === 'Đã giao' ? (
                  <Pressable disabled={reviewed} onPress={() => {
                    setActiveProductId((current) => current === item.productId ? null : item.productId);
                    setStars(5);
                    setComment('');
                  }}>
                    <Text style={[styles.review, reviewed && styles.reviewed]}>
                      {reviewed ? 'Đã đánh giá' : 'Đánh giá sản phẩm'}
                    </Text>
                  </Pressable>
                ) : null}
                {order.status === 'Đã giao' && activeProductId === item.productId && !reviewed ? (
                  <View style={styles.reviewForm}>
                    <Text style={styles.reviewFormTitle}>Đánh giá {product?.name ?? 'sản phẩm'}</Text>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Pressable key={value} onPress={() => setStars(value)}>
                          <Text style={styles.star}>{value <= stars ? '★' : '☆'}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <AppInput
                      value={comment}
                      onChangeText={setComment}
                      placeholder="Viết bình luận về sản phẩm..."
                      multiline
                      label="Bình luận"
                      style={styles.commentInput}
                    />
                    <AppButton
                      label={isSubmitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                      disabled={isSubmitting}
                      onPress={async () => {
                        setIsSubmitting(true);
                        const error = await addReview({
                          productId: item.productId,
                          author: 'Bạn',
                          stars,
                          comment: comment.trim() || 'Sản phẩm đúng mô tả.',
                        }, String(order.serverId), item.detailId);
                        setIsSubmitting(false);
                        if (error) {
                          Alert.alert('Không thể gửi đánh giá', error);
                          return;
                        }
                        markReviewed(order.id, item.productId);
                        setActiveProductId(null);
                        setComment('');
                        Alert.alert('Đã gửi đánh giá', 'Cảm ơn bạn đã chia sẻ cảm nhận.');
                      }}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <View style={styles.totalRow}>
          <Text style={styles.meta}>Tạm tính</Text>
          <Text>{formatPrice(order.subtotal ?? getOrderTotal(order) - order.shippingFee)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.meta}>Giảm giá</Text>
          <Text>-{formatPrice(order.discount || 0)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.meta}>Phí vận chuyển</Text>
          <Text>{formatPrice(order.shippingFee)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.bold}>Tổng tiền</Text>
          <Text style={styles.total}>{formatPrice(getOrderTotal(order))}</Text>
        </View>
      </View>
      {['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_CHUAN_BI'].includes(order.statusCode || '') ? (
        <AppButton
          label={isUpdatingOrder ? 'ĐANG HỦY...' : 'HỦY ĐƠN HÀNG'}
          variant="outline"
          disabled={isUpdatingOrder}
          onPress={() => Alert.alert('Hủy đơn hàng', 'Bạn có chắc muốn hủy đơn này?', [
            { text: 'Không', style: 'cancel' },
            { text: 'Hủy đơn', style: 'destructive', onPress: async () => {
              setIsUpdatingOrder(true);
              const error = await cancelOrder(String(order.serverId));
              setIsUpdatingOrder(false);
              if (error) Alert.alert('Không thể hủy đơn', error);
              else {
                const detail = order.serverId ? await getApiOrder(order.serverId) : null;
                if (detail) setServerOrder(mapApiOrder(detail));
                Alert.alert('Đã hủy đơn hàng', 'Trạng thái đơn đã được cập nhật.');
              }
            } },
          ])}
        />
      ) : null}
      {order.paymentStatus === 'THAT_BAI' && order.serverId ? (
        <AppButton
          label={isUpdatingOrder ? 'ĐANG TẠO LƯỢT THANH TOÁN...' : 'THỬ THANH TOÁN LẠI'}
          disabled={isUpdatingOrder}
          onPress={async () => {
            setIsUpdatingOrder(true);
            try {
              await retryPaymentApi(order.serverId!, order.payment === 'Chưa xác định' ? 'VNPAY' : order.payment);
              const detail = await getApiOrder(order.serverId!);
              setServerOrder(mapApiOrder(detail));
              Alert.alert('Đã tạo lượt thanh toán', 'Đã ghi nhận lần thử mới. Cổng thanh toán cần được xử lý bởi nhà cung cấp.');
            } catch (error) {
              Alert.alert('Không thể thanh toán lại', error instanceof Error ? error.message : 'Vui lòng thử lại.');
            } finally {
              setIsUpdatingOrder(false);
            }
          }}
        />
      ) : null}
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
  reviewForm: {
    marginTop: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: '#FBF4EC',
    gap: 10,
  },
  reviewFormTitle: {
    color: colors.ink,
    fontWeight: '800',
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    color: colors.star,
    fontSize: 28,
  },
  commentInput: {
    minHeight: 82,
    textAlignVertical: 'top',
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
