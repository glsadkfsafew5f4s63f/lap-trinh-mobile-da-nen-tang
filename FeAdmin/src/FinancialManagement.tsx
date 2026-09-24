import { useEffect, useState } from 'react'
import './order.css'

type RecordRow = Record<string, unknown>
const API = import.meta.env.VITE_API_URL || 'http://localhost:7000'
const headers = () => ({ 'Content-Type': 'application/json', ...(localStorage.getItem('admin_token') ? { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } : {}) })
const money = (value: unknown) => `${Number(value || 0).toLocaleString('vi-VN')} đ`
const date = (value: unknown) => value ? new Date(String(value)).toLocaleString('vi-VN') : '-'

export default function FinancialManagement({ mode }: { mode: 'payments' | 'invoices' }) {
  const resource = mode === 'payments' ? 'thanhtoan' : 'hoadon'
  const [rows, setRows] = useState<RecordRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/${resource}`, { headers: headers() })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => { if (Array.isArray(body?.data)) setRows(body.data) })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [resource])

  const filtered = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()))
  const title = mode === 'payments' ? 'Quản lý thanh toán' : 'Quản lý hóa đơn'
  return <section className="order-page"><div className="order-heading"><div><small>ĐƠN HÀNG / {title.toUpperCase()}</small><h1>{title}</h1><p>Dữ liệu được lấy trực tiếp từ bảng {mode === 'payments' ? 'ThanhToan' : 'HoaDon'} theo schema.</p></div></div><div className="order-filters"><label>⌕ <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo mã đơn hoặc mã giao dịch..." /></label></div><div className="order-table-card"><div className="table-caption"><strong>{filtered.length} bản ghi</strong><span>{loading ? 'Đang đồng bộ...' : `Cập nhật từ ${mode === 'payments' ? 'ThanhToan' : 'HoaDon'}`}</span></div><table className="order-table"><thead><tr>{mode === 'payments' ? <><th>Mã thanh toán</th><th>Mã đơn</th><th>Mã giao dịch</th><th>Phương thức</th><th>Số tiền</th><th>Trạng thái</th><th>Thời gian</th></> : <><th>Mã hóa đơn</th><th>Số hóa đơn</th><th>Mã đơn</th><th>Tổng tiền</th><th>Ngày lập</th><th>Người lập</th></>}</tr></thead><tbody>{filtered.map((row, index) => mode === 'payments' ? <tr key={String(row.MaThanhToan || index)}><td>#{String(row.MaThanhToan || '-')}</td><td>#{String(row.MaDonHang || '-')}</td><td>{String(row.MaGiaoDich || '-')}</td><td>{String(row.PhuongThuc || '-')}</td><td>{money(row.SoTien)}</td><td>{String(row.TrangThai || '-')}</td><td>{date(row.ThoiGianThanhToan || row.NgayTao)}</td></tr> : <tr key={String(row.MaHoaDon || index)}><td>#{String(row.MaHoaDon || '-')}</td><td>{String(row.SoHoaDon || '-')}</td><td>#{String(row.MaDonHang || '-')}</td><td>{money(row.TongTien)}</td><td>{date(row.NgayLap)}</td><td>#{String(row.MaNguoiLap || '-')}</td></tr>)}</tbody></table></div></section>
}
