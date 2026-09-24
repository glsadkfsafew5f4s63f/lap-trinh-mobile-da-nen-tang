import { useEffect, useState } from 'react'
import './product.css'

type CatalogType = 'categories' | 'brands' | 'colors' | 'sizes'
type Row = Record<string, unknown>
const API = import.meta.env.VITE_API_URL || 'http://localhost:7000'
const headers = () => ({ 'Content-Type': 'application/json', ...(localStorage.getItem('admin_token') ? { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } : {}) })
const config: Record<CatalogType, { title: string; id: string; name: string; fields: Record<string, string> }> = {
  categories: { title: 'Danh mục', id: 'MaDanhMuc', name: 'TenDanhMuc', fields: { TenDanhMuc: 'Tên danh mục', MoTa: 'Mô tả' } },
  brands: { title: 'Thương hiệu', id: 'MaThuongHieu', name: 'TenThuongHieu', fields: { TenThuongHieu: 'Tên thương hiệu', MoTa: 'Mô tả' } },
  colors: { title: 'Màu sắc', id: 'MaMauSac', name: 'TenMau', fields: { TenMau: 'Tên màu', MaMauHex: 'Mã màu HEX' } },
  sizes: { title: 'Kích thước', id: 'MaKichThuoc', name: 'TenKichThuoc', fields: { TenKichThuoc: 'Tên kích thước', MoTa: 'Mô tả' } },
}

export default function CatalogAdminScreen({ type }: { type: CatalogType }) {
  const current = config[type]
  const [rows, setRows] = useState<Row[]>([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Row | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const load = () => fetch(`${API}/api/admin/catalog/${type}`, { headers: headers() }).then((response) => response.ok ? response.json() : null).then((body) => setRows(Array.isArray(body?.data) ? body.data : [])).catch(() => undefined)
  useEffect(() => { void load() }, [type])
  const openEdit = (row: Row) => { setEditing(row); setName(String(row[current.name] || '')); setDescription(String(row.MoTa || '')) }
  const save = async () => { if (!name.trim()) return; const payload = type === 'colors' ? { TenMau: name, MaMauHex: description || '#5547ED' } : type === 'sizes' ? { TenKichThuoc: name, MoTa: description } : type === 'brands' ? { TenThuongHieu: name, MoTa: description } : { TenDanhMuc: name, MoTa: description }; const url = editing ? `${API}/api/admin/catalog/${type}/${editing[current.id]}` : `${API}/api/admin/catalog/${type}`; const response = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: headers(), body: JSON.stringify({ ...payload, ...(editing ? {} : { TrangThai: 1 }) }) }); if (response.ok) { setEditing(null); setName(''); setDescription(''); await load() } }
  const toggle = async (row: Row) => { const response = await fetch(`${API}/api/admin/catalog/${type}/${row[current.id]}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ TrangThai: Number(row.TrangThai) === 1 ? 0 : 1 }) }); if (response.ok) await load() }
  const filtered = rows.filter((row) => `${row[current.name] || ''} ${row.MoTa || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="product-page"><div className="product-heading"><div><small>SẢN PHẨM / {current.title.toUpperCase()}</small><h1>Quản lý {current.title.toLowerCase()}</h1><p>CRUD và trạng thái theo đúng bảng {current.title} trong schema.</p></div></div><div className="catalog-layout"><div className="catalog-editor"><h2>{editing ? `Sửa ${current.title.toLowerCase()}` : `Thêm ${current.title.toLowerCase()}`}</h2><input value={name} onChange={(event) => setName(event.target.value)} placeholder={current.fields[current.name]} />{type === 'colors' ? <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mã màu HEX" /> : <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder={current.fields.MoTa || 'Mô tả'} />}{editing && <button className="outline-action" onClick={() => { setEditing(null); setName(''); setDescription('') }}>Hủy sửa</button>}<button className="primary-action" onClick={() => void save()}>{editing ? 'Cập nhật' : 'Lưu dữ liệu'}</button></div><div className="table-card catalog-table"><div className="catalog-toolbar"><strong>{filtered.length} bản ghi</strong><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm..." /></div><table className="admin-table"><thead><tr><th>ID</th><th>Tên</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{filtered.map((row) => <tr key={String(row[current.id])}><td>#{String(row[current.id])}</td><td><strong>{String(row[current.name] || '-')}</strong></td><td>{String(row.MoTa || row.MaMauHex || '-')}</td><td>{Number(row.TrangThai) === 1 ? 'Hoạt động' : 'Tạm dừng'}</td><td><button className="table-action" onClick={() => openEdit(row)}>Sửa</button><button className="table-action" onClick={() => void toggle(row)}>{Number(row.TrangThai) === 1 ? 'Tắt' : 'Bật'}</button></td></tr>)}</tbody></table></div></div></section>
}
