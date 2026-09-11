import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CategoryCard } from '../components/CategoryCard';
import { colors } from '../constants/theme';
import { categories } from '../data/products';
import type { MainTabParamList, RootStackParamList } from './types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Category'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CategoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.list, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>KHÁM PHÁ</Text>
      <Text style={styles.title}>Danh mục</Text>
      <Text style={styles.note}>Chạm vào ảnh để xem toàn bộ sản phẩm trong từng nhóm.</Text>
      {categories.map((item) => (
        <CategoryCard
          key={item.name}
          category={item}
          variant="story"
          onPress={() => navigation.navigate('ProductList', { category: item.name })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  kicker: {
    letterSpacing: 2,
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.ink,
    marginTop: 4,
  },
  note: {
    marginTop: 8,
    marginBottom: 20,
    color: colors.muted,
    lineHeight: 20,
  },
});
