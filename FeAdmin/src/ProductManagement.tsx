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
type Color = { MaMauSac: number; TenMau: string };
type Size = { MaKichThuoc: number; TenKichThuoc: string };
type NewVariant = {
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
const priceRange = (minimum: unknown, maximum: unknown, fallback: unknown) => {
  const min = Number(minimum ?? fallback ?? 0);
  const max = Number(maximum ?? fallback ?? 0);
  const format = (value: number) => `${value.toLocaleString("vi-VN")} đ`;
  return min === max ? format(min) : `${format(min)} – ${format(max)}`;
};
const priceRangeFields = (product: Product): Product => {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const salePrices = variants.map((variant: NewVariant) => Number(variant.GiaBan));
  const costPrices = variants.map((variant: NewVariant) => Number(variant.GiaNhap));
  return {
    ...product,
    GiaBanMin: salePrices.length ? Math.min(...salePrices) : product.GiaBan,
    GiaBanMax: salePrices.length ? Math.max(...salePrices) : product.GiaBan,
    GiaNhapMin: costPrices.length ? Math.min(...costPrices) : product.GiaNhap,
    GiaNhapMax: costPrices.length ? Math.max(...costPrices) : product.GiaNhap,
  };
};
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
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [savingStatusId, setSavingStatusId] = useState<number | null>(null);
  const [statusError, setStatusError] = useState("");
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/products`, { headers: headers() }),
      fetch(`${API}/api/admin/catalog/categories`, { headers: headers() }),
      fetch(`${API}/api/admin/catalog/brands`, { headers: headers() }),
      fetch(`${API}/api/admin/catalog/colors`, { headers: headers() }),
      fetch(`${API}/api/admin/catalog/sizes`, { headers: headers() }),
    ])
      .then(async ([productsResponse, categoriesResponse, brandsResponse, colorsResponse, sizesResponse]) => {
        const [productsBody, categoriesBody, brandsBody, colorsBody, sizesBody] = await Promise.all([
          productsResponse.ok ? productsResponse.json() : null,
          categoriesResponse.ok ? categoriesResponse.json() : null,
          brandsResponse.ok ? brandsResponse.json() : null,
          colorsResponse.ok ? colorsResponse.json() : null,
          sizesResponse.ok ? sizesResponse.json() : null,
        ]);
        if (Array.isArray(productsBody?.data)) setRows(productsBody.data);
        if (Array.isArray(categoriesBody?.data))
          setCategories(categoriesBody.data);
        if (Array.isArray(brandsBody?.data)) setBrands(brandsBody.data);
        if (Array.isArray(colorsBody?.data)) setColors(colorsBody.data);
        if (Array.isArray(sizesBody?.data)) setSizes(sizesBody.data);
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
      (!status || (status === "NGUNG_BAN"
        ? row.TrangThai === "NGUNG_BAN"
        : row.TrangThai !== "NGUNG_BAN")) &&
      (!gender || row.GioiTinh === gender) &&
      (!featuredOnly || Number(row.NoiBat) === 1),
  );
  const pagination = usePaginatedRows(filtered, `${query}:${categoryId}:${brandId}:${status}:${gender}:${featuredOnly}`);
  const updateProductStatus = async (productId: number, nextStatus: string) => {
    const previousStatus = rows.find(
      (row) => Number(row.MaSanPham) === productId,
    )?.TrangThai;
    if (!previousStatus || previousStatus === nextStatus) return;

    setSavingStatusId(productId);
    setStatusError("");
    try {
      const response = await fetch(`${API}/api/admin/products/${productId}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ TrangThai: nextStatus }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Không thể cập nhật trạng thái sản phẩm.");
      }
      setRows((current) =>
        current.map((row) =>
          Number(row.MaSanPham) === productId
            ? { ...row, TrangThai: nextStatus }
            : row,
        ),
      );
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Không thể kết nối máy chủ để cập nhật trạng thái.",
      );
    } finally {
      setSavingStatusId(null);
    }
  };
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
          value={rows.filter((row) => row.TrangThai !== "NGUNG_BAN").length}
          note="được bật bán"
          tone="green"
        />
        <Metric
          title="Hết hàng"
          value={rows.filter((row) => Number(row.SoLuongCoTheBan) <= 0).length}
          note="tự động theo tồn khả dụng"
          tone="red"
        />
        <Metric
          title="Sản phẩm nổi bật"
          value={rows.filter((row) => Number(row.NoiBat) === 1).length}
          note="theo thiết lập sản phẩm"
          tone="orange"
        />
      </div>
      {rows.some((row) => row.TrangThai !== "NGUNG_BAN" && Number(row.SoLuongCoTheBan) <= 0) && (
        <section className="product-stock-alert" aria-label="Sản phẩm hết hàng">
          <div>
            <strong>
              {rows.filter((row) => row.TrangThai !== "NGUNG_BAN" && Number(row.SoLuongCoTheBan) <= 0).length} sản phẩm hết hàng
            </strong>
            <p>Tình trạng hết hàng được tính tự động; trạng thái kinh doanh chỉ dùng để bật hoặc ngừng bán.</p>
          </div>
          <ul>
            {rows
              .filter((row) => row.TrangThai !== "NGUNG_BAN" && Number(row.SoLuongCoTheBan) <= 0)
              .slice(0, 6)
              .map((row) => (
                <li key={row.MaSanPham}>
                  <span>{row.TenSanPham}</span>
                  <small>{row.TrangThai === "NGUNG_BAN" ? "Đã ngừng kinh doanh" : "Cần nhập hàng"}</small>
                </li>
              ))}
          </ul>
        </section>
      )}
      {statusError && (
        <div className="product-status-error" role="alert">
          {statusError}
        </div>
      )}
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
              <th>Giá bán (SKU)</th>
              <th>Giá nhập (SKU)</th>
              <th>Trạng thái / thay đổi</th>
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
                    {priceRange(row.GiaBanMin, row.GiaBanMax, row.GiaBan)}
                  </strong>
                </td>
                <td>
                  <strong>
                    {priceRange(row.GiaNhapMin, row.GiaNhapMax, row.GiaNhap)}
                  </strong>
                </td>
                <td>
                  <select
                    className="product-status-select"
                    aria-label={`Trạng thái của ${String(row.TenSanPham)}`}
                    value={row.TrangThai === "NGUNG_BAN" ? "NGUNG_BAN" : "DANG_BAN"}
                    disabled={savingStatusId === Number(row.MaSanPham)}
                    onChange={(event) =>
                      void updateProductStatus(
                        Number(row.MaSanPham),
                        event.target.value,
                      )
                    }
                  >
                    <option value="DANG_BAN">Đang bán</option>
                    <option value="NGUNG_BAN">Ngừng bán</option>
                  </select>
                  {Number(row.SoLuongCoTheBan) <= 0 && (
                    <small className="product-stock-state">Hết hàng · tồn khả dụng 0</small>
                  )}
                  {savingStatusId === Number(row.MaSanPham) && (
                    <small className="product-status-saving">Đang lưu...</small>
                  )}
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
          colors={colors}
          sizes={sizes}
          onClose={() => setShowForm(false)}
          onSaved={(row) => {
            setRows((current) => [priceRangeFields(row), ...current]);
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
  colors,
  sizes,
  onClose,
  onSaved,
}: {
  categories: Category[];
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  onClose: () => void;
  onSaved: (row: Product) => void;
}) {
  const [salePrice, setSalePrice] = useState("0");
  const [costPrice, setCostPrice] = useState("0");
  const [variants, setVariants] = useState<NewVariant[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
      variants: variants.map((variant) => ({
        SKU: variant.SKU.trim(),
        MaMauSac: Number(variant.MaMauSac) || null,
        MaKichThuoc: Number(variant.MaKichThuoc) || null,
        GiaBan: Number(variant.GiaBan),
        GiaNhap: Number(variant.GiaNhap),
      })),
    };
    if (
      variants.some(
        (variant) =>
          !variant.SKU.trim() ||
          !Number.isFinite(Number(variant.GiaBan)) ||
          Number(variant.GiaBan) < 0 ||
          !Number.isFinite(Number(variant.GiaNhap)) ||
          Number(variant.GiaNhap) < 0,
      )
    ) {
      setError("Mỗi SKU cần mã SKU và giá bán/giá nhập hợp lệ.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/admin/products`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "Không thể lưu sản phẩm.");
      }
      onSaved({ ...payload, MaSanPham: body.insertId });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu sản phẩm.");
    } finally {
      setSaving(false);
    }
  }
  const addVariant = () =>
    setVariants((current) => [
      ...current,
      {
        SKU: "",
        MaMauSac: "",
        MaKichThuoc: "",
        GiaBan: salePrice,
        GiaNhap: costPrice,
      },
    ]);
  const updateVariant = (
    index: number,
    field: keyof NewVariant,
    value: string,
  ) =>
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  return (
    <div className="modal-backdrop">
      <form className="modal-form product-create-form" onSubmit={submit}>
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
            <input
              name="GiaBan"
              type="number"
              min="0"
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
            />
          </label>
          <label>
            Giá nhập
            <input
              name="GiaNhap"
              type="number"
              min="0"
              value={costPrice}
              onChange={(event) => setCostPrice(event.target.value)}
            />
          </label>
        </div>
        {Number(salePrice) < Number(costPrice) && (
          <p className="price-loss-warning" role="status">
            Giá bán thấp hơn giá nhập. Bạn vẫn có thể lưu nếu đây là giá xả hàng.
          </p>
        )}
        <label>
          Trạng thái
          <select name="TrangThai" defaultValue="DANG_BAN">
            <option value="DANG_BAN">ĐANG BÁN</option>
            <option value="NGUNG_BAN">NGỪNG BÁN</option>
          </select>
        </label>
        <div className="product-variant-create">
          <div className="variant-section-heading">
            <div>
              <h3>Biến thể / SKU</h3>
              <p>Có thể thêm màu, kích thước và giá riêng cho từng SKU. Tồn kho ban đầu bằng 0.</p>
            </div>
            <button type="button" className="outline-action" onClick={addVariant}>
              + Thêm SKU
            </button>
          </div>
          {variants.map((variant, index) => (
            <div className="product-variant-row" key={index}>
              <label>
                Mã SKU
                <input
                  value={variant.SKU}
                  onChange={(event) => updateVariant(index, "SKU", event.target.value)}
                  placeholder="VD: AO-TRANG-M"
                  required
                />
              </label>
              <label>
                Màu sắc
                <select
                  value={variant.MaMauSac}
                  onChange={(event) => updateVariant(index, "MaMauSac", event.target.value)}
                >
                  <option value="">Không chọn</option>
                  {colors.map((color) => (
                    <option key={color.MaMauSac} value={color.MaMauSac}>{color.TenMau}</option>
                  ))}
                </select>
              </label>
              <label>
                Kích thước
                <select
                  value={variant.MaKichThuoc}
                  onChange={(event) => updateVariant(index, "MaKichThuoc", event.target.value)}
                >
                  <option value="">Không chọn</option>
                  {sizes.map((size) => (
                    <option key={size.MaKichThuoc} value={size.MaKichThuoc}>{size.TenKichThuoc}</option>
                  ))}
                </select>
              </label>
              <label>
                Giá bán
                <input
                  type="number"
                  min="0"
                  value={variant.GiaBan}
                  onChange={(event) => updateVariant(index, "GiaBan", event.target.value)}
                  required
                />
              </label>
              <label>
                Giá nhập
                <input
                  type="number"
                  min="0"
                  value={variant.GiaNhap}
                  onChange={(event) => updateVariant(index, "GiaNhap", event.target.value)}
                  required
                />
              </label>
              <button
                type="button"
                className="table-action"
                onClick={() => setVariants((current) => current.filter((_, i) => i !== index))}
                aria-label="Xóa SKU"
              >
                Xóa
              </button>
              {Number(variant.GiaBan) < Number(variant.GiaNhap) && (
                <p className="price-loss-warning" role="status">
                  Giá bán của SKU này thấp hơn giá nhập.
                </p>
              )}
            </div>
          ))}
        </div>
        {error && <div className="product-status-error" role="alert">{error}</div>}
        <button className="primary-action" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
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
