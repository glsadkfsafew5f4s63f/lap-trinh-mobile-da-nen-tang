import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

export type ApiProductImage = { productId?: number; url: string; isPrimary: number; order: number }
export type ApiProduct = { id: number; name: string; description: string | null; price: number; oldPrice: number | null; isNew: number; isFeatured: number; category: string; brand: string | null; rating: number; reviewCount: number; images: ApiProductImage[] }
export type ApiVariant = { id: number; productId: number; colorId: number; color: string; hex: string | null; sizeId: number; size: string; sku: string; price: number; stock: number }
export type ApiUser = { id: number; name: string; email: string; phone: string; address: string; roles?: string[] }
export type OrderApiRecord = { MaDonHang: number; MaDonHangCode: string; TenNguoiNhan?: string; SoDienThoaiNhan?: string; DiaChiGiaoHang?: string; TongTien: number; GiamGia: number; PhiGiaoHang: number; ThanhTien: number; PhuongThuc?: string; TrangThaiThanhToan: string; TrangThaiDonHang: string; NgayDat: string; NgayCapNhat?: string; items?: Array<{ MaChiTietDonHang: number; MaBienThe: number | null; MaSanPham: number | null; TenSanPham?: string; SKU?: string; TenMau?: string; TenKichThuoc?: string; SoLuong: number; DonGia: number; DaDanhGia?: number | boolean }>; payments?: Array<{ MaThanhToan: number; PhuongThuc: string; LanThu: number; SoTien: number; TrangThai: string }> }
export type ApiReview = { MaDanhGia: number; MaSanPham: number; HoTen: string; SoSao: number; NoiDung?: string; NgayDanhGia: string; NoiDungPhanHoi?: string }
export type ApiCart = { MaGioHang: number; items: Array<{ MaChiTietGioHang: number; MaBienThe: number; MaSanPham: number; TenSanPham: string; SKU: string; TenMau?: string; TenKichThuoc?: string; SoLuong: number; DonGia: number; AnhChinh?: string; SoLuongCoTheBan: number }>; total: number }

const metroHost = Constants.expoConfig?.hostUri?.split(':')[0]
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '')
export const API_BASE_URL = configuredApiUrl || (__DEV__ ? `http://${metroHost || '10.0.2.2'}:7000` : '')
const TOKEN_KEY = '@anhuyqa:api-token'

type Envelope<T> = { success: boolean; data: T; message?: string }
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) throw new Error('Thiếu EXPO_PUBLIC_API_URL cho bản phát hành.')
  const token = await AsyncStorage.getItem(TOKEN_KEY)
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } })
  const body = await response.json().catch(() => null) as T | Envelope<T> | { message?: string } | null
  if (!response.ok) throw new Error((body as { message?: string } | null)?.message || `API request failed: ${response.status}`)
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    const envelope = body as Envelope<T> & { token?: string }
    if (envelope.token && envelope.data && typeof envelope.data === 'object') {
      return { ...envelope.data, token: envelope.token } as T
    }
    return envelope.data
  }
  return body as T
}

export async function getApiProducts() {
  const rows: Array<Record<string, unknown>> = []
  let page = 1
  let pageRows: Array<Record<string, unknown>> = []
  do {
    pageRows = await request<Array<Record<string, unknown>>>(`/api/products?page=${page}&limit=100`)
    rows.push(...pageRows)
    page += 1
  } while (pageRows.length === 100)
  return rows.map((row) => ({
    id: Number(row.MaSanPham),
    name: String(row.TenSanPham || ''),
    description: (row.MoTa as string) || null,
    price: Number(row.GiaTu ?? row.GiaBan ?? 0),
    oldPrice: null,
    isNew: row.NgayTao ? Date.now() - new Date(String(row.NgayTao)).getTime() < 30 * 86400000 ? 1 : 0 : 0,
    isFeatured: Number(row.NoiBat || 0),
    category: String(row.TenDanhMuc || ''),
    brand: row.TenThuongHieu ? String(row.TenThuongHieu) : null,
    rating: Number(row.DiemTrungBinh || 0),
    reviewCount: Number(row.SoDanhGia || 0),
    images: row.AnhChinh ? [{ url: String(row.AnhChinh), isPrimary: 1, order: 1 }] : [],
  })) as ApiProduct[]
}

export function getApiProductDetail(productId: number) { return request<Record<string, unknown> & { variants?: Array<Record<string, unknown>>; images?: Array<Record<string, unknown>> }>(`/api/products/${productId}`) }
export async function getApiProductBundle(productId: number) {
  const detail = await getApiProductDetail(productId)
  const variants = (detail.variants || []).map((row) => ({ id: Number(row.MaBienThe), productId, colorId: Number(row.MaMauSac || 0), color: String(row.TenMau || ''), hex: row.MaMauHex ? String(row.MaMauHex) : null, sizeId: Number(row.MaKichThuoc || 0), size: String(row.TenKichThuoc || ''), sku: String(row.SKU || ''), price: Number(row.GiaSauGiam ?? row.GiaBan ?? 0), stock: Number(row.SoLuongCoTheBan ?? 0) })) as ApiVariant[]
  const images = (detail.images || []).map((row) => ({ url: String(row.DuongDanAnh || ''), isPrimary: Number(row.LaAnhChinh || 0), order: Number(row.ThuTu || 0) })).filter((image) => image.url)
  return { product: detail, variants, images }
}
export async function getApiProductVariants(productId: number) { return (await getApiProductBundle(productId)).variants }
export async function getApiCategories(): Promise<Array<Record<string, unknown> & { TenDanhMuc?: string; HinhAnh: string }>> {
  const rows = await request<Array<Record<string, unknown>>>('/api/catalog/categories')
  return rows.map((row): Record<string, unknown> & { TenDanhMuc?: string; HinhAnh: string } => {
    const image = String(row.HinhAnh || '')
    return { ...row, HinhAnh: image && !/^https?:\/\//i.test(image) ? `${API_BASE_URL}/${image.replace(/^\/+/, '')}` : image }
  })
}
export function getApiBrands() { return request<Array<Record<string, unknown>>>('/api/catalog/brands') }
export function checkApiHealth() { return request<{ success: boolean; message: string }>('/health') }

type ApiUserResponse = { MaNguoiDung: number; TenDangNhap: string; HoTen: string; Email?: string; DienThoai?: string; DiaChi?: string; roles?: string[] }
function mapUser(value: ApiUserResponse): ApiUser { return { id: value.MaNguoiDung, name: value.HoTen, email: value.Email || '', phone: value.DienThoai || value.TenDangNhap, address: value.DiaChi || '', roles: value.roles } }
export async function registerApiUser(name: string, phone: string, password: string) {
  const response = await request<ApiUserResponse & { token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ username: phone, password, fullName: name, phone }) })
  await AsyncStorage.setItem(TOKEN_KEY, response.token)
  return { success: true, data: mapUser(response) }
}
export async function loginApiUser(username: string, password: string) { const response = await request<ApiUserResponse & { token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }); await AsyncStorage.setItem(TOKEN_KEY, response.token); return { success: true, data: mapUser(response) } }
export async function getApiCurrentUser() {
  if (!await AsyncStorage.getItem(TOKEN_KEY)) return null
  const response = await request<ApiUserResponse>('/api/auth/me')
  return mapUser(response)
}
export function logoutApiUser() { return AsyncStorage.removeItem(TOKEN_KEY) }
export function updateApiUser(payload: { HoTen: string; Email?: string; DienThoai?: string }) { return request<ApiUserResponse>('/api/user/profile', { method: 'PUT', body: JSON.stringify(payload) }) }

export function getApiOrders() { return request<OrderApiRecord[]>('/api/orders') }
export function getApiOrder(id: number) { return request<OrderApiRecord & { items?: OrderApiRecord['items'] }>(`/api/orders/${id}`) }
export function getCheckoutConfigApi() { return request<{ PhiGiaoHang: number }>('/api/orders/checkout-config') }
export type ApiCheckoutQuote = { TongTien: number; GiamGia: number; PhiGiaoHang: number; ThanhTien: number }
export function getApiCheckoutQuote(code?: string) { return request<ApiCheckoutQuote>('/api/orders/quote', { method: 'POST', body: JSON.stringify({ code: code?.trim() || undefined }) }) }
export async function createOrderApi(payload: { MaDiaChi: number; PhuongThuc: string; MaGiamGiaCode?: string; GhiChu?: string }) {
  const data = await request<{ MaDonHang: number; MaDonHangCode: string; TongTien: number; GiamGia: number; PhiGiaoHang: number; ThanhTien: number; TrangThaiDonHang: string }>('/api/orders', { method: 'POST', body: JSON.stringify(payload) })
  return { success: true, data }
}
export function previewVoucherApi(code: string, subtotal: number) { return request<{ MaCode: string; GiamGia: number; TongSauGiam: number }>('/api/orders/voucher/preview', { method: 'POST', body: JSON.stringify({ code, subtotal }) }) }
export function cancelOrderApi(id: number) { return request<{ message: string }>(`/api/orders/${id}/cancel`, { method: 'PUT' }) }
export function retryPaymentApi(orderId: number, method: string) { return request<{ MaThanhToan: number; LanThu: number; SoTien: number; PhuongThuc: string }>(`/api/payments/${orderId}/retry`, { method: 'POST', body: JSON.stringify({ PhuongThuc: method }) }) }
export function createAddressApi(payload: { TenNguoiNhan: string; SoDienThoai: string; DiaChiChiTiet: string; PhuongXa?: string; QuanHuyen?: string; TinhThanh?: string; LaMacDinh?: number }) { return request<{ insertId: number }>('/api/user/addresses', { method: 'POST', body: JSON.stringify(payload) }) }
export type ApiAddress = { MaDiaChi: number; TenNguoiNhan: string; SoDienThoai: string; DiaChiChiTiet: string; PhuongXa?: string; QuanHuyen?: string; TinhThanh?: string; LaMacDinh: number }
export function getApiAddresses() { return request<ApiAddress[]>('/api/user/addresses') }
export function updateAddressApi(id: number, payload: Omit<ApiAddress, 'MaDiaChi'>) { return request(`/api/user/addresses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }) }
export function deleteAddressApi(id: number) { return request(`/api/user/addresses/${id}`, { method: 'DELETE' }) }

export function getApiCart() { return request<ApiCart>('/api/cart') }
export function addCartItemApi(_userId: number, variantId: number | string, quantity: number) { return request('/api/cart/items', { method: 'POST', body: JSON.stringify({ MaBienThe: Number(variantId), SoLuong: quantity }) }) }
export function updateCartItemApi(itemId: number, quantity: number) { return request(`/api/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ SoLuong: quantity }) }) }
export function removeCartItemApi(itemId: number) { return request(`/api/cart/items/${itemId}`, { method: 'DELETE' }) }

export function getApiReviews(productId: number) { return request<ApiReview[]>(`/api/reviews/product/${productId}`) }
export function createApiReview(payload: { userId: number; productId: number; orderId: number; detailId: number; stars: number; comment: string }) { return request('/api/reviews', { method: 'POST', body: JSON.stringify({ MaSanPham: payload.productId, MaDonHang: payload.orderId, MaChiTietDonHang: payload.detailId, SoSao: payload.stars, NoiDung: payload.comment }) }) }
