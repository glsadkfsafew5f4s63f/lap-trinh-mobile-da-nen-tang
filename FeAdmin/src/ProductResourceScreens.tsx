import { useEffect, useState } from "react";
import "./product.css";
import { PaginationControls, usePaginatedRows } from "./PaginationControls";

type Row = Record<string, unknown>;
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
  const [products, setProducts] = useState<Row[]>([]);
  const [colors, setColors] = useState<Row[]>([]);
  const [sizes, setSizes] = useState<Row[]>([]);
  const [productId, setProductId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({
    SKU: "",
    MaMauSac: "",
    MaKichThuoc: "",
    GiaBan: "0",
    GiaNhap: "0",
  });
  useEffect(() => {
    let current = true;
    void Promise.all([
      loadJson(`${API}/api/admin/products`),
      loadJson(`${API}/api/admin/catalog/colors`),
      loadJson(`${API}/api/admin/catalog/sizes`),
    ]).then(([productBody, colorBody, sizeBody]) => {
      if (!current) return;
      const items = Array.isArray(productBody?.data) ? productBody.data : [];
      setProducts(items);
      setColors(Array.isArray(colorBody?.data) ? colorBody.data : []);
      setSizes(Array.isArray(sizeBody?.data) ? sizeBody.data : []);
      if (items[0]) setProductId(String(items[0].MaSanPham));
    }).catch(() => undefined);
    return () => { current = false; };
  }, []);
  useEffect(() => {
    let current = true;
    setRows([]);
    if (productId) {
      void loadJson(`${API}/api/admin/products/${productId}/variants`).then(
        (body) => {
          if (current) setRows(Array.isArray(body?.data) ? body.data : []);
        },
      ).catch(() => { if (current) setRows([]); });
    }
    return () => { current = false; };
  }, [productId]);
  const pagination = usePaginatedRows(rows, productId);
  const create = async () => {
    if (!productId || !form.SKU) return;
    const response = await fetch(
      `${API}/api/admin/products/${productId}/variants`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          ...form,
          MaSanPham: Number(productId),
          MaMauSac: Number(form.MaMauSac) || null,
          MaKichThuoc: Number(form.MaKichThuoc) || null,
          GiaBan: Number(form.GiaBan),
          GiaNhap: Number(form.GiaNhap),
        }),
      },
    );
    if (response.ok) {
      setForm({
        SKU: "",
        MaMauSac: "",
        MaKichThuoc: "",
        GiaBan: "0",
        GiaNhap: "0",
      });
      const body = await loadJson(
        `${API}/api/admin/products/${productId}/variants`,
      );
      setRows(body?.data || []);
    }
  };
  return (
    <ResourceShell title="Biến thể sản phẩm">
      <div className="variant-layout">
        <div className="variant-product-picker">
          <label htmlFor="variant-product">Sản phẩm</label>
          <select
            id="variant-product"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            disabled={!products.length}
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
        </div>
        <form
          className="variant-form"
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <div className="variant-section-heading">
            <div>
              <h2>Thêm biến thể</h2>
              <p>Tạo SKU mới với tồn kho 0; phiếu nhập được duyệt sẽ cộng tồn.</p>
            </div>
          </div>
          <div className="variant-fields">
            <label className="variant-field">
              SKU
              <input
                required
                value={form.SKU}
                onChange={(event) => setForm({ ...form, SKU: event.target.value })}
                placeholder="Ví dụ: AO-TRANG-M"
              />
            </label>
            <label className="variant-field">
              Màu sắc
              <select
                value={form.MaMauSac}
                onChange={(event) => setForm({ ...form, MaMauSac: event.target.value })}
              >
                <option value="">Không chọn màu</option>
                {colors.map((color) => (
                  <option key={String(color.MaMauSac)} value={String(color.MaMauSac)}>
                    {String(color.TenMau)}
                  </option>
                ))}
              </select>
            </label>
            <label className="variant-field">
              Kích thước
              <select
                value={form.MaKichThuoc}
                onChange={(event) => setForm({ ...form, MaKichThuoc: event.target.value })}
              >
                <option value="">Không chọn kích thước</option>
                {sizes.map((size) => (
                  <option key={String(size.MaKichThuoc)} value={String(size.MaKichThuoc)}>
                    {String(size.TenKichThuoc)}
                  </option>
                ))}
              </select>
            </label>
            <label className="variant-field">
              Giá bán
              <input
                type="number"
                min="0"
                value={form.GiaBan}
                onChange={(event) => setForm({ ...form, GiaBan: event.target.value })}
              />
            </label>
            <label className="variant-field">
              Giá nhập
              <input
                type="number"
                min="0"
                value={form.GiaNhap}
                onChange={(event) => setForm({ ...form, GiaNhap: event.target.value })}
              />
            </label>
          </div>
          <div className="variant-form-actions">
            <button className="primary-action" type="submit" disabled={!productId || !form.SKU.trim()}>
              Thêm biến thể
            </button>
          </div>
        </form>
        <div className="variant-table-heading">
          <div>
            <h2>Danh sách SKU</h2>
            <p>Các biến thể của sản phẩm đang chọn</p>
          </div>
          <span>{rows.length} biến thể</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Màu</th>
              <th>Kích thước</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageRows.map((row) => (
              <tr key={String(row.MaBienThe)}>
                <td><strong>{String(row.SKU)}</strong></td>
                <td>{String(row.TenMau || "-")}</td>
                <td>{String(row.TenKichThuoc || "-")}</td>
                <td>{Number(row.GiaBan || 0).toLocaleString("vi-VN")} đ</td>
                <td>{String(row.SoLuongTon || 0)}</td>
                <td>{String(row.TrangThai || "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls {...pagination} onPageChange={pagination.setPage} />
        {!rows.length && (
          <div className="variant-empty">Chưa có biến thể cho sản phẩm này.</div>
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
