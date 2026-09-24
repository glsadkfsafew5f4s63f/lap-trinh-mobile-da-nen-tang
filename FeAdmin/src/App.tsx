import { useEffect, useState } from 'react'
import './App.css'
import './accordion.css'
import './dashboard-data.css'
import ProductManagement from './ProductManagement'
import OrderManagement from './OrderManagement'
import FinancialManagement from './FinancialManagement'
import CustomerManagement from './CustomerManagement'
import PromotionManagement from './PromotionManagement'
import WarehouseManagement from './WarehouseManagement'
import ContactManagement from './ContactManagement'
import SystemManagement from './SystemManagement'

type Order = { MaDonHang: number; MaDonHangCode?: string; ThanhTien: number; TrangThaiDonHang: string; NgayDat: string }
type StatusCount = { status: string; total: number }
type Month = { period: string; revenue: number; orders: number }
type Category = { id: number; name: string; revenue: number }
type DashboardData = { users: number; products: number; orders: number; revenue: number; stock: { ton: number; tamgiu: number }; pendingConfirmation: number; lowStock: number; activeProducts: number; statusBreakdown: StatusCount[]; monthlyRevenue: Month[]; categoryRevenue: Category[]; recentOrders: Order[] }
type Nav = { icon: string; label: string; key: string }

const API = import.meta.env.VITE_API_URL || 'http://localhost:7000'
const emptyData: DashboardData = { users: 0, products: 0, orders: 0, revenue: 0, stock: { ton: 0, tamgiu: 0 }, pendingConfirmation: 0, lowStock: 0, activeProducts: 0, statusBreakdown: [], monthlyRevenue: [], categoryRevenue: [], recentOrders: [] }
const normalizeDashboardData = (value: Partial<DashboardData> | null | undefined): DashboardData => ({
  ...emptyData,
  ...value,
  users: Number(value?.users ?? 0),
  products: Number(value?.products ?? 0),
  orders: Number(value?.orders ?? 0),
  revenue: Number(value?.revenue ?? 0),
  pendingConfirmation: Number(value?.pendingConfirmation ?? 0),
  lowStock: Number(value?.lowStock ?? 0),
  activeProducts: Number(value?.activeProducts ?? 0),
  stock: {
    ton: Number(value?.stock?.ton ?? 0),
    tamgiu: Number(value?.stock?.tamgiu ?? 0),
  },
  statusBreakdown: Array.isArray(value?.statusBreakdown) ? value.statusBreakdown : [],
  monthlyRevenue: Array.isArray(value?.monthlyRevenue) ? value.monthlyRevenue : [],
  categoryRevenue: Array.isArray(value?.categoryRevenue) ? value.categoryRevenue : [],
  recentOrders: Array.isArray(value?.recentOrders) ? value.recentOrders : [],
})
const sections: Array<{ label: string; items: Nav[] }> = [
  { label: 'TỔNG QUAN', items: [{ icon: '▦', label: 'Tổng quan', key: 'overview' }] },
  { label: 'SẢN PHẨM', items: [{ icon: '◈', label: 'Danh sách sản phẩm', key: 'products' }, { icon: '◇', label: 'Biến thể sản phẩm', key: 'variants' }, { icon: '▤', label: 'Danh mục', key: 'categories' }, { icon: '◉', label: 'Thương hiệu', key: 'brands' }, { icon: '◌', label: 'Màu sắc', key: 'colors' }, { icon: '▱', label: 'Kích thước', key: 'sizes' }, { icon: '▧', label: 'Hình ảnh sản phẩm', key: 'images' }] },
  { label: 'ĐƠN HÀNG', items: [{ icon: '☷', label: 'Danh sách đơn hàng', key: 'orders' }, { icon: '◷', label: 'Lịch sử đơn hàng', key: 'history' }, { icon: '↯', label: 'Thanh toán', key: 'payments' }, { icon: '▣', label: 'Hóa đơn', key: 'invoices' }] },
  { label: 'KHÁCH HÀNG', items: [{ icon: '♙', label: 'Người dùng', key: 'users' }, { icon: '☆', label: 'Đánh giá', key: 'reviews' }] },
  { label: 'KHUYẾN MÃI', items: [{ icon: '⌁', label: 'Mã giảm giá', key: 'vouchers' }, { icon: '%', label: 'Chương trình giảm giá', key: 'discounts' }, { icon: 'ϟ', label: 'Flash Sale', key: 'flash-sale' }] },
  { label: 'KHO HÀNG', items: [{ icon: '▥', label: 'Tồn kho', key: 'inventory' }, { icon: '▰', label: 'Nhà cung cấp', key: 'suppliers' }, { icon: '▤', label: 'Phiếu nhập', key: 'purchase-orders' }, { icon: '⌁', label: 'Lịch sử tồn kho', key: 'stock-history' }] },
  { label: 'LIÊN HỆ', items: [{ icon: '◉', label: 'Liên hệ', key: 'contacts' }] },
  { label: 'HỆ THỐNG', items: [{ icon: '♙', label: 'Tài khoản quản trị', key: 'admin-users' }, { icon: '♜', label: 'Phân quyền', key: 'roles' }] },
]
const money = (value: number) => `${(Number(value) / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M`
const statusLabel: Record<string, string> = { CHO_XAC_NHAN: 'Chờ xác nhận', DA_XAC_NHAN: 'Đã xác nhận', DANG_CHUAN_BI: 'Đang chuẩn bị', DANG_GIAO: 'Đang giao', DA_GIAO: 'Đã giao', DA_HUY: 'Đã hủy', DA_HOAN_TIEN: 'Đã hoàn tiền' }

function AdminApp({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState('overview')
  const [range, setRange] = useState('30 ngày qua')
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => Object.fromEntries(sections.map((section) => [section.label, section.label === 'TỔNG QUAN' || section.label === 'SẢN PHẨM'])))
  useEffect(() => { const load = async () => { setLoading(true); try { const token = localStorage.getItem('admin_token'); const response = await fetch(`${API}/api/admin/dashboard`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }); if (response.ok) { const body = await response.json(); setData(normalizeDashboardData(body.data)) } } finally { setLoading(false) } }; void load() }, [])
  const title = sections.flatMap((section) => section.items).find((item) => item.key === active)?.label || 'Tổng quan'
  const productModes = ['products', 'variants', 'categories', 'brands', 'colors', 'sizes', 'images']
  const toggleGroup = (label: string) => setOpenGroups((current) => ({ ...current, [label]: !current[label] }))
  const content = productModes.includes(active) ? <ProductManagement mode={active} /> : ['orders', 'history'].includes(active) ? <OrderManagement mode={active} /> : ['payments', 'invoices'].includes(active) ? <FinancialManagement mode={active as 'payments' | 'invoices'} /> : ['users', 'reviews'].includes(active) ? <CustomerManagement mode={active} /> : ['vouchers', 'discounts', 'flash-sale'].includes(active) ? <PromotionManagement mode={active} /> : ['inventory', 'suppliers', 'purchase-orders', 'stock-history'].includes(active) ? <WarehouseManagement mode={active} /> : active === 'contacts' ? <ContactManagement /> : ['admin-users', 'roles'].includes(active) ? <SystemManagement mode={active} /> : <Dashboard data={data} range={range} setRange={setRange} setActive={setActive} />
  return <div className="admin-shell"><aside className="sidebar"><div className="brand"><b>✦</b><span><strong>FashionStore</strong><small>Quản trị thời trang</small></span></div><nav>{sections.map((section) => <div className={openGroups[section.label] ? 'nav-group' : 'nav-group collapsed'} key={section.label}><button className="nav-label" aria-expanded={openGroups[section.label]} onClick={() => toggleGroup(section.label)}>{section.label}<span>⌄</span></button><div className={openGroups[section.label] ? 'nav-items' : 'nav-items collapsed'}>{section.items.map((item) => <button className={active === item.key ? 'nav-item active' : 'nav-item'} key={item.key} onClick={() => setActive(item.key)}><i>{item.icon}</i>{item.label}</button>)}</div></div>)}</nav><button className="logout" onClick={onLogout}>↪ &nbsp;Đăng xuất</button></aside><main className="main-area"><header className="topbar"><div className="breadcrumbs">Trang chủ <span>›</span> <b>{title}</b></div><div className="top-actions"><label className="search">⌕ <input placeholder="Tìm kiếm nhanh..." /><kbd>Ctrl + K</kbd></label><button className="notify">♧<i>3</i></button><span className="divider" /><div className="profile"><b>TM</b><span><strong>Quản trị viên</strong><small>Đã xác thực từ BE</small></span>⌄</div></div></header>{content}<footer>{loading ? 'Đang đồng bộ dữ liệu...' : 'Dữ liệu được đồng bộ từ hệ thống FashionStore'} <span>•</span> Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</footer></main></div>
}

function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem('admin_token')))
  const [checking, setChecking] = useState(true)
  useEffect(() => { const token = localStorage.getItem('admin_token'); if (!token) { setChecking(false); return } fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => { const body = response.ok ? await response.json() : null; const roles = body?.data?.roles || []; if (!response.ok || (!roles.includes('ADMIN') && !roles.includes('NHAN_VIEN'))) { localStorage.removeItem('admin_token'); setAuthenticated(false) } }).catch(() => { localStorage.removeItem('admin_token'); setAuthenticated(false) }).finally(() => setChecking(false)) }, [])
  if (checking) return <div className="auth-loading">Đang xác thực tài khoản quản trị...</div>
  return authenticated ? <AdminApp onLogout={() => { localStorage.removeItem('admin_token'); setAuthenticated(false) }} /> : <AdminLogin onSuccess={() => setAuthenticated(true)} />
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false)
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitting(true); setError(''); const values = Object.fromEntries(new FormData(event.currentTarget).entries()); try { const response = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: values.username, password: values.password }) }); const body = await response.json(); if (!response.ok) throw new Error(body.message || 'Đăng nhập thất bại.'); const roles = body.data?.roles || []; if (!roles.includes('ADMIN') && !roles.includes('NHAN_VIEN')) throw new Error('Tài khoản không có quyền quản trị.'); localStorage.setItem('admin_token', body.token); onSuccess() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể kết nối máy chủ.') } finally { setSubmitting(false) } }
  return <main className="auth-page"><form className="auth-card" onSubmit={submit}><div className="auth-brand">✦ <strong>FashionStore</strong></div><small>ADMIN CONSOLE</small><h1>Đăng nhập quản trị</h1><p>Sử dụng tài khoản có vai trò ADMIN hoặc NHAN_VIEN.</p><label>Tên đăng nhập<input name="username" required autoComplete="username" /></label><label>Mật khẩu<input name="password" type="password" required autoComplete="current-password" /></label>{error && <div className="auth-error">{error}</div>}<button className="primary-action" disabled={submitting}>{submitting ? 'Đang xác thực...' : 'Đăng nhập'}</button></form></main>
}

function Dashboard({ data, range, setRange, setActive }: { data: DashboardData; range: string; setRange: (value: string) => void; setActive: (value: string) => void }) {
  const count = (key: string) => data.statusBreakdown.find((item) => item.status === key)?.total || 0
  const maxRevenue = Math.max(...data.monthlyRevenue.map((item) => Number(item.revenue)), 1)
  const cards = [['Tổng doanh thu', money(data.revenue), '▣', 'violet', 'Đơn đã giao'], ['Tổng đơn hàng', data.orders.toLocaleString('vi-VN'), '▢', 'cyan', 'Tổng hệ thống'], ['Khách hàng', data.users.toLocaleString('vi-VN'), '♧', 'green', 'Tổng hệ thống'], ['Sản phẩm', String(data.activeProducts || data.products), '♧', 'orange', 'Đang khả dụng'], ['Cần xác nhận', String(data.pendingConfirmation), '◫', 'yellow', 'Chờ xử lý'], ['Sắp hết hàng', String(data.lowStock), '△', 'red', 'Theo SKU']]
  return <><section className="page-heading"><div><small>Trang chủ <span>›</span> Tổng quan</small><h1>Tổng quan hoạt động</h1><p>Theo dõi dữ liệu kinh doanh và vận hành từ hệ thống FashionStore.</p></div><div className="heading-actions"><div className="range-tabs">{['Hôm nay', '7 ngày qua', '30 ngày qua', '12 tháng qua'].map((item) => <button className={range === item ? 'selected' : ''} key={item} onClick={() => setRange(item)}>{item}</button>)}</div><div><button className="secondary">▣ &nbsp;Tùy chọn ngày</button><button className="secondary">⇩ &nbsp;Xuất báo cáo</button></div></div></section><section className="metric-grid">{cards.map(([title, value, icon, color, note]) => <article className={`metric ${color}`} key={title}><div><span>{title}</span><b>{icon}</b></div><strong>{value}</strong><small>{note}</small></article>)}</section><section className="panel progress"><div className="panel-title"><h2>⇄ &nbsp;Tiến độ & Phân bố đơn hàng trong tháng</h2><span>Tổng cộng: <b>{data.orders.toLocaleString('vi-VN')}</b> đơn phát sinh</span></div><div className="bar"><i /><i /><i /><i /><i /></div><div className="legend">{[['CHO_XAC_NHAN', 'Chờ xác nhận'], ['DA_XAC_NHAN', 'Đã xác nhận'], ['DANG_GIAO', 'Đang giao'], ['DA_GIAO', 'Giao thành công'], ['DA_HUY', 'Đơn đã hủy']].map(([key, label]) => <span key={key}>● {label} <b>{count(key)}</b></span>)}</div></section><section className="charts"><div className="panel revenue"><div className="panel-title"><div><h2>Doanh thu & Đơn hàng theo thời gian</h2><p>Dữ liệu theo các tháng có phát sinh đơn.</p></div></div><div className="chart dynamic-chart"><div className="chart-data">{data.monthlyRevenue.length ? data.monthlyRevenue.map((item) => <div className="chart-column" key={item.period}><span style={{ height: `${Math.max(4, Number(item.revenue) / maxRevenue * 100)}%` }} /><small>{item.period.substring(5)}</small></div>) : <p className="chart-empty">Chưa có dữ liệu doanh thu</p>}</div></div><div className="chart-footer"><strong>{data.monthlyRevenue.length ? money(data.monthlyRevenue.reduce((sum, item) => sum + Number(item.revenue), 0) / data.monthlyRevenue.length) : '—'}<small>Doanh thu trung bình/tháng</small></strong><strong className="green-text">{data.monthlyRevenue.reduce((sum, item) => sum + Number(item.orders), 0)}<small>Đơn hàng trong kỳ</small></strong></div></div><div className="panel categories"><div className="panel-title"><h2>Tỷ trọng danh mục</h2><button className="period">{data.categoryRevenue.length ? 'Theo dữ liệu' : '—'}</button></div><div className="donut"><b>{money(data.revenue)}<small>DOANH SỐ</small></b></div>{data.categoryRevenue.length ? data.categoryRevenue.map((item) => <p key={item.id}>● {item.name} {money(item.revenue)}</p>) : <p>Chưa có dữ liệu danh mục</p>}</div></section><section className="bottom"><div className="panel recent"><div className="panel-title"><h2>Đơn hàng gần đây</h2><button onClick={() => setActive('orders')}>Xem tất cả →</button></div><table><thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Giá trị</th><th>Trạng thái</th></tr></thead><tbody>{data.recentOrders.length ? data.recentOrders.map((order) => <tr key={order.MaDonHang}><td><b>{order.MaDonHangCode || `DH${order.MaDonHang}`}</b></td><td>{new Date(order.NgayDat).toLocaleDateString('vi-VN')}</td><td>{Number(order.ThanhTien).toLocaleString('vi-VN')} đ</td><td><em className={order.TrangThaiDonHang.toLowerCase()}>{statusLabel[order.TrangThaiDonHang] || order.TrangThaiDonHang}</em></td></tr>) : <tr><td colSpan={4}>Chưa có đơn hàng</td></tr>}</tbody></table></div><div className="panel inventory"><div className="panel-title"><h2>Tình trạng kho</h2><button onClick={() => setActive('inventory')}>Chi tiết →</button></div><strong>{data.stock.ton.toLocaleString('vi-VN')}</strong><span>sản phẩm đang có sẵn</span><div className="stock"><i /></div><p>● Có thể bán <b>{Math.max(data.stock.ton - data.stock.tamgiu, 0)}</b></p><p>● Đang tạm giữ <b>{data.stock.tamgiu}</b></p></div></section></>
}

export default App
