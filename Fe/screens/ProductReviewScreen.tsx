import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors, radius } from '../constants/theme';
import { useOrders } from '../context/OrderContext';
import { useReviews } from '../context/ReviewContext';
import { getProductById } from '../data/products';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductReview'>;

export default function ProductReviewScreen({ navigation, route }: Props) {
  const { getOrderById, markReviewed } = useOrders();
  const { addReview } = useReviews();
  const product = getProductById(route.params.productId);
  const order = getOrderById(route.params.orderId);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  async function submit() {
    if (!order || !product) {
      Alert.alert('Lỗi', 'Không tìm thấy đơn hoặc sản phẩm.');
      return;
    }
    const detailId = order.items.find((item) => item.productId === product.id)?.detailId;
    const error = await addReview({
      productId: product.id,
      author: 'Bạn',
      stars,
      comment: comment.trim() || 'Sản phẩm đúng mô tả và giao hàng nhanh.',
    }, order.id, detailId);
    if (error) {
      Alert.alert('Không thể gửi đánh giá', error);
      return;
    }
    markReviewed(order.id, product.id);
    Alert.alert(
      'Đã gửi đánh giá',
      `${stars}/5 sao cho ${product.name}. Đánh giá đã được ghi nhận.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy sản phẩm.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.product}>
        <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>
        </View>
      </View>

      <Text style={styles.label}>Số sao</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setStars(value)}>
            <Ionicons
              name={value <= stars ? 'star' : 'star-outline'}
              size={32}
              color={colors.star}
            />
          </Pressable>
        ))}
      </View>

      <AppInput
        value={comment}
        onChangeText={setComment}
        placeholder="Viết cảm nhận của bạn..."
        multiline
        label="Nhận xét"
        style={styles.input}
      />

      <View style={{ height: 20 }} />
      <AppButton label="GỬI ĐÁNH GIÁ" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  product: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  image: {
    width: 72,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#EDE6DC',
  },
  brand: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.muted,
    fontWeight: '700',
  },
  name: {
    flex: 1,
    fontWeight: '700',
    fontSize: 16,
    color: colors.ink,
    marginTop: 4,
  },
  label: {
    fontWeight: '700',
    marginBottom: 8,
    color: colors.ink,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  input: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
