import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { ProductCard } from '../components/ProductCard';
import { QuantityStepper } from '../components/QuantityStepper';
import { colors, radius } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoriteContext';
import { useReviews } from '../context/ReviewContext';
import { useAuth } from '../context/AuthContext';
import {
    formatPrice,
    getProductById,
    getProductVariantStock,
    getRelatedProducts,
} from '../data/products';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }: Props) {
  const product = getProductById(route.params.productId);
  const { addToCart } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { getReviews } = useReviews();
  const { user } = useAuth();
  const galleryRef = useRef<ScrollView>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy sản phẩm.</Text>
      </View>
    );
  }

  const liked = isFavorite(product.id);
  const gallery = product.images.length > 0 ? product.images : [product.image];
  const related = getRelatedProducts(product.id);
  const reviews = getReviews(product.id);
  const selectedColor = product.colors[colorIndex];
  const selectedSize = product.sizes[sizeIndex];
  const selectedStock = getProductVariantStock(product, colorIndex, sizeIndex);

  function onGalleryScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setGalleryIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  }

  function addProduct() {
    if (!product) {
      return;
    }
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập hoặc đăng ký để thêm sản phẩm vào giỏ hàng.', [
        { text: 'Để sau' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (selectedStock === 0) {
      Alert.alert('Biến thể tạm hết hàng', 'Vui lòng chọn màu hoặc kích thước khác.');
      return;
    }
    addToCart(product.id, colorIndex, sizeIndex, quantity);
    Alert.alert(
      'Đã thêm vào giỏ',
      `${product.name}\n${selectedColor?.name} · ${selectedSize} · x${quantity}`,
      [
        { text: 'Tiếp tục' },
        {
          text: 'Xem giỏ',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
        },
      ]
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onGalleryScroll}
            scrollEventThrottle={16}
          >
            {gallery.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.galleryImage} contentFit="cover" />
            ))}
          </ScrollView>
          <Pressable
            style={styles.heart}
            onPress={() => {
              if (!user) {
                Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập hoặc đăng ký để yêu thích sản phẩm.', [
                  { text: 'Để sau' },
                  { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
                ]);
                return;
              }
              toggle(product.id);
            }}
          >
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? colors.accent : colors.ink} />
          </Pressable>
          <View style={styles.count}>
            <Text style={styles.countText}>
              {galleryIndex + 1}/{gallery.length}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbs}
        >
          {gallery.map((uri, i) => (
            <Pressable
              key={uri}
              onPress={() => {
                setGalleryIndex(i);
                galleryRef.current?.scrollTo({ x: i * width, animated: true });
              }}
              style={[styles.thumbWrap, i === galleryIndex && styles.thumbActive]}
            >
              <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.body}>
          <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.star} />
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} · {product.reviewCount} đánh giá
            </Text>
          </View>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.label}>Màu sắc · {selectedColor?.name}</Text>
          <View style={styles.row}>
            {product.colors.map((item, index) => (
              <Pressable
                key={item.name}
                onPress={() => {
                  setColorIndex(index);
                  setQuantity(1);
                }}
                style={[styles.colorChip, index === colorIndex && styles.colorChipActive]}
              >
                <View style={[styles.colorDot, { backgroundColor: item.hex }]} />
                <Text style={[styles.colorName, index === colorIndex && styles.colorNameActive]}>
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Kích thước</Text>
          <View style={styles.row}>
            {product.sizes.map((size, index) => (
              <Pressable
                key={size}
                onPress={() => {
                  setSizeIndex(index);
                  setQuantity(1);
                }}
                style={[styles.sizeChip, index === sizeIndex && styles.sizeActive]}
              >
                <Text style={[styles.sizeText, index === sizeIndex && styles.sizeTextActive]}>{size}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.stockRow}>
            <Ionicons
              name={selectedStock > 0 ? 'checkmark-circle-outline' : 'alert-circle-outline'}
              size={17}
              color={selectedStock > 0 ? colors.accent : colors.muted}
            />
            <Text style={styles.stockText}>
              {selectedStock > 0 ? `Còn ${selectedStock} sản phẩm cho lựa chọn này` : 'Tạm hết hàng'}
            </Text>
          </View>

          <Text style={styles.label}>Số lượng</Text>
          <QuantityStepper
            quantity={quantity}
            onIncrease={() => setQuantity((n) => Math.min(selectedStock, n + 1))}
            onDecrease={() => setQuantity((n) => Math.max(1, n - 1))}
          />

          <View style={styles.ship}>
            <Ionicons name="cube-outline" size={18} color={colors.accent} />
            <Text style={styles.shipText}>Giao 2–4 ngày · Đổi trả 7 ngày · COD</Text>
          </View>

          <View style={styles.reviewHeader}>
            <View>
              <Text style={styles.reviewTitle}>Đánh giá sản phẩm</Text>
              <View style={styles.reviewSummary}>
                <Ionicons name="star" size={15} color={colors.star} />
                <Text style={styles.reviewScore}>{product.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>
                  {product.reviewCount + reviews.length} đánh giá
                </Text>
              </View>
            </View>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.accent} />
          </View>
          {reviews.length > 0 ? (
            reviews.slice(0, 2).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={styles.reviewStars}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Ionicons
                      key={index}
                      name={index < review.stars ? 'star' : 'star-outline'}
                      size={13}
                      color={colors.star}
                    />
                  ))}
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>Chưa có đánh giá cho lựa chọn này.</Text>
          )}
        </View>

        {related.length > 0 ? (
          <View style={styles.related}>
            <Text style={styles.relatedTitle}>Gợi ý phối đồ</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
            >
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  horizontal
                  onPress={() => navigation.push('ProductDetail', { productId: item.id })}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Tạm tính</Text>
          <Text style={styles.footerPrice}>{formatPrice(product.price * quantity)}</Text>
        </View>
        <Pressable style={styles.cartBtn} onPress={addProduct}>
          <Ionicons name="bag-add-outline" size={18} color="#fff" />
          <Text style={styles.cartText}>THÊM VÀO GIỎ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImage: {
    width,
    height: 520,
    backgroundColor: '#EDE6DC',
  },
  heart: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  thumbs: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  thumbWrap: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbActive: {
    borderColor: colors.ink,
  },
  thumb: {
    width: 62,
    height: 78,
    backgroundColor: '#EDE6DC',
  },
  body: {
    padding: 20,
    paddingBottom: 16,
  },
  brand: {
    letterSpacing: 2,
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
  },
  name: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: '600',
    color: colors.ink,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  ratingText: {
    color: colors.muted,
    fontSize: 13,
  },
  price: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '800',
    color: colors.accent,
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#4A453F',
  },
  label: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  colorChipActive: {
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  colorName: {
    fontSize: 13,
    color: colors.muted,
  },
  colorNameActive: {
    color: colors.ink,
    fontWeight: '700',
  },
  sizeChip: {
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  sizeActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  sizeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  sizeTextActive: {
    color: '#fff',
  },
  ship: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentSoft,
    padding: 14,
    borderRadius: radius.md,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  stockText: {
    color: colors.muted,
    fontSize: 13,
  },
  reviewHeader: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  reviewScore: {
    fontWeight: '800',
    color: colors.ink,
  },
  reviewCount: {
    color: colors.muted,
    fontSize: 13,
  },
  reviewCard: {
    marginTop: 14,
    padding: 14,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontWeight: '700',
    color: colors.ink,
  },
  reviewDate: {
    color: colors.muted,
    fontSize: 12,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 6,
  },
  reviewComment: {
    color: '#4A453F',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  noReviews: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 12,
  },
  shipText: {
    color: colors.ink,
    fontSize: 13,
    flex: 1,
  },
  related: {
    paddingBottom: 24,
    backgroundColor: colors.bg,
  },
  relatedTitle: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 12,
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
  },
  relatedList: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerLabel: {
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.8,
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  cartBtn: {
    flex: 1,
    maxWidth: 220,
    backgroundColor: colors.ink,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cartText: {
    color: '#fff',
    letterSpacing: 1.2,
    fontWeight: '800',
    fontSize: 12,
  },
});
