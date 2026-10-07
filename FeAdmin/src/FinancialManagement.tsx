import { useEffect, useState } from 'react'
import './order.css'
import { PaginationControls, usePaginatedRows } from './PaginationControls'

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
  const [savingId, setSavingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/api/${resource}`, { headers: headers() })
      const body = response.ok ? await response.json() : null
      if (Array.isArray(body?.data)) setRows(body.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [resource])

  const performAction = async (row: RecordRow) => {
    const orderId = Number(row.MaDonHang)
    const paymentId = Number(row.MaThanhToan)
    const prompt = 'Xác nhận đơn đã giao và nhân viên đã thu đủ tiền COD?'
    if (!window.confirm(prompt)) return

    setSavingId(paymentId)
    try {
      const response = await fetch(
        `${API}/api/admin/orders/${orderId}/payment/collect-cod`,
        {
          method: 'POST',
          headers: headers(),
          body: undefined,
        },
      )
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Không thể cập nhật thanh toán.')
      window.alert(body.message || 'Đã cập nhật thanh toán.')
      await load()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Không thể cập nhật thanh toán.')
    } finally {
      setSavingId(null)
    }
  }

  const filtered = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()))
  const pagination = usePaginatedRows(filtered, `${mode}:${query}`)
  const title = mode === 'payments' ? 'Quản lý thanh toán' : 'Quản lý hóa đơn'
  return (
    <section className="order-page">
      <div className="order-heading">
        <div>
          <small>ĐƠN HÀNG / {title.toUpperCase()}</small>
          <h1>{title}</h1>
          <p>{mode === 'payments' ? 'Xác nhận thu COD và xử lý hoàn tiền theo kết quả giao dịch.' : 'Dữ liệu được lấy trực tiếp từ bảng HoaDon theo schema.'}</p>
        </div>
      </div>
      <div className="order-filters">
        <label>⌕ <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo mã đơn hoặc mã giao dịch..." /></label>
      </div>
      <div className="order-table-card">
        <div className="table-caption">
          <strong>{filtered.length} bản ghi</strong>
          <span>{loading ? 'Đang đồng bộ...' : `Cập nhật từ ${mode === 'payments' ? 'ThanhToan' : 'HoaDon'}`}</span>
        </div>
        <table className="order-table">
          <thead>
            <tr>{mode === 'payments' ? <><th>Mã thanh toán</th><th>Mã đơn</th><th>Mã giao dịch</th><th>Phương thức</th><th>Số tiền</th><th>Trạng thái</th><th>Thời gian</th><th>Thao tác</th></> : <><th>Mã hóa đơn</th><th>Số hóa đơn</th><th>Mã đơn</th><th>Tổng tiền</th><th>Ngày lập</th><th>Người lập</th></>}</tr>
          </thead>
          <tbody>
            {pagination.pageRows.map((row, index) => mode === 'payments' ? (
              <tr key={String(row.MaThanhToan || index)}>
                <td>#{String(row.MaThanhToan || '-')}</td>
                <td>#{String(row.MaDonHang || '-')}</td>
                <td>{String(row.MaGiaoDich || '-')}</td>
                <td>{String(row.PhuongThuc || '-')}</td>
                <td>{money(row.SoTien)}</td>
                <td>{String(row.TrangThai || '-')}</td>
                <td>{date(row.ThoiGianThanhToan || row.NgayTao)}</td>
                <td>
                  {row.PhuongThuc === 'COD' && row.TrangThai === 'CHO_XU_LY' ? <button className="table-action" disabled={savingId === Number(row.MaThanhToan)} onClick={() => void performAction(row)}>Xác nhận thu COD</button> : null}
                </td>
              </tr>
            ) : (
              <tr key={String(row.MaHoaDon || index)}>
                <td>#{String(row.MaHoaDon || '-')}</td>
                <td>{String(row.SoHoaDon || '-')}</td>
                <td>#{String(row.MaDonHang || '-')}</td>
                <td>{money(row.TongTien)}</td>
                <td>{date(row.NgayLap)}</td>
                <td>#{String(row.MaNguoiLap || '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls {...pagination} onPageChange={pagination.setPage} />
      </div>
    </section>
  )
}
