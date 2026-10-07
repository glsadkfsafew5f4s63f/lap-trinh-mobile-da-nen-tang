import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import "./product.css";
import "./gallery.css";
import CatalogAdminScreen from "./CatalogAdminScreen";
import { ImageAdminScreen, VariantAdminScreen } from "./ProductResourceScreens";
import { PaginationControls, usePaginatedRows } from "./PaginationControls";

type Product = Record<string, any>;
type CatalogType = "categories" | "brands" | "colors" | "sizes";
type Category = { MaDanhMuc: number; TenDanhMuc: string };
type Brand = { MaThuongHieu: number; TenThuongHieu: string };
const API = import.meta.env.VITE_API_URL || "http://localhost:7000";
const headers = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("admin_token")
    ? { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
    : {}),
});
export default function ProductManagement({ mode }: { mode: string }) {
  if (mode === "products") return <ProductList />;
  if (mode === "variants") return <VariantAdminScreen />;
  if (mode === "images") return <ImageAdminScreen />;
  return <CatalogAdminScreen key={mode} type={mode as CatalogType} />;
}

function ProductList() {
  const [rows, setRows] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/products`, { headers: headers() }),
      fetch(`${API}/api/admin/catalog/categories`, { headers: headers() }),
      fetch(`${API}/api/admin/catalog/brands`, { headers: headers() }),
    ])
      .then(async ([productsResponse, categoriesResponse, brandsResponse]) => {
        const [productsBody, categoriesBody, brandsBody] = await Promise.all([
          productsResponse.ok ? productsResponse.json() : null,
          categoriesResponse.ok ? categoriesResponse.json() : null,
          brandsResponse.ok ? brandsResponse.json() : null,
        ]);
        if (Array.isArray(productsBody?.data)) setRows(productsBody.data);
        if (Array.isArray(categoriesBody?.data))
          setCategories(categoriesBody.data);
        if (Array.isArray(brandsBody?.data)) setBrands(brandsBody.data);
      })
      .catch(() => undefined);
  }, []);
  const filtered = rows.filter(
    (row) =>
      `${row.TenSanPham} ${row.MaSanPhamCode}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!categoryId || String(row.MaDanhMuc) === categoryId) &&
      (!brandId || String(row.MaThuongHieu ?? "") === brandId) &&
      (!status || row.TrangThai === status) &&
      (!gender || row.GioiTinh === gender) &&
      (!featuredOnly || Number(row.NoiBat) === 1),
  );
  const pagination = usePaginatedRows(filtered, `${query}:${categoryId}:${brandId}:${status}:${gender}:${featuredOnly}`);
  return (
    <Shell
      eyebrow="SẢN PHẨM / DANH SÁCH SẢN PHẨM"
      title="Quản lý sản phẩm"
      description="Theo dõi danh mục thời trang, biến thể SKU, giá niêm yết và lượng hàng khả dụng."
      actions={
        <button className="primary-action" onClick={() => setShowForm(true)}>
          ⊕ Thêm sản phẩm
        </button>
      }
    >
      <div className="product-metrics">
        <Metric
          title="Tổng sản phẩm"
          value={rows.length}
          note="mã cha"
          tone="blue"
        />
        <Metric
          title="Đang kinh doanh"
          value={rows.filter((row) => row.TrangThai === "DANG_BAN").length}
          note="đang bán hoặc hết hàng"
          tone="green"
        />
        <Metric
          title="Hết hàng / tạm ngừng"
          value={
            rows.filter((row) =>
              ["HET_HANG", "NGUNG_BAN"].includes(String(row.TrangThai)),
            ).length
          }
          note="hết hàng hoặc ngừng bán"
          tone="red"
        />
        <Metric
          title="Sản phẩm nổi bật"
          value={rows.filter((row) => Number(row.NoiBat) === 1).length}
          note="theo thiết lập sản phẩm"
          tone="orange"
        />
      </div>
      <div className="filter-panel">
        <div className="product-search">
          ⌕{" "}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên hoặc mã sản phẩm..."
          />
        </div>
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.MaDanhMuc} value={category.MaDanhMuc}>
              {category.TenDanhMuc}
            </option>
          ))}
        </select>
        <select value={brandId} onChange={(event) => setBrandId(event.target.value)}>
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand.MaThuongHieu} value={brand.MaThuongHieu}>
              {brand.TenThuongHieu}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="DANG_BAN">Đang bán</option>
          <option value="HET_HANG">Hết hàng</option>
          <option value="NGUNG_BAN">Ngừng bán</option>
        </select>
        <select value={gender} onChange={(event) => setGender(event.target.value)}>
          <option value="">Tất cả phân loại</option>
          <option value="NAM">Nam</option>
          <option value="NU">Nữ</option>
          <option value="UNISEX">Unisex</option>
          <option value="TRE_EM">Trẻ em</option>
        </select>
        <label className="featured-filter">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(event) => setFeaturedOnly(event.target.checked)}
          />
          Nổi bật
        </label>
      </div>
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Mã sản phẩm</th>
              <th>Danh mục</th>
              <th>Thương hiệu</th>
              <th>Phân loại</th>
              <th>Giá bán</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageRows.map((row) => (
              <tr key={String(row.MaSanPham)}>
                <td>
                  {row.AnhChinh ? (
                    <img className="product-thumb" src={row.AnhChinh} alt={String(row.TenSanPham)} />
                  ) : (
                    <div className="product-thumb">Ảnh</div>
                  )}
                </td>
                <td>
                  <strong>{String(row.TenSanPham)}</strong>
                  <small>Mã #{row.MaSanPham}</small>
                </td>
                <td>
                  <b className="sku">{String(row.MaSanPhamCode)}</b>
                </td>
                <td>
                  <span className="tag">{String(row.TenDanhMuc)}</span>
                </td>
                <td>{String(row.TenThuongHieu)}</td>
                <td>
                  {({ NAM: "Nam", NU: "Nữ", UNISEX: "Unisex", TRE_EM: "Trẻ em" } as Record<string, string>)[row.GioiTinh] || "Unisex"}
                  {Number(row.NoiBat) === 1 && <small>Nổi bật</small>}
                </td>
                <td>
                  <strong>
                    {Number(row.GiaBan).toLocaleString("vi-VN")} đ
                  </strong>
                </td>
                <td>
                  <span className="status-pill">
                    {({ DANG_BAN: "Đang bán", HET_HANG: "Hết hàng", NGUNG_BAN: "Ngừng bán" } as Record<string, string>)[row.TrangThai] || row.TrangThai}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls {...pagination} onPageChange={pagination.setPage} />
      </div>
      {showForm && (
        <ProductForm
          categories={categories}
          brands={brands}
          onClose={() => setShowForm(false)}
          onSaved={(row) => {
            setRows((current) => [row, ...current]);
            setShowForm(false);
          }}
        />
      )}
    </Shell>
  );
}

function ProductForm({
  categories,
  brands,
  onClose,
  onSaved,
}: {
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
  onSaved: (row: Product) => void;
}) {
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const payload = {
      ...values,
      MaDanhMuc: Number(values.MaDanhMuc),
      MaThuongHieu: Number(values.MaThuongHieu) || null,
      GiaBan: Number(values.GiaBan),
      GiaNhap: Number(values.GiaNhap),
      NoiBat: values.NoiBat ? 1 : 0,
    };
    const response = await fetch(`${API}/api/admin/products`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const body = await response.json();
      onSaved({ ...payload, MaSanPham: body.insertId });
    }
  }
  return (
    <div className="modal-backdrop">
      <form className="modal-form" onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>Thêm sản phẩm mới</h2>
        <p>Tạo bản ghi theo bảng SanPham.</p>
        <label>
          Mã sản phẩm
          <input name="MaSanPhamCode" required placeholder="FS-PL-020" />
        </label>
        <label>
          Tên sản phẩm
          <input name="TenSanPham" required placeholder="Tên sản phẩm" />
        </label>
        <div className="form-row">
          <label>
            Danh mục
            <select name="MaDanhMuc" required defaultValue="">
              <option value="" disabled>Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.MaDanhMuc} value={category.MaDanhMuc}>
                  {category.TenDanhMuc}
                </option>
              ))}
            </select>
          </label>
          <label>
            Thương hiệu
            <select name="MaThuongHieu" defaultValue="">
              <option value="">Không chọn</option>
              {brands.map((brand) => (
                <option key={brand.MaThuongHieu} value={brand.MaThuongHieu}>
                  {brand.TenThuongHieu}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Phân loại
          <select name="GioiTinh" defaultValue="UNISEX">
            <option value="NAM">Nam</option>
            <option value="NU">Nữ</option>
            <option value="UNISEX">Unisex</option>
            <option value="TRE_EM">Trẻ em</option>
          </select>
        </label>
        <div className="form-row">
          <label>
            Giá bán
            <input name="GiaBan" type="number" defaultValue="0" />
          </label>
          <label>
            Giá nhập
            <input name="GiaNhap" type="number" defaultValue="0" />
          </label>
        </div>
        <label>
          Trạng thái
          <select name="TrangThai" defaultValue="DANG_BAN">
            <option value="DANG_BAN">ĐANG BÁN</option>
            <option value="NGUNG_BAN">NGỪNG BÁN</option>
            <option value="HET_HANG">HẾT HÀNG</option>
          </select>
        </label>
        <button className="primary-action">Lưu sản phẩm</button>
      </form>
    </div>
  );
}

function Shell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="product-page">
      <div className="product-heading">
        <div>
          <small>{eyebrow}</small>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div>{actions}</div>
      </div>
      {children}
    </section>
  );
}
function Metric({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: string | number;
  note: string;
  tone: string;
}) {
  return (
    <article className={`metric ${tone}`}>
      <div>
        <span>{title}</span>
        <b>▣</b>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
