import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow } from '../constants/theme';
import { useFavorites } from '../context/FavoriteContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, Product } from '../data/products';
import type { RootStackParamList } from '../screens/types';

type Props = {
  product: Product;
  onPress: () => void;
  horizontal?: boolean;
  featured?: boolean;
};

export function ProductCard({ product, onPress, horizontal, featured }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const liked = isFavorite(product.id);

  return (
    <Pressable
      style={[
        styles.card,
        shadow.card,
        horizontal && styles.horizontalCard,
        featured && styles.featuredCard,
      ]}
      onPress={onPress}
    >
      <View>
        <Image
          source={{ uri: product.image }}
          style={[
            styles.image,
            horizontal && styles.horizontalImage,
            featured && styles.featuredImage,
          ]}
          contentFit="cover"
        />
        <View style={styles.badges}>
          {product.isNew ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>MỚI</Text>
            </View>
          ) : null}
          {product.isFeatured && !product.isNew ? (
            <View style={[styles.badge, styles.badgeFeatured]}>
              <Text style={styles.badgeText}>HOT</Text>
            </View>
          ) : null}
        </View>
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
          hitSlop={8}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? colors.accent : colors.ink} />
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="star" size={12} color={colors.star} />
          <Text style={styles.rating}>
            {product.rating.toFixed(1)}
          </Text>
          <Text style={styles.reviews}>({product.reviewCount})</Text>
        </View>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    margin: 6,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  horizontalCard: {
    width: 188,
    flex: 0,
    marginRight: 12,
    marginLeft: 0,
  },
  featuredCard: {
    width: 260,
    flex: 0,
    marginRight: 14,
    marginLeft: 0,
  },
  image: {
    width: '100%',
    height: 228,
    backgroundColor: '#EDE6DC',
  },
  horizontalImage: {
    height: 236,
  },
  featuredImage: {
    height: 320,
  },
  badges: {
    position: 'absolute',
    left: 10,
    top: 10,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeFeatured: {
    backgroundColor: colors.accent,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heart: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 4,
  },
  brand: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.muted,
    fontWeight: '700',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  reviews: {
    fontSize: 12,
    color: colors.muted,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
    marginTop: 2,
  },
});
