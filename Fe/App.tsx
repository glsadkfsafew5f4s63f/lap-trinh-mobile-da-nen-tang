import 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from './constants/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { OrderProvider } from './context/OrderContext';
import { ReviewProvider } from './context/ReviewContext';
import AccountInfoScreen from './screens/AccountInfoScreen';
import AddressScreen from './screens/AddressScreen';
import CartScreen from './screens/CartScreen';
import ChatScreen from './screens/ChatScreen';
import CategoryScreen from './screens/CategoryScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import FavoriteScreen from './screens/FavoriteScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';
import OrderListScreen from './screens/OrderListScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductReviewScreen from './screens/ProductReviewScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import type { MainTabParamList, RootStackParamList } from './screens/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: '#A39B92',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{
          title: 'Yêu thích',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Giỏ hàng',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, fontSize: 11 },
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'bag-handle' : 'bag-handle-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Tư vấn',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <FavoriteProvider>
            <ReviewProvider>
            <OrderProvider>
              <NavigationContainer>
                <StatusBar style="dark" />
                <AuthenticatedNavigator />
              </NavigationContainer>
            </OrderProvider>
            </ReviewProvider>
            </FavoriteProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AuthenticatedNavigator() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={user ? 'authenticated' : 'guest'}
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '600', fontSize: 15 },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Sản phẩm' }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Đặt hàng' }} />
          <Stack.Screen name="AccountInfo" component={AccountInfoScreen} options={{ title: 'Thông tin tài khoản' }} />
          <Stack.Screen name="Address" component={AddressScreen} options={{ title: 'Địa chỉ' }} />
          <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: 'Đơn hàng' }} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Chi tiết đơn hàng' }} />
          <Stack.Screen name="ProductReview" component={ProductReviewScreen} options={{ title: 'Đánh giá sản phẩm' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Sản phẩm' }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
