import { useEffect, useState } from 'react'
import './customer.css'

type Review = { MaDanhGia: number; HoTen?: string; TenSanPham?: string; SoSao: number; NoiDung?: string; TrangThai: number; NoiDungPhanHoi?: string }
const API = import.meta.env.VITE_API_URL || 'http://localhost:7000'
const headers = () => ({ 'Content-Type': 'application/json', ...(localStorage.getItem('admin_token') ? { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } : {}) })

export default function ReviewAdminScreen() {
  const [rows, setRows] = useState<Review[]>([]); const [query, setQuery] = useState('')
  const load = () => fetch(`${API}/api/admin/reviews`, { headers: headers() }).then((response) => response.ok ? response.json() : null).then((body) => setRows(Array.isArray(body?.data) ? body.data : [])).catch(() => undefined)
  useEffect(() => { void load() }, [])
  const toggle = async (row: Review) => { const response = await fetch(`${API}/api/admin/reviews/${row.MaDanhGia}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ TrangThai: row.TrangThai ? 0 : 1 }) }); if (response.ok) await load() }
  const reply = async (row: Review) => { const value = window.prompt('Nội dung phản hồi', row.NoiDungPhanHoi || ''); if (value === null) return; const response = await fetch(`${API}/api/admin/reviews/${row.MaDanhGia}/reply`, { method: 'PUT', headers: headers(), body: JSON.stringify({ NoiDungPhanHoi: value }) }); if (response.ok) await load() }
  const filtered = rows.filter((row) => `${row.HoTen || ''} ${row.TenSanPham || ''} ${row.NoiDung || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="customer-page"><div className="customer-heading"><div><small>KHÁCH HÀNG / ĐÁNH GIÁ</small><h1>Duyệt đánh giá</h1><p>Ẩn/hiện và phản hồi đánh giá theo bảng DanhGia.</p></div></div><div className="customer-filters"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm khách hàng, sản phẩm hoặc nội dung..." /></div><table className="customer-table"><thead><tr><th>Khách hàng</th><th>Sản phẩm</th><th>Số sao</th><th>Nội dung</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.MaDanhGia}><td>{row.HoTen || '-'}</td><td>{row.TenSanPham || '-'}</td><td>{row.SoSao}/5</td><td>{row.NoiDung || '-'}</td><td>{row.TrangThai ? 'Đang hiển thị' : 'Đã ẩn'}</td><td><button className="table-action" onClick={() => void toggle(row)}>{row.TrangThai ? 'Ẩn' : 'Duyệt'}</button><button className="table-action" onClick={() => void reply(row)}>Phản hồi</button></td></tr>)}</tbody></table></section>
}
