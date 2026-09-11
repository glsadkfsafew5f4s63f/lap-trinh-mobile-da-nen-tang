import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../components/EmptyState';
import { ProductCard } from '../components/ProductCard';
import { colors } from '../constants/theme';
import { useFavorites } from '../context/FavoriteContext';
import type { MainTabParamList, RootStackParamList } from './types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Favorite'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function FavoriteScreen({ navigation }: Props) {
  const { items } = useFavorites();
  const insets = useSafeAreaInsets();

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <EmptyState
          title="Chưa có yêu thích"
          message="Bấm trái tim trên ảnh sản phẩm để lưu lại."
          icon="heart-outline"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 12 }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>WISHLIST</Text>
            <Text style={styles.title}>Yêu thích</Text>
          </View>
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
  header: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  kicker: {
    letterSpacing: 2,
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.ink,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  cell: {
    width: '50%',
  },
});
