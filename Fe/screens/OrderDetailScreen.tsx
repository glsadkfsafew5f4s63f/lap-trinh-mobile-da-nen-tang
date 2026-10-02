import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
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
import { createReturnRequestApi, getApiOrder, getReturnRequestApi, retryPaymentApi } from '../services/api';
import type { ApiReturnRequest } from '../services/api';
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
  const [returnRequest, setReturnRequest] = useState<ApiReturnRequest | null>(null);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    let active = true;
    const serverId = Number(route.params.orderId);
    if (!serverId) return () => { active = false; };
    void getApiOrder(serverId)
      .then((row) => { if (active) setServerOrder(mapApiOrder(row)); })
      .catch((error) => { if (active) Alert.alert('Không tải được đơn hàng', error instanceof Error ? error.message : 'Vui lòng thử lại.'); });
    void getReturnRequestApi(serverId)
      .then((row) => { if (active) setReturnRequest(row); })
      .catch((error) => { if (active) Alert.alert('Không tải được yêu cầu trả hàng', error instanceof Error ? error.message : 'Vui lòng thử lại.'); });
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
      {['THAT_BAI', 'CHO_XU_LY'].includes(order.paymentStatus || '') && order.payment === 'MOMO' && order.serverId ? (
        <AppButton
          label={isUpdatingOrder ? 'ĐANG MỞ MOMO...' : order.paymentStatus === 'THAT_BAI' ? 'THỬ THANH TOÁN LẠI' : 'TIẾP TỤC THANH TOÁN'}
          disabled={isUpdatingOrder}
          onPress={async () => {
            setIsUpdatingOrder(true);
            try {
              const payment = await retryPaymentApi(order.serverId!, 'MOMO');
              if (payment.mock) {
                const detail = await getApiOrder(order.serverId!);
                setServerOrder(mapApiOrder(detail));
                Alert.alert('Thanh toán giả lập thành công', 'Đơn hàng đã được đánh dấu đã thanh toán. Không thu tiền thật.');
              } else {
                await WebBrowser.openAuthSessionAsync(payment.payUrl!, payment.redirectUrl!);
                const detail = await getApiOrder(order.serverId!);
                setServerOrder(mapApiOrder(detail));
                Alert.alert(
                  detail.TrangThaiThanhToan === 'DA_THANH_TOAN' ? 'Thanh toán thành công' : 'Đang chờ MoMo xác nhận',
                  detail.TrangThaiThanhToan === 'DA_THANH_TOAN' ? 'Đơn hàng đã được thanh toán.' : 'Trạng thái sẽ đổi sau khi máy chủ nhận kết quả từ MoMo.',
                );
              }
            } catch (error) {
              Alert.alert('Không thể thanh toán lại', error instanceof Error ? error.message : 'Vui lòng thử lại.');
            } finally {
              setIsUpdatingOrder(false);
            }
          }}
        />
      ) : null}
      {order.statusCode === 'DA_GIAO' && ['DA_THANH_TOAN', 'THANH_CONG'].includes(order.paymentStatus || '') && order.serverId ? (
        <View style={styles.returnSection}>
          <Text style={styles.section}>Trả hàng</Text>
          {returnRequest ? (
            <View style={styles.card}>
              <Text style={styles.bold}>Trạng thái: {returnRequest.TrangThai === 'CHO_DUYET' ? 'Chờ cửa hàng duyệt' : returnRequest.TrangThai === 'DA_DUYET' ? 'Đã duyệt, vui lòng gửi hàng về cửa hàng' : returnRequest.TrangThai === 'DA_NHAN_HANG' ? 'Cửa hàng đã nhận hàng, đang chờ hoàn tiền' : returnRequest.TrangThai === 'DA_HOAN_TIEN' ? 'Đã hoàn tiền' : 'Yêu cầu bị từ chối'}</Text>
              <Text style={styles.meta}>Lý do: {returnRequest.LyDo}</Text>
              {returnRequest.GhiChuXuLy ? <Text style={styles.meta}>Phản hồi: {returnRequest.GhiChuXuLy}</Text> : null}
            </View>
          ) : null}
          {(!returnRequest || returnRequest.TrangThai === 'TU_CHOI') ? (
            <View style={styles.reviewForm}>
              <Text style={styles.meta}>Bạn có thể gửi yêu cầu trả toàn bộ đơn. Cửa hàng sẽ xem xét trước khi nhận hàng và hoàn tiền.</Text>
              <AppInput
                value={returnReason}
                onChangeText={setReturnReason}
                placeholder="Mô tả lý do trả hàng..."
                multiline
                label="Lý do trả hàng"
                style={styles.commentInput}
              />
              <AppButton
                label={isUpdatingOrder ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU TRẢ HÀNG'}
                disabled={isUpdatingOrder || !returnReason.trim()}
                onPress={async () => {
                  setIsUpdatingOrder(true);
                  try {
                    const created = await createReturnRequestApi(order.serverId!, returnReason.trim());
                    setReturnRequest(created);
                    setReturnReason('');
                    Alert.alert('Đã gửi yêu cầu', 'Cửa hàng sẽ xem xét yêu cầu trả hàng của bạn.');
                  } catch (error) {
                    Alert.alert('Không gửi được yêu cầu', error instanceof Error ? error.message : 'Vui lòng thử lại.');
                  } finally {
                    setIsUpdatingOrder(false);
                  }
                }}
              />
            </View>
          ) : null}
        </View>
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
  returnSection: {
    marginTop: 8,
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
