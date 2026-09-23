import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ApiProductImage = {
  url: string;
  isPrimary: number;
  order: number;
};

export type ApiProduct = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  isNew: number;
  isFeatured: number;
  category: string;
  brand: string | null;
  images: ApiProductImage[];
};

export type ApiVariant = {
  id: number;
  productId: number;
  colorId: number;
  color: string;
  hex: string | null;
  sizeId: number;
  size: string;
  sku: string;
  price: number;
  stock: number;
};

export type ApiReview = {
  id: number;
  productId: number;
  userId: number;
  orderId?: number | null;
  stars: number;
  comment: string;
  author: string;
  date: string;
  status?: string;
  reply?: string | null;
};

export type ChatMessage = {
  id: number;
  userId: number;
  sender: 'NguoiDung' | 'Admin';
  message: string;
  isRead: number;
  date: string;
};

export type ApiUser = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__
    ? Platform.OS === 'android'
      ? 'http://10.0.2.2:7000'
      : 'http://localhost:7000'
    : 'https://your-api-domain.example.com');

  export const CHAT_SOCKET_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws';

  export const AUTH_TOKEN_STORAGE_KEY = '@anhuyqa:token';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getApiProducts() {
  return request<{ success: boolean; data: Array<Record<string, unknown>> }>('/api/products').then((body) =>
    (body.data ?? []).map((item) => ({
      id: Number(item.MaSanPham),
      name: String(item.TenSanPham ?? ''),
      description: item.MoTa ? String(item.MoTa) : null,
      price: Number(item.Gia ?? 0),
      oldPrice: item.GiaCu == null ? null : Number(item.GiaCu),
      isNew: Number(item.SanPhamMoi ?? 0),
      isFeatured: Number(item.NoiBat ?? 0),
      category: String(item.MaDanhMuc ?? ''),
      brand: item.MaThuongHieu == null ? null : String(item.MaThuongHieu),
      images: [],
    }))
  );
}

export function getApiProductVariants(productId: number) {
  return request<{ success: boolean; data: ApiVariant[] }>(`/api/products/${productId}/variants`).then((body) => body.data ?? []);
}

export function getApiProductById(productId: number) {
  return request<{ success: boolean; data: ApiProduct }>(`/api/products/${productId}`).then((body) => body.data);
}

export function getApiReviews(productId: number) {
  return request<{ success: boolean; data: ApiReview[] }>(`/api/danhgia/product/${productId}`).then((body) => body.data ?? []);
}

export function createApiReview(input: {
  userId: number;
  productId: number;
  orderId: number;
  stars: number;
  comment: string;
}) {
  return request<{ success: boolean; data?: { insertId: number } }>('/api/danhgia/verified', {
    method: 'POST',
    body: JSON.stringify({
      MaNguoiDung: input.userId,
      MaSanPham: input.productId,
      MaDonHang: input.orderId,
      SoSao: input.stars,
      NoiDung: input.comment,
    }),
  });
}

export function checkApiHealth() {
  return request<{ ok: boolean; database: string }>('/health');
}

export function registerApiUser(name: string, phone: string, password: string) {
  return request<{ success: boolean; data: ApiUser; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, phone, password }),
  });
}

export function loginApiUser(phone: string, password: string) {
  return request<{ success: boolean; data: ApiUser; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export type FavoriteApiRecord = {
  MaYeuThich?: number;
  MaNguoiDung: number;
  MaSanPham: number;
  NgayThem?: string;
};

export function getApiFavorites(userId: number) {
  return request<{ success: boolean; data: FavoriteApiRecord[] }>('/api/yeuthich').then((body) => {
    const rows = body.data ?? [];
    return rows.filter((item) => Number(item.MaNguoiDung) === userId);
  });
}

export function toggleFavoriteApi(userId: number, productId: number, isFavorite: boolean) {
  if (isFavorite) {
    return request<{ success: boolean; message?: string }>(`/api/yeuthich/${productId}`, {
      method: 'DELETE',
    });
  }

  return request<{ success: boolean; data?: FavoriteApiRecord }>('/api/yeuthich', {
    method: 'POST',
    body: JSON.stringify({ MaNguoiDung: userId, MaSanPham: productId }),
  });
}

export type CartApiRecord = {
  MaGioHang?: number;
  MaNguoiDung: number;
  MaBienThe?: number;
  SoLuong?: number;
  id?: number;
};

export function getApiCart(userId: number) {
  return request<{ success: boolean; data: CartApiRecord[] }>('/api/cart').then((body) => {
    const rows = body.data ?? [];
    return rows.filter((item) => Number(item.MaNguoiDung) === userId);
  });
}

export function addCartItemApi(userId: number, productId: string, quantity: number) {
  return request<{ success: boolean; data?: CartApiRecord }>('/api/cart', {
    method: 'POST',
    body: JSON.stringify({
      MaNguoiDung: userId,
      MaSanPham: Number(productId),
      SoLuong: Number(quantity),
    }),
  });
}

export function updateCartItemApi(userId: number, itemId: number, quantity: number) {
  return request<{ success: boolean; data?: CartApiRecord }>(`/api/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ MaNguoiDung: userId, SoLuong: Number(quantity) }),
  });
}

export function removeCartItemApi(itemId: number) {
  return request<{ success: boolean; message?: string }>(`/api/cart/${itemId}`, {
    method: 'DELETE',
  });
}

export type OrderApiRecord = {
  MaDonHang?: number;
  MaNguoiDung: number;
  HoTenNguoiNhan: string;
  SoDienThoaiNguoiNhan: string;
  DiaChiGiaoHang: string;
  TongTien?: number;
  PhiVanChuyen?: number;
  TienCoc?: number;
  TienConLai?: number;
  TrangThaiThanhToan?: string;
  items?: Array<{
    MaBienThe: number;
    MaSanPham: number;
    SKU?: string;
    TenSanPham: string;
    Mau?: string;
    KichThuoc?: string;
    SoLuong: number;
    DonGia: number;
  }>;
  PhuongThucThanhToan?: string;
  TrangThai?: string;
  NgayDat?: string;
};

export function getApiOrders(userId: number) {
  return request<{ success: boolean; data: OrderApiRecord[] }>('/api/orders').then((body) => {
    const rows = body.data ?? [];
    return rows.filter((item) => Number(item.MaNguoiDung) === userId);
  });
}

export function createOrderApi(input: {
  MaNguoiDung: number;
  HoTenNguoiNhan: string;
  SoDienThoaiNguoiNhan: string;
  DiaChiGiaoHang: string;
  TongTien: number;
  PhiVanChuyen: number;
  PhuongThucThanhToan?: string;
  TienCoc: number;
  TienConLai: number;
  TrangThaiThanhToan: 'ChuaCoc' | 'DaCoc' | 'DaThanhToan';
  items: Array<{
    variantId: number;
    productId: string;
    quantity: number;
    price: number;
    color: string;
    size: string;
    name: string;
  }>;
}) {
  return request<{ success: boolean; data?: OrderApiRecord & { insertId?: number } }>('/api/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({
      MaNguoiDung: input.MaNguoiDung,
      HoTenNguoiNhan: input.HoTenNguoiNhan,
      SoDienThoaiNguoiNhan: input.SoDienThoaiNguoiNhan,
      DiaChiGiaoHang: input.DiaChiGiaoHang,
      TongTien: Number(input.TongTien),
      PhiVanChuyen: Number(input.PhiVanChuyen),
      PhuongThucThanhToan: input.PhuongThucThanhToan || 'COD',
      TienCoc: Number(input.TienCoc),
      TienConLai: Number(input.TienConLai),
      TrangThaiThanhToan: input.TrangThaiThanhToan,
      items: input.items.map((item) => ({
        MaBienThe: item.variantId,
        MaSanPham: Number(item.productId),
        TenSanPham: item.name,
        Mau: item.color,
        KichThuoc: item.size,
        SoLuong: item.quantity,
        DonGia: item.price,
      })),
    }),
  });
}

export function getChatMessages(userId: number) {
  return request<{ success: boolean; data: ChatMessage[] }>(`/api/chat/${userId}`).then((body) => body.data ?? []);
}

export function sendChatMessage(userId: number, sender: ChatMessage['sender'], message: string) {
  return request<{ success: boolean }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ userId, sender, message }),
  });
}