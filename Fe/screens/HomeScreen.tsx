import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { CategoryCard } from '../components/CategoryCard';
import { HomeBanner } from '../components/HomeBanner';
import { HomeSearchBar } from '../components/HomeSearchBar';
import { ProductCard } from '../components/ProductCard';
import { SectionHeader } from '../components/SectionHeader';
import { colors } from '../constants/theme';
import { useCart } from '../context/CartContext';
import {
  categories,
  getFeaturedProducts,
  getNewProducts,
  loadProductsFromApi,
  products,
} from '../data/products';
import type { MainTabParamList, RootStackParamList } from './types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const [productList, setProductList] = useState(products);
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();

  useEffect(() => {
    let active = true;

    loadProductsFromApi()
      .then((data) => {
        if (active) {
          setProductList(data);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const featured = getFeaturedProducts();
  const newest = getNewProducts();

  const sourceFeatured = productList.filter((item) => item.isFeatured);
  const sourceNewest = productList.filter((item) => item.isNew);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.kicker}>THỜI TRANG</Text>
          <Text style={styles.brand}>AnHuyQA</Text>
        </View>
        <Pressable style={styles.bag} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="bag-handle-outline" size={22} color={colors.ink} />
          {itemCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <HomeSearchBar onPress={() => navigation.navigate('ProductList', {})} />
      <HomeBanner onShop={() => navigation.navigate('ProductList', {})} />

      <SectionHeader
        title="Danh mục"
        subtitle="Chọn phong cách của bạn"
        onSeeAll={() => navigation.navigate('Category')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
            variant="chip"
            onPress={() => navigation.navigate('ProductList', { category: category.name })}
          />
        ))}
      </ScrollView>

      <SectionHeader
        title="Nổi bật"
        subtitle="Được yêu thích nhất tuần này"
        onSeeAll={() => navigation.navigate('ProductList', {})}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {(sourceFeatured.length > 0 ? sourceFeatured : featured).map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            featured
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        ))}
      </ScrollView>

      <View style={styles.promo}>
        <Text style={styles.promoKicker}>FREE SHIP</Text>
        <Text style={styles.promoTitle}>Miễn phí vận chuyển đơn từ 299.000₫</Text>
        <Text style={styles.promoText}>Đổi trả 7 ngày · COD toàn quốc</Text>
      </View>

      <SectionHeader
        title="Hàng mới"
        subtitle="Vừa về kệ hôm nay"
        onSeeAll={() => navigation.navigate('ProductList', {})}
      />
      <View style={styles.grid}>
        {(sourceNewest.length > 0 ? sourceNewest : newest).map((item) => (
          <View key={item.id} style={styles.gridItem}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            />
          </View>
        ))}
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
    paddingBottom: 48,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.muted,
    fontWeight: '600',
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.ink,
    marginTop: 2,
  },
  bag: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  categories: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  promo: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: colors.ink,
    borderRadius: 22,
    padding: 22,
  },
  promoKicker: {
    color: colors.gold,
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: '700',
  },
  promoTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
    marginTop: 8,
  },
  promoText: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: 8,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  gridItem: {
    width: '50%',
  },
});
