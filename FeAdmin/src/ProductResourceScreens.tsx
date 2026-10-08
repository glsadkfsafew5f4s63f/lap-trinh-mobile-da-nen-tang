import { useEffect, useState } from "react";
import "./product.css";
import { PaginationControls, usePaginatedRows } from "./PaginationControls";

type Row = Record<string, unknown>;
type VariantRow = {
  MaBienThe: number;
  MaSanPham: number;
  MaSanPhamCode: string;
  TenSanPham: string;
  SKU: string;
  TenMau?: string | null;
  TenKichThuoc?: string | null;
  GiaBan: number;
  GiaNhap: number;
  SoLuongTon: number;
  SoLuongTamGiu: number;
  TrangThai: number;
};
type VariantDraft = { GiaBan: string; GiaNhap: string; TrangThai: boolean };
type ProductOption = {
  MaSanPham: number;
  MaSanPhamCode: string;
  TenSanPham: string;
  GiaBan: number;
  GiaNhap: number;
};
type VariantAttribute = { id: number; name: string };
type NewVariantDraft = {
  MaSanPham: string;
  SKU: string;
  MaMauSac: string;
  MaKichThuoc: string;
  GiaBan: string;
  GiaNhap: string;
};
const API = import.meta.env.VITE_API_URL || "http://localhost:7000";
const headers = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("admin_token")
    ? { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
    : {}),
});
const loadJson = (url: string) =>
  fetch(url, { headers: headers() }).then((response) =>
    response.ok ? response.json() : null,
  );

export function VariantAdminScreen() {
  const [rows, setRows] = useState<VariantRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [colors, setColors] = useState<VariantAttribute[]>([]);
  const [sizes, setSizes] = useState<VariantAttribute[]>([]);
  const [drafts, setDrafts] = useState<Record<number, VariantDraft>>({});
  const [newVariant, setNewVariant] = useState<NewVariantDraft | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    let current = true;
    Promise.all([
      fetch(`${API}/api/admin/products`, { headers: headers() }),
      fetch(`${API}/api/admin/catalog/colors`, { headers: headers() }),
      fetch(`${API}/api/admin/catalog/sizes`, { headers: headers() }),
    ])
      .then(async ([productsResponse, colorsResponse, sizesResponse]) => {
        const responses = [productsResponse, colorsResponse, sizesResponse];
        const bodies = await Promise.all(
          responses.map((response) => response.json().catch(() => null)),
        );
        const failedIndex = responses.findIndex((response) => !response.ok);
        if (failedIndex >= 0) {
          throw new Error(bodies[failedIndex]?.message || "Không thể tải dữ liệu để thêm SKU.");
        }
        if (!current) return;
        const productRows = Array.isArray(bodies[0]?.data) ? bodies[0].data : [];
        const colorRows = Array.isArray(bodies[1]?.data) ? bodies[1].data : [];
        const sizeRows = Array.isArray(bodies[2]?.data) ? bodies[2].data : [];
        setProducts(productRows);
        setColors(colorRows.map((row: { MaMauSac: number; TenMau: string }) => ({
          id: Number(row.MaMauSac),
          name: row.TenMau,
        })));
        setSizes(sizeRows.map((row: { MaKichThuoc: number; TenKichThuoc: string }) => ({
          id: Number(row.MaKichThuoc),
          name: row.TenKichThuoc,
        })));
      })
      .catch((cause) => {
        if (current) setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu để thêm SKU.");
      });
    return () => { current = false; };
  }, []);
  useEffect(() => {
    let current = true;
    fetch(`${API}/api/admin/variants`, { headers: headers() })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.message || "Không thể tải danh sách SKU.");
        }
        if (current) setRows(Array.isArray(body?.data) ? body.data : []);
      })
      .catch((cause) => {
        if (current) {
          setError(cause instanceof Error ? cause.message : "Không thể tải danh sách SKU.");
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => { current = false; };
  }, []);
  const filteredRows = rows.filter((row) => {
    const searchable = `${row.SKU} ${row.TenSanPham} ${row.MaSanPhamCode} ${row.TenMau || ""} ${row.TenKichThuoc || ""}`.toLowerCase();
    return searchable.includes(query.trim().toLowerCase()) &&
      (statusFilter === "ALL" || Number(row.TrangThai) === Number(statusFilter));
  });
  const pagination = usePaginatedRows(filteredRows, `${query}:${statusFilter}`);
  const openNewVariant = () => {
    const product = products[0];
    setError("");
    setSuccess("");
    setNewVariant({
      MaSanPham: product ? String(product.MaSanPham) : "",
      SKU: "",
      MaMauSac: "",
      MaKichThuoc: "",
      GiaBan: String(product?.GiaBan ?? 0),
      GiaNhap: String(product?.GiaNhap ?? 0),
    });
  };
  const updateNewVariant = (field: keyof NewVariantDraft, value: string) => {
    setNewVariant((current) => {
      if (!current) return current;
      if (field === "MaSanPham") {
        const product = products.find((item) => String(item.MaSanPham) === value);
        return {
          ...current,
          MaSanPham: value,
          GiaBan: String(product?.GiaBan ?? 0),
          GiaNhap: String(product?.GiaNhap ?? 0),
        };
      }
      return { ...current, [field]: value };
    });
  };
  const addVariant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newVariant) return;
    const GiaBan = Number(newVariant.GiaBan);
    const GiaNhap = Number(newVariant.GiaNhap);
    if (!newVariant.SKU.trim() || newVariant.SKU.trim().length > 80 ||
      !Number.isFinite(GiaBan) || GiaBan < 0 || !Number.isFinite(GiaNhap) || GiaNhap < 0) {
      setError("Nhập mã SKU tối đa 80 ký tự và giá bán/giá nhập hợp lệ.");
      return;
    }
    setAdding(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API}/api/admin/products/${newVariant.MaSanPham}/variants`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          SKU: newVariant.SKU.trim(),
          MaMauSac: Number(newVariant.MaMauSac) || null,
          MaKichThuoc: Number(newVariant.MaKichThuoc) || null,
          GiaBan,
          GiaNhap,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "Không thể thêm SKU.");
      const listResponse = await fetch(`${API}/api/admin/variants`, { headers: headers() });
      const listBody = await listResponse.json().catch(() => null);
      if (!listResponse.ok) throw new Error(listBody?.message || "Đã thêm SKU nhưng không thể tải lại danh sách.");
      setRows(Array.isArray(listBody?.data) ? listBody.data : []);
      setNewVariant(null);
      setSuccess(`Đã thêm SKU ${newVariant.SKU.trim()} vào sản phẩm.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể thêm SKU.");
    } finally {
      setAdding(false);
    }
  };
  const editDraft = (row: VariantRow): VariantDraft =>
    drafts[row.MaBienThe] || {
      GiaBan: String(row.GiaBan),
      GiaNhap: String(row.GiaNhap),
      TrangThai: Number(row.TrangThai) === 1,
    };
  const saveVariant = async (row: VariantRow) => {
    const draft = editDraft(row);
    const GiaBan = Number(draft.GiaBan);
    const GiaNhap = Number(draft.GiaNhap);
    if (!Number.isFinite(GiaBan) || GiaBan < 0 || !Number.isFinite(GiaNhap) || GiaNhap < 0) {
      setError(`Giá của SKU ${row.SKU} phải là số không âm.`);
      return;
    }
    setSavingId(row.MaBienThe);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API}/api/admin/variants/${row.MaBienThe}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ GiaBan, GiaNhap, TrangThai: draft.TrangThai ? 1 : 0 }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || `Không thể lưu SKU ${row.SKU}.`);
      setRows((current) => current.map((item) =>
        item.MaBienThe === row.MaBienThe
          ? { ...item, GiaBan, GiaNhap, TrangThai: draft.TrangThai ? 1 : 0 }
          : item,
      ));
      setDrafts((current) => {
        const next = { ...current };
        delete next[row.MaBienThe];
        return next;
      });
      setSuccess(`Đã cập nhật SKU ${row.SKU}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu thay đổi SKU.");
    } finally {
      setSavingId(null);
    }
  };
  return (
    <ResourceShell title="Tra cứu & quản lý SKU">
      <div className="variant-layout">
        <div className="variant-table-heading">
          <div>
            <h2>Danh sách SKU toàn hệ thống</h2>
            <p>Tìm SKU, kiểm tra tồn kho và chỉnh nhanh giá hoặc trạng thái hiển thị.</p>
          </div>
          <div className="variant-heading-actions">
            <span>{filteredRows.length} SKU</span>
            <button className="primary-action" type="button" disabled={!products.length} onClick={openNewVariant}>
              + Thêm SKU vào sản phẩm
            </button>
          </div>
        </div>
        <div className="variant-search-bar">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm mã SKU, tên/mã sản phẩm, màu hoặc kích thước..."
            aria-label="Tìm kiếm SKU"
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Lọc trạng thái SKU">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="1">Đang hiện</option>
            <option value="0">Đang ẩn</option>
          </select>
        </div>
        {error && <div className="product-status-error" role="alert">{error}</div>}
        {success && <div className="variant-save-success" role="status">{success}</div>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Mã SKU</th>
              <th>Màu</th>
              <th>Kích thước</th>
              <th>Giá bán</th>
              <th>Giá nhập</th>
              <th>Tồn kho</th>
              <th>Hiện / ẩn</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageRows.map((row) => (
              <tr key={row.MaBienThe}>
                <td><strong>{row.TenSanPham}</strong><small>{row.MaSanPhamCode}</small></td>
                <td><strong>{row.SKU}</strong></td>
                <td>{String(row.TenMau || "-")}</td>
                <td>{String(row.TenKichThuoc || "-")}</td>
                <td>
                  <input className="variant-quick-edit" aria-label={`Giá bán ${row.SKU}`} type="number" min="0" value={editDraft(row).GiaBan} onChange={(event) => setDrafts((current) => ({ ...current, [row.MaBienThe]: { ...editDraft(row), GiaBan: event.target.value } }))} />
                  {Number(editDraft(row).GiaBan) < Number(editDraft(row).GiaNhap) && (
                    <small className="variant-price-warning">Giá bán thấp hơn giá nhập</small>
                  )}
                </td>
                <td><input className="variant-quick-edit" aria-label={`Giá nhập ${row.SKU}`} type="number" min="0" value={editDraft(row).GiaNhap} onChange={(event) => setDrafts((current) => ({ ...current, [row.MaBienThe]: { ...editDraft(row), GiaNhap: event.target.value } }))} /></td>
                <td>{row.SoLuongTon} <small>khả dụng {Math.max(Number(row.SoLuongTon) - Number(row.SoLuongTamGiu), 0)}</small></td>
                <td><label className="variant-visibility-toggle"><input type="checkbox" checked={editDraft(row).TrangThai} onChange={(event) => setDrafts((current) => ({ ...current, [row.MaBienThe]: { ...editDraft(row), TrangThai: event.target.checked } }))} /><span>{editDraft(row).TrangThai ? "Hiện" : "Ẩn"}</span></label></td>
                <td><button className="table-action" disabled={savingId === row.MaBienThe} onClick={() => void saveVariant(row)}>{savingId === row.MaBienThe ? "Đang lưu..." : "Lưu"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls {...pagination} onPageChange={pagination.setPage} />
        {!loading && !filteredRows.length && (
          <div className="variant-empty">{rows.length ? "Không tìm thấy SKU phù hợp." : "Chưa có SKU nào. Thêm biến thể từ biểu mẫu tạo sản phẩm."}</div>
        )}
        {loading && <div className="variant-empty">Đang tải danh sách SKU...</div>}
        {newVariant && (
          <div className="modal-backdrop">
            <form className="modal-form variant-create-form" onSubmit={(event) => void addVariant(event)}>
              <button type="button" className="modal-close" onClick={() => setNewVariant(null)} aria-label="Đóng">×</button>
              <h2>Thêm biến thể / SKU</h2>
              <p>Thêm SKU mới vào sản phẩm hiện có. Tồn kho ban đầu bằng 0; cập nhật tồn qua phiếu nhập.</p>
              <label>
                Sản phẩm
                <select required value={newVariant.MaSanPham} onChange={(event) => updateNewVariant("MaSanPham", event.target.value)}>
                  {products.map((product) => (
                    <option key={product.MaSanPham} value={product.MaSanPham}>
                      {product.TenSanPham} ({product.MaSanPhamCode})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Mã SKU
                <input required maxLength={80} value={newVariant.SKU} onChange={(event) => updateNewVariant("SKU", event.target.value)} placeholder="VD: AO-TRANG-L" />
              </label>
              <div className="form-row">
                <label>
                  Màu sắc
                  <select value={newVariant.MaMauSac} onChange={(event) => updateNewVariant("MaMauSac", event.target.value)}>
                    <option value="">Không chọn</option>
                    {colors.map((color) => <option key={color.id} value={color.id}>{color.name}</option>)}
                  </select>
                </label>
                <label>
                  Kích thước
                  <select value={newVariant.MaKichThuoc} onChange={(event) => updateNewVariant("MaKichThuoc", event.target.value)}>
                    <option value="">Không chọn</option>
                    {sizes.map((size) => <option key={size.id} value={size.id}>{size.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Giá bán
                  <input required type="number" min="0" value={newVariant.GiaBan} onChange={(event) => updateNewVariant("GiaBan", event.target.value)} />
                </label>
                <label>
                  Giá nhập
                  <input required type="number" min="0" value={newVariant.GiaNhap} onChange={(event) => updateNewVariant("GiaNhap", event.target.value)} />
                </label>
              </div>
              {Number(newVariant.GiaBan) < Number(newVariant.GiaNhap) && (
                <p className="price-loss-warning" role="status">Giá bán thấp hơn giá nhập. Bạn vẫn có thể lưu nếu đây là giá xả hàng.</p>
              )}
              {error && <div className="product-status-error" role="alert">{error}</div>}
              <button className="primary-action" disabled={adding || !products.length}>
                {adding ? "Đang thêm..." : "Thêm SKU"}
              </button>
            </form>
          </div>
        )}
      </div>
    </ResourceShell>
  );
}

export function ImageAdminScreen() {
  const [products, setProducts] = useState<Row[]>([]);
  const [productId, setProductId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [url, setUrl] = useState("");
  useEffect(() => {
    void loadJson(`${API}/api/admin/products`).then((body) => {
      const items = Array.isArray(body?.data) ? body.data : [];
      setProducts(items);
      if (items[0]) setProductId(String(items[0].MaSanPham));
    });
  }, []);
  const load = () =>
    productId &&
    loadJson(`${API}/api/admin/products/${productId}/images`).then((body) =>
      setRows(Array.isArray(body?.data) ? body.data : []),
    );
  useEffect(() => {
    void load();
  }, [productId]);
  const add = async () => {
    if (!productId || !url.trim()) return;
    const response = await fetch(
      `${API}/api/admin/products/${productId}/images`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          DuongDanAnh: url,
          LaAnhChinh: rows.length ? 0 : 1,
          ThuTu: rows.length + 1,
        }),
      },
    );
    if (response.ok) {
      setUrl("");
      await load();
    }
  };
  const remove = async (id: unknown) => {
    const response = await fetch(
      `${API}/api/admin/products/${productId}/images/${id}`,
      { method: "DELETE", headers: headers() },
    );
    if (response.ok) await load();
  };
  return (
    <ResourceShell title="Hình ảnh sản phẩm">
      <label>
        Sản phẩm
        <select
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
        >
          {products.map((product) => (
            <option
              key={String(product.MaSanPham)}
              value={String(product.MaSanPham)}
            >
              {String(product.TenSanPham)} · #{String(product.MaSanPham)}
            </option>
          ))}
        </select>
      </label>
      <div className="form-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="URL hình ảnh"
        />
        <button className="primary-action" onClick={() => void add()}>
          Thêm ảnh
        </button>
      </div>
      <div className="image-library">
        {rows.map((row) => (
          <article className="image-card" key={String(row.MaHinhAnh)}>
            <img src={String(row.DuongDanAnh)} alt={String(row.MoTa || "")} />
            <small>
              {Number(row.LaAnhChinh) === 1 ? "Ảnh chính" : "Ảnh phụ"}
            </small>
            <button
              className="table-action"
              onClick={() => void remove(row.MaHinhAnh)}
            >
              Xóa
            </button>
          </article>
        ))}
      </div>
    </ResourceShell>
  );
}

function ResourceShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="product-page">
      <div className="product-heading">
        <div>
          <small>SẢN PHẨM / {title.toUpperCase()}</small>
          <h1>Quản lý {title.toLowerCase()}</h1>
          <p>CRUD trực tiếp theo schema và API quản trị tương ứng.</p>
        </div>
      </div>
      <div className="table-card catalog-table">{children}</div>
    </section>
  );
}
