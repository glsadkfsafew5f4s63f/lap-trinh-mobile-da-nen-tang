import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { QuantityStepper } from '../components/QuantityStepper';
import { colors, radius, shadow } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import type { MainTabParamList, RootStackParamList } from './types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Cart'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CartScreen({ navigation }: Props) {
  const { items, total, increase, decrease, remove } = useCart();
  const insets = useSafeAreaInsets();

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <EmptyState
          title="Giỏ hàng trống"
          message="Chọn màu, size rồi thêm sản phẩm từ trang chi tiết."
          icon="bag-handle-outline"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
          keyExtractor={(item) => `${item.id}-${item.colorIndex}-${item.sizeIndex}`}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 12 }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>GIỎ HÀNG</Text>
            <Text style={styles.title}>{items.length} sản phẩm</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, shadow.card]}>
            <Pressable onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
              <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
            </Pressable>
            <View style={styles.info}>
              <Text style={styles.brand}>{item.brand.toUpperCase()}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.colors[item.colorIndex]?.name} · {item.sizes[item.sizeIndex]} · {formatPrice(item.price)}
              </Text>
              <View style={styles.actions}>
                <QuantityStepper
                  quantity={item.quantity}
                  onIncrease={() => increase(item.id, item.colorIndex, item.sizeIndex)}
                  onDecrease={() => decrease(item.id, item.colorIndex, item.sizeIndex)}
                />
                <Pressable
                  onPress={() =>
                    Alert.alert('Xóa sản phẩm', `Xóa ${item.name} khỏi giỏ?`, [
                      { text: 'Hủy' },
                      {
                        text: 'Xóa',
                        style: 'destructive',
                        onPress: () => remove(item.id, item.colorIndex, item.sizeIndex),
                      },
                    ])
                  }
                >
                  <Ionicons name="trash-outline" size={20} color={colors.accent} />
                </Pressable>
              </View>
            </View>
            <Text style={styles.price}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
          <Text style={styles.total}>{formatPrice(total)}</Text>
        </View>
        <Pressable style={styles.checkout} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutText}>THANH TOÁN</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    marginBottom: 8,
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
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  row: {
    backgroundColor: colors.surface,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    borderRadius: radius.md,
  },
  image: {
    width: 96,
    height: 128,
    borderRadius: 12,
    backgroundColor: '#EDE6DC',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  brand: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
    fontWeight: '700',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  meta: {
    fontSize: 13,
    color: colors.muted,
  },
  actions: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  totalLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.muted,
  },
  total: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 4,
  },
  checkout: {
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: radius.md,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 12,
  },
});
