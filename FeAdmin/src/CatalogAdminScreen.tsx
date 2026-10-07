import { useEffect, useState } from 'react';
import './product.css';
import { PaginationControls, usePaginatedRows } from './PaginationControls';

type CatalogType = 'categories' | 'brands' | 'colors' | 'sizes';
type Row = Record<string, unknown>;
const API = import.meta.env.VITE_API_URL || 'http://localhost:7000';
const headers = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('admin_token')
    ? { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
    : {}),
});
const config: Record<
  CatalogType,
  { title: string; id: string; name: string; fields: Record<string, string> }
> = {
  categories: {
    title: 'Danh mục',
    id: 'MaDanhMuc',
    name: 'TenDanhMuc',
    fields: { TenDanhMuc: 'Tên danh mục', MoTa: 'Mô tả' },
  },
  brands: {
    title: 'Thương hiệu',
    id: 'MaThuongHieu',
    name: 'TenThuongHieu',
    fields: { TenThuongHieu: 'Tên thương hiệu', MoTa: 'Mô tả' },
  },
  colors: {
    title: 'Màu sắc',
    id: 'MaMauSac',
    name: 'TenMau',
    fields: { TenMau: 'Tên màu', MaMauHex: 'Mã màu HEX' },
  },
  sizes: {
    title: 'Kích thước',
    id: 'MaKichThuoc',
    name: 'TenKichThuoc',
    fields: { TenKichThuoc: 'Tên kích thước', MoTa: 'Mô tả' },
  },
};
const validRows = (type: CatalogType, value: unknown): Row[] => {
  if (!Array.isArray(value)) return [];
  const { id, name } = config[type];
  return value.filter((candidate): candidate is Row => {
    if (!candidate || typeof candidate !== 'object') return false;
    const row = candidate as Row;
    const key = Number(row[id]);
    return Number.isInteger(key) && key > 0 && typeof row[name] === 'string' && row[name].trim() !== '';
  });
};

export default function CatalogAdminScreen({ type }: { type: CatalogType }) {
  const current = config[type];
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const resolveImageUrl = (value: string) =>
    !value || /^https?:\/\//i.test(value) ? value : `${API}/${value.replace(/^\/+/, '')}`;
  const load = async () => {
    try {
      const response = await fetch(`${API}/api/admin/catalog/${type}`, { headers: headers() });
      const body = response.ok ? await response.json() : null;
      return validRows(type, body?.data);
    } catch {
      return [];
    }
  };
  useEffect(() => {
    let current = true;
    setRows([]);
    void load().then((data) => {
      if (current) setRows(data);
    });
    return () => {
      current = false;
    };
  }, [type]);
  const openEdit = (row: Row) => {
    setEditing(row);
    setName(String(row[current.name] || ''));
    setDescription(String(row.MoTa || ''));
    setImageUrl(String(row.HinhAnh || ''));
  };
  const resetForm = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setImageUrl('');
  };
  const save = async () => {
    if (!name.trim()) return;
    const payload =
      type === 'colors'
        ? { TenMau: name, MaMauHex: description || '#5547ED' }
        : type === 'sizes'
          ? { TenKichThuoc: name, MoTa: description }
          : type === 'brands'
            ? { TenThuongHieu: name, MoTa: description }
            : { TenDanhMuc: name, MoTa: description, HinhAnh: imageUrl.trim() || null };
    const url = editing
      ? `${API}/api/admin/catalog/${type}/${editing[current.id]}`
      : `${API}/api/admin/catalog/${type}`;
    const response = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: headers(),
      body: JSON.stringify({ ...payload, ...(editing ? {} : { TrangThai: 1 }) }),
    });
    if (response.ok) {
      resetForm();
      setRows(await load());
    }
  };
  const toggle = async (row: Row) => {
    const response = await fetch(`${API}/api/admin/catalog/${type}/${row[current.id]}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ TrangThai: Number(row.TrangThai) === 1 ? 0 : 1 }),
    });
    if (response.ok) setRows(await load());
  };
  const filtered = rows.filter((row) =>
    `${row[current.name] || ''} ${row.MoTa || ''}`.toLowerCase().includes(query.toLowerCase())
  );
  const pagination = usePaginatedRows(filtered, `${type}:${query}`);
  return (
    <section className="product-page">
      <div className="product-heading">
        <div>
          <small>SẢN PHẨM / {current.title.toUpperCase()}</small>
          <h1>Quản lý {current.title.toLowerCase()}</h1>
          <p>CRUD và trạng thái theo đúng bảng {current.title} trong schema.</p>
        </div>
      </div>
      <div className="catalog-layout">
        <div className="catalog-editor">
          <h2>{editing ? `Sửa ${current.title.toLowerCase()}` : `Thêm ${current.title.toLowerCase()}`}</h2>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={current.fields[current.name]}
          />
          {type === 'colors' ? (
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mã màu HEX"
            />
          ) : (
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={current.fields.MoTa || 'Mô tả'}
            />
          )}
          {type === 'categories' && (
            <div className="catalog-image-field">
              <label htmlFor="category-image-url">Hình ảnh danh mục</label>
              <input
                id="category-image-url"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://... hoặc uploads/ten-anh.jpg"
              />
              {imageUrl.trim() && (
                <img
                  className="catalog-image-preview"
                  src={resolveImageUrl(imageUrl.trim())}
                  alt="Xem trước ảnh danh mục"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
          )}
          {editing && (
            <button className="outline-action" onClick={resetForm}>
              Hủy sửa
            </button>
          )}
          <button className="primary-action" onClick={() => void save()}>
            {editing ? 'Cập nhật' : 'Lưu dữ liệu'}
          </button>
        </div>
        <div className="table-card catalog-table">
          <div className="catalog-toolbar">
            <strong>{filtered.length} bản ghi</strong>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm..."
            />
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                {type === 'categories' && <th>Ảnh</th>}
                <th>Tên</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageRows.map((row) => (
                <tr key={String(row[current.id])}>
                  <td>#{String(row[current.id])}</td>
                  {type === 'categories' && (
                    <td>
                      {row.HinhAnh ? (
                        <img
                          className="catalog-image-thumb"
                          src={resolveImageUrl(String(row.HinhAnh))}
                          alt={String(row.TenDanhMuc || '')}
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                  )}
                  <td>
                    <strong>{String(row[current.name] || '-')}</strong>
                  </td>
                  <td>{String(row.MoTa || row.MaMauHex || '-')}</td>
                  <td>{Number(row.TrangThai) === 1 ? 'Hoạt động' : 'Tạm dừng'}</td>
                  <td>
                    <button className="table-action" onClick={() => openEdit(row)}>
                      Sửa
                    </button>
                    <button className="table-action" onClick={() => void toggle(row)}>
                      {Number(row.TrangThai) === 1 ? 'Tắt' : 'Bật'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls {...pagination} onPageChange={pagination.setPage} />
        </div>
      </div>
    </section>
  );
}
