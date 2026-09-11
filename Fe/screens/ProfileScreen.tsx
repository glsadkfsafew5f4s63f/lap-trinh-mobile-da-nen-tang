import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { MenuRow } from '../components/MenuRow';
import { colors, radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import type { MainTabParamList, RootStackParamList } from './types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.kicker}>ATELIER MEMBER</Text>
        <Text style={styles.hero}>Tài khoản của bạn</Text>
        <Text style={styles.note}>Đăng nhập để xem đơn hàng, địa chỉ và đánh giá.</Text>
        <AppButton label="ĐĂNG NHẬP" onPress={() => navigation.navigate('Login')} />
        <View style={{ height: 10 }} />
        <AppButton label="TẠO TÀI KHOẢN" variant="outline" onPress={() => navigation.navigate('Register')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <View style={styles.avatar}>
        <Text style={styles.initial}>{user.name.slice(0, 1).toUpperCase()}</Text>
      </View>
      <Text style={styles.kicker}>XIN CHÀO</Text>
      <Text style={styles.hero}>{user.name}</Text>
      <Text style={styles.email}>{user.phone}</Text>

      <View style={styles.menu}>
        <MenuRow
          icon="person-outline"
          title="Thông tin tài khoản"
          onPress={() => navigation.navigate('AccountInfo')}
        />
        <MenuRow
          icon="location-outline"
          title="Địa chỉ giao hàng"
          onPress={() => navigation.navigate('Address')}
        />
        <MenuRow
          icon="receipt-outline"
          title="Đơn hàng của tôi"
          onPress={() => navigation.navigate('OrderList')}
        />
      </View>

      <Pressable
        style={styles.logout}
        onPress={() =>
          Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất?', [
            { text: 'Hủy' },
            { text: 'Đăng xuất', onPress: logout },
          ])
        }
      >
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  initial: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  kicker: {
    letterSpacing: 3,
    fontSize: 11,
    color: colors.muted,
    marginBottom: 8,
    fontWeight: '700',
  },
  hero: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.ink,
  },
  email: {
    marginTop: 6,
    marginBottom: 24,
    color: colors.muted,
  },
  note: {
    marginTop: 10,
    marginBottom: 24,
    color: colors.muted,
    lineHeight: 20,
  },
  menu: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  logout: {
    marginTop: 24,
    alignItems: 'center',
    padding: 12,
  },
  logoutText: {
    color: colors.accent,
    fontWeight: '700',
  },
});
