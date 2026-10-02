import { useEffect, useState } from 'react'
import './order.css'

type ReturnRequest = {
  MaYeuCauTraHang: number
  MaDonHang: number
  MaDonHangCode: string
  TenKhachHang: string
  DienThoai?: string
  ThanhTien: number
  PhuongThuc: string
  TrangThai: 'CHO_DUYET' | 'DA_DUYET' | 'DA_NHAN_HANG' | 'TU_CHOI' | 'DA_HOAN_TIEN'
  LyDo: string
  GhiChuXuLy?: string | null
  NgayTao: string
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:7000'
const statusNames: Record<ReturnRequest['TrangThai'], string> = {
  CHO_DUYET: 'Chờ duyệt',
  DA_DUYET: 'Đã duyệt, chờ hàng trả',
  DA_NHAN_HANG: 'Đã nhận hàng',
  TU_CHOI: 'Từ chối',
  DA_HOAN_TIEN: 'Đã hoàn tiền',
}
const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`
const date = (value: string) => new Date(value).toLocaleString('vi-VN')
const headers = () => ({ 'Content-Type': 'application/json', ...(localStorage.getItem('admin_token') ? { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } : {}) })

export default function ReturnManagement() {
  const [rows, setRows] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API}/api/admin/return-requests`, { headers: headers() })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Không thể tải yêu cầu trả hàng.')
      setRows(Array.isArray(body.data) ? body.data : [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải yêu cầu trả hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const update = async (row: ReturnRequest, next: 'DA_DUYET' | 'TU_CHOI' | 'DA_NHAN_HANG') => {
    let note = ''
    if (next === 'TU_CHOI') {
      const value = window.prompt('Nhập lý do từ chối yêu cầu:')
      if (value === null) return
      note = value.trim()
      if (!note) return window.alert('Vui lòng nhập lý do từ chối.')
    } else if (!window.confirm(next === 'DA_DUYET' ? 'Duyệt yêu cầu trả toàn bộ đơn hàng này?' : 'Xác nhận cửa hàng đã thực sự nhận và kiểm tra hàng trả?')) {
      return
    }
    setSavingId(row.MaYeuCauTraHang)
    try {
      const response = await fetch(`${API}/api/admin/return-requests/${row.MaYeuCauTraHang}/status`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ TrangThai: next, GhiChuXuLy: note || undefined }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Không thể cập nhật yêu cầu.')
      await load()
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'Không thể cập nhật yêu cầu.')
    } finally {
      setSavingId(null)
    }
  }

  const refund = async (row: ReturnRequest) => {
    const prompt = row.PhuongThuc === 'MOMO'
      ? 'Gửi yêu cầu hoàn giao dịch MoMo này? Chỉ tiếp tục sau khi đã nhận và kiểm tra hàng trả.'
      : 'Xác nhận đã nhận hàng trả và đã thực sự chuyển tiền hoàn cho khách?'
    if (!window.confirm(prompt)) return
    setSavingId(row.MaYeuCauTraHang)
    try {
      const response = await fetch(`${API}/api/admin/orders/${row.MaDonHang}/refund`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ DaNhanHangHoan: true, XacNhanDaChuyenTien: row.PhuongThuc !== 'MOMO', LyDo: row.LyDo }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Không thể hoàn tiền.')
      window.alert(body.message || 'Đã hoàn tiền.')
      await load()
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'Không thể hoàn tiền.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="order-page">
      <div className="order-heading">
        <div>
          <small>ĐƠN HÀNG / TRẢ HÀNG</small>
          <h1>Yêu cầu trả hàng</h1>
          <p>Duyệt yêu cầu, xác nhận hàng đã về cửa hàng rồi mới xử lý hoàn tiền.</p>
        </div>
        <button className="outline-action" onClick={() => void load()} disabled={loading}>↻ Làm mới</button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <div className="order-table-card">
        <div className="table-caption">
          <strong>{rows.length} yêu cầu</strong>
          <span>{loading ? 'Đang đồng bộ...' : 'Ưu tiên yêu cầu đang chờ xử lý'}</span>
        </div>
        <table className="order-table">
          <thead><tr><th>Yêu cầu / ngày tạo</th><th>Khách hàng</th><th>Đơn hàng</th><th>Lý do</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.MaYeuCauTraHang}>
                <td>#{row.MaYeuCauTraHang}<small>{date(row.NgayTao)}</small></td>
                <td><strong>{row.TenKhachHang}</strong><small>{row.DienThoai || '-'}</small></td>
                <td><strong>#{row.MaDonHangCode}</strong><small>{money(row.ThanhTien)}</small></td>
                <td>{row.LyDo}{row.GhiChuXuLy ? <small>Phản hồi: {row.GhiChuXuLy}</small> : null}</td>
                <td>{row.PhuongThuc}</td>
                <td><span className={`status-pill ${row.TrangThai}`}>{statusNames[row.TrangThai]}</span></td>
                <td>
                  {savingId === row.MaYeuCauTraHang ? 'Đang xử lý...' : <>
                    {row.TrangThai === 'CHO_DUYET' ? <><button className="table-action" onClick={() => void update(row, 'DA_DUYET')}>Duyệt</button> <button className="table-action" onClick={() => void update(row, 'TU_CHOI')}>Từ chối</button></> : null}
                    {row.TrangThai === 'DA_DUYET' ? <button className="table-action" onClick={() => void update(row, 'DA_NHAN_HANG')}>Đã nhận hàng</button> : null}
                    {row.TrangThai === 'DA_NHAN_HANG' ? <button className="table-action" onClick={() => void refund(row)}>Hoàn tiền</button> : null}
                  </>}
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 ? <tr><td colSpan={7}>Chưa có yêu cầu trả hàng.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
