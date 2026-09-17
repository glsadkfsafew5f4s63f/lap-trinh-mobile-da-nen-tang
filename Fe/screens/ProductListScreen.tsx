import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { loadProductsFromApi, products } from '../data/products';

import { AppInput } from '../components/AppInput';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { ProductCard } from '../components/ProductCard';
import { colors } from '../constants/theme';
import {
  brands,
  categories,
  filterProducts,
  PriceSort,
} from '../data/products';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductList'>;

export default function ProductListScreen({ navigation, route }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(route.params?.category ?? '');
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState<PriceSort>('none');
  const [productList, setProductList] = useState(products);

  useEffect(() => {
    let active = true;

    loadProductsFromApi().then((data) => {
      if (active) {
        setProductList(data);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCategory(route.params?.category ?? '');
  }, [route.params?.category]);

  const items = useMemo(
    () =>
      filterProducts({
        query,
        category: category || undefined,
        brand: brand || undefined,
        sort,
      }).filter((item) => productList.some((entry) => entry.id === item.id)),
    [query, category, brand, sort, productList]
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <AppInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm theo tên hoặc thương hiệu"
          style={styles.search}
        />

        <Text style={styles.label}>DANH MỤC</Text>
        <View style={styles.chips}>
          <FilterChip label="Tất cả" active={category === ''} onPress={() => setCategory('')} />
          {categories.map((item) => (
            <FilterChip
              key={item.name}
              label={item.name}
              active={category === item.name}
              onPress={() => setCategory(item.name)}
            />
          ))}
        </View>

        <Text style={styles.label}>THƯƠNG HIỆU</Text>
        <View style={styles.chips}>
          <FilterChip label="Tất cả" active={brand === ''} onPress={() => setBrand('')} />
          {brands.map((item) => (
            <FilterChip
              key={item}
              label={item}
              active={brand === item}
              onPress={() => setBrand(item)}
            />
          ))}
        </View>

        <Text style={styles.label}>GIÁ</Text>
        <View style={styles.chips}>
          <FilterChip label="Mặc định" active={sort === 'none'} onPress={() => setSort('none')} />
          <FilterChip label="Tăng dần" active={sort === 'asc'} onPress={() => setSort('asc')} />
          <FilterChip label="Giảm dần" active={sort === 'desc'} onPress={() => setSort('desc')} />
        </View>
        <Text style={styles.count}>{items.length} sản phẩm</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="Không có sản phẩm" message="Thử đổi từ khóa hoặc bộ lọc." icon="search-outline" />
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  filters: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  search: {
    marginBottom: 12,
    borderRadius: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.muted,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  count: {
    marginBottom: 6,
    fontSize: 12,
    color: colors.muted,
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
  cell: {
    width: '50%',
  },
});
