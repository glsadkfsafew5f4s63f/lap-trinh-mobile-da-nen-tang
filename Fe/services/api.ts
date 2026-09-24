import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

export type ApiProductImage = { productId?: number; url: string; isPrimary: number; order: number }
export type ApiProduct = { id: number; name: string; description: string | null; price: number; oldPrice: number | null; isNew: number; isFeatured: number; category: string; brand: string | null; images: ApiProductImage[] }
export type ApiVariant = { id: number; productId: number; colorId: number; color: string; hex: string | null; sizeId: number; size: string; sku: string; price: number; stock: number }
export type ApiUser = { id: number; name: string; email: string; phone: string; address: string; roles?: string[] }
export type OrderApiRecord = { MaDonHang: number; MaDonHangCode: string; TenNguoiNhan?: string; SoDienThoaiNhan?: string; DiaChiGiaoHang?: string; TongTien: number; GiamGia: number; PhiGiaoHang: number; ThanhTien: number; TrangThaiThanhToan: string; TrangThaiDonHang: string; NgayDat: string; NgayCapNhat?: string; items?: Array<{ MaChiTietDonHang: number; MaBienThe: number; MaSanPham: number; SKU?: string; TenMau?: string; TenKichThuoc?: string; SoLuong: number; DonGia: number }> }
export type ApiReview = { MaDanhGia: number; MaSanPham: number; HoTen: string; SoSao: number; NoiDung?: string; NgayDanhGia: string; NoiDungPhanHoi?: string }
export type ApiCart = { MaGioHang: number; items: Array<{ MaChiTietGioHang: number; MaBienThe: number; MaSanPham: number; TenSanPham: string; SKU: string; TenMau?: string; TenKichThuoc?: string; SoLuong: number; DonGia: number; AnhChinh?: string; SoLuongCoTheBan: number }>; total: number }

const metroHost = Constants.expoConfig?.hostUri?.split(':')[0]
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? `http://${metroHost || '10.0.2.2'}:7000` : 'https://your-api-domain.example.com')
const TOKEN_KEY = '@anhuyqa:api-token'

type Envelope<T> = { success: boolean; data: T; message?: string }
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY)
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } })
  const body = await response.json().catch(() => null) as T | Envelope<T> | { message?: string } | null
  if (!response.ok) throw new Error((body as { message?: string } | null)?.message || `API request failed: ${response.status}`)
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) return (body as Envelope<T>).data
  return body as T
}

export async function getApiProducts() {
  const rows = await request<Array<Record<string, unknown>>>('/api/products?limit=100')
  return rows.map((row) => ({ id: Number(row.MaSanPham), name: String(row.TenSanPham || ''), description: (row.MoTa as string) || null, price: Number(row.GiaTu ?? row.GiaBan ?? 0), oldPrice: null, isNew: 0, isFeatured: Number(row.NoiBat || 0), category: String(row.TenDanhMuc || ''), brand: row.TenThuongHieu ? String(row.TenThuongHieu) : null, images: row.AnhChinh ? [{ url: String(row.AnhChinh), isPrimary: 1, order: 1 }] : [] })) as ApiProduct[]
}

export async function getApiProductVariants(productId: number) { const detail = await request<{ variants?: Array<Record<string, unknown>> }>(`/api/products/${productId}`); return (detail.variants || []).map((row) => ({ id: Number(row.MaBienThe), productId, colorId: Number(row.MaMauSac || 0), color: String(row.TenMau || ''), hex: row.MaMauHex ? String(row.MaMauHex) : null, sizeId: Number(row.MaKichThuoc || 0), size: String(row.TenKichThuoc || ''), sku: String(row.SKU || ''), price: Number(row.GiaSauGiam ?? row.GiaBan ?? 0), stock: Number(row.SoLuongCoTheBan ?? 0) })) as ApiVariant[] }
export function checkApiHealth() { return request<{ ok: boolean; database: string }>('/health') }

type ApiUserResponse = { MaNguoiDung: number; TenDangNhap: string; HoTen: string; Email?: string; DienThoai?: string; DiaChi?: string; roles?: string[] }
function mapUser(value: ApiUserResponse): ApiUser { return { id: value.MaNguoiDung, name: value.HoTen, email: value.Email || '', phone: value.DienThoai || value.TenDangNhap, address: value.DiaChi || '', roles: value.roles } }
export async function registerApiUser(name: string, phone: string, password: string) { await request<ApiUserResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ username: phone, password, fullName: name, phone }) }); return loginApiUser(phone, password) }
export async function loginApiUser(username: string, password: string) { const response = await request<ApiUserResponse & { token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }); await AsyncStorage.setItem(TOKEN_KEY, response.token); return { success: true, data: mapUser(response) } }
export function logoutApiUser() { return AsyncStorage.removeItem(TOKEN_KEY) }

export function getApiOrders() { return request<OrderApiRecord[]>('/api/orders') }
export function getApiOrder(id: number) { return request<OrderApiRecord & { items?: OrderApiRecord['items'] }>(`/api/orders/${id}`) }
export async function createOrderApi(payload: { MaDiaChi?: number; userId?: number; name?: string; phone?: string; address?: string; PhuongThuc?: string; MaGiamGiaCode?: string; PhiGiaoHang?: number; GhiChu?: string }) {
  const addressId = payload.MaDiaChi ?? (payload.userId && payload.name && payload.phone && payload.address ? (await createAddressApi({ TenNguoiNhan: payload.name, SoDienThoai: payload.phone, DiaChiChiTiet: payload.address, LaMacDinh: 1 })).insertId : 0)
  if (!addressId) throw new Error('Thiếu địa chỉ giao hàng hợp lệ.')
  const data = await request<{ MaDonHang: number; MaDonHangCode: string }>('/api/orders', { method: 'POST', body: JSON.stringify({ MaDiaChi: addressId, PhuongThuc: payload.PhuongThuc || 'COD', MaGiamGiaCode: payload.MaGiamGiaCode, PhiGiaoHang: payload.PhiGiaoHang, GhiChu: payload.GhiChu }) })
  return { success: true, data }
}
export function createAddressApi(payload: { TenNguoiNhan: string; SoDienThoai: string; DiaChiChiTiet: string; LaMacDinh?: number }) { return request<{ insertId: number }>('/api/user/addresses', { method: 'POST', body: JSON.stringify(payload) }) }
export type ApiAddress = { MaDiaChi: number; TenNguoiNhan: string; SoDienThoai: string; DiaChiChiTiet: string; LaMacDinh: number }
export function getApiAddresses() { return request<ApiAddress[]>('/api/user/addresses') }
export function updateAddressApi(id: number, payload: Omit<ApiAddress, 'MaDiaChi'>) { return request(`/api/user/addresses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }) }

export function getApiCart() { return request<ApiCart>('/api/cart') }
export function addCartItemApi(_userId: number, variantId: number | string, quantity: number) { return request('/api/cart/items', { method: 'POST', body: JSON.stringify({ MaBienThe: Number(variantId), SoLuong: quantity }) }) }
export function updateCartItemApi(itemId: number, quantity: number) { return request(`/api/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ SoLuong: quantity }) }) }
export function removeCartItemApi(itemId: number) { return request(`/api/cart/items/${itemId}`, { method: 'DELETE' }) }

export function getApiReviews(productId: number) { return request<ApiReview[]>(`/api/reviews/product/${productId}`) }
export function createApiReview(payload: { userId: number; productId: number; orderId: number; detailId: number; stars: number; comment: string }) { return request('/api/reviews', { method: 'POST', body: JSON.stringify({ MaSanPham: payload.productId, MaDonHang: payload.orderId, MaChiTietDonHang: payload.detailId, SoSao: payload.stars, NoiDung: payload.comment }) }) }
