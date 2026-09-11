import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Category: undefined;
  Favorite: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ProductDetail: { productId: string };
  ProductList: { category?: string } | undefined;
  Checkout: undefined;
  Login: undefined;
  Register: undefined;
  AccountInfo: undefined;
  Address: undefined;
  OrderList: undefined;
  OrderDetail: { orderId: string };
  ProductReview: { orderId: string; productId: string };
};
