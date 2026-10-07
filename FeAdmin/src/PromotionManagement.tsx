import { useEffect, useState } from "react";
import "./promotion.css";
import { PaginationControls, usePaginatedRows } from "./PaginationControls";

type CatalogProduct = { MaSanPham: number; TenSanPham: string };
type CatalogVariant = { MaBienThe: number; SKU: string };

function PromotionAssignment() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [variants, setVariants] = useState<CatalogVariant[]>([]);
  const [programId, setProgramId] = useState("");
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [target, setTarget] = useState<"product" | "variant">("product");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/discount-programs`, { headers: headers() }).then(
        (response) => (response.ok ? response.json() : null),
      ),
      fetch(`${API}/api/admin/products`, { headers: headers() }).then(
        (response) => (response.ok ? response.json() : null),
      ),
    ])
      .then(([programBody, productBody]) => {
        const availablePrograms = Array.isArray(programBody?.data)
          ? programBody.data
          : [];
        const availableProducts = Array.isArray(productBody?.data)
          ? productBody.data
          : [];
        setPrograms(availablePrograms);
        setProducts(availableProducts);
        if (availablePrograms[0])
          setProgramId(String(availablePrograms[0].MaChuongTrinh));
        if (availableProducts[0])
          setProductId(String(availableProducts[0].MaSanPham));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!productId) return;
    fetch(`${API}/api/admin/products/${productId}/variants`, {
      headers: headers(),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        const availableVariants = Array.isArray(body?.data) ? body.data : [];
        setVariants(availableVariants);
        setVariantId(
          availableVariants[0] ? String(availableVariants[0].MaBienThe) : "",
        );
      })
      .catch(() => setVariants([]));
  }, [productId]);

  const assign = async () => {
    if (!programId || !productId || (target === "variant" && !variantId))
      return;
    setSaving(true);
    try {
      const isVariant = target === "variant";
      const payload = isVariant
        ? { MaChuongTrinh: Number(programId), MaBienThe: Number(variantId) }
        : { MaChuongTrinh: Number(programId), MaSanPham: Number(productId) };
      const endpoint = isVariant
        ? "bienthechuongtrinhgiamgia"
        : "sanphamchuongtrinhgiamgia";
      const response = await fetch(`${API}/api/${endpoint}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      window.alert("Đã gắn chương trình giảm giá.");
    } catch {
      window.alert(
        "Không thể gắn chương trình. Kiểm tra dữ liệu hoặc liên kết đã tồn tại.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="promotion-page">
      <div className="promotion-heading">
        <div>
          <small>ÁP DỤNG KHUYẾN MÃI</small>
          <h2>Gắn chương trình vào sản phẩm</h2>
          <p>Chọn sản phẩm hoặc SKU để áp dụng mức giảm đã tạo.</p>
        </div>
      </div>
      <div className="promotion-filters">
        <select
          value={programId}
          onChange={(event) => setProgramId(event.target.value)}
        >
          <option value="">Chọn chương trình</option>
          {programs.map((program) => (
            <option key={program.MaChuongTrinh} value={program.MaChuongTrinh}>
                {program.TenChuongTrinh}
            </option>
          ))}
        </select>
        <select
          value={target}
          onChange={(event) =>
            setTarget(event.target.value as "product" | "variant")
          }
        >
          <option value="product">Toàn sản phẩm</option>
          <option value="variant">Một biến thể / SKU</option>
        </select>
        <select
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
        >
          <option value="">Chọn sản phẩm</option>
          {products.map((product) => (
            <option key={product.MaSanPham} value={product.MaSanPham}>
              {product.TenSanPham}
            </option>
          ))}
        </select>
        {target === "variant" && (
          <select
            value={variantId}
            onChange={(event) => setVariantId(event.target.value)}
          >
            <option value="">Chọn SKU</option>
            {variants.map((variant) => (
              <option key={variant.MaBienThe} value={variant.MaBienThe}>
                {variant.SKU}
              </option>
            ))}
          </select>
        )}
        <button
          className="primary-action"
          disabled={
            saving ||
            !programId ||
            !productId ||
            (target === "variant" && !variantId)
          }
          onClick={() => void assign()}
        >
          {saving ? "Đang gắn..." : "Gắn chương trình"}
        </button>
      </div>
    </section>
  );
}

type Voucher = {
  MaGiamGia: number;
  MaCode: string;
  TenMaGiamGia: string;
  MoTa?: string;
  LoaiGiam: "PHAN_TRAM" | "SO_TIEN";
  GiaTriGiam: number;
  GiamToiDa?: number;
  DonToiThieu: number;
  TongSoLuong?: number;
  SoLuongDaSuDung: number;
  SoLanSuDungMoiNguoi: number;
  NgayBatDau: string;
  NgayKetThuc: string;
  TrangThai: number;
};
type Program = {
  MaChuongTrinh: number;
  TenChuongTrinh: string;
  MoTa?: string;
  LoaiGiam: "PHAN_TRAM" | "SO_TIEN";
  GiaTriGiam: number;
  NgayBatDau: string;
  NgayKetThuc: string;
  TrangThai: number;
};
const API = import.meta.env.VITE_API_URL || "http://localhost:7000";
const headers = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("admin_token")
    ? { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
    : {}),
});
const money = (value: number) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
const date = (value?: string) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "-";
export default function PromotionManagement({ mode }: { mode: string }) {
  return mode === "vouchers" ? (
    <VoucherScreen />
  ) : (
    <>
      <ProgramScreen flash={mode === "flash-sale"} />
      <PromotionAssignment />
    </>
  );
}

function VoucherScreen() {
  const [rows, setRows] = useState<Voucher[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [form, setForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/admin/vouchers`, {
        headers: headers(),
      });
      if (response.ok) {
        const body = await response.json();
        if (Array.isArray(body.data)) setRows(body.data);
      }
    } catch {
      /* Demo data keeps the screen usable without the API. */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const filtered = rows.filter(
    (row) =>
      (filter === "ALL" ||
        (filter === "ACTIVE" ? row.TrangThai === 1 : row.TrangThai === 0)) &&
      `${row.MaCode} ${row.TenMaGiamGia}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
        const pagination = usePaginatedRows(filtered, `${filter}:${query}`);
  const toggleStatus = async (row: Voucher) => {
    const response = await fetch(`${API}/api/admin/vouchers/${row.MaGiamGia}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ TrangThai: row.TrangThai ? 0 : 1 }),
    });
    if (!response.ok) {
      window.alert("Không thể cập nhật trạng thái mã giảm giá.");
      return;
    }
    await load();
  };
  return (
    <section className="promotion-page">
      <Header
        title="Mã giảm giá"
        eyebrow="KHUYẾN MÃI / MÃ GIẢM GIÁ"
        description="Quản lý mã giảm giá, điều kiện áp dụng và thời hạn hiệu lực."
        action="+ Tạo mã giảm giá"
        onAction={() => setForm(true)}
      />
      <Metrics vouchers={rows} />
      <Tabs
        filter={filter}
        setFilter={setFilter}
        labels={["Tất cả", "Đang chạy", "Đã tắt"]}
        counts={[
          rows.length,
          rows.filter((row) => row.TrangThai === 1).length,
          rows.filter((row) => row.TrangThai === 0).length,
        ]}
      />
      <div className="promotion-filters">
        <label>
          ⌕{" "}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo mã hoặc tên voucher..."
          />
        </label>
      </div>
      <div className="promo-table-card">
        <Caption count={filtered.length} loading={loading} source="MaGiamGia" />
        <table className="promo-table">
          <thead>
            <tr>
              <th>Mã voucher</th>
              <th>Loại giảm</th>
              <th>Điều kiện</th>
              <th>Đã sử dụng</th>
              <th>Thời gian hiệu lực</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageRows.map((row) => (
              <tr key={row.MaGiamGia}>
                <td>
                  <strong className="code">{row.MaCode}</strong>
                  <small>{row.TenMaGiamGia}</small>
                </td>
                <td>
                  <strong>
                    {row.LoaiGiam === "PHAN_TRAM"
                      ? `${row.GiaTriGiam}%`
                      : money(row.GiaTriGiam)}
                  </strong>
                  <small>
                    Giảm tối đa:{" "}
                    {row.GiamToiDa != null ? money(row.GiamToiDa) : "Không giới hạn"}
                  </small>
                </td>
                <td>
                  <strong>Từ {money(row.DonToiThieu)}</strong>
                  <small>Tối đa {row.SoLanSuDungMoiNguoi} lượt/người</small>
                </td>
                <td>
                  <strong>
                    {row.SoLuongDaSuDung.toLocaleString("vi-VN")} /{" "}
                    {row.TongSoLuong ?? "Không giới hạn"}
                  </strong>
                  <div className="usage">
                    <i
                      style={{
                        width: `${Math.min(100, row.TongSoLuong ? (row.SoLuongDaSuDung / row.TongSoLuong) * 100 : 0)}%`,
                      }}
                    />
                  </div>
                </td>
                <td>
                  {date(row.NgayBatDau)} - {date(row.NgayKetThuc)}
                </td>
                <td>
                  <span
                    className={`promo-status ${row.TrangThai ? "on" : "off"}`}
                  >
                      {row.TrangThai ? "Đang bật" : "Đã tắt"}
                  </span>
                </td>
                <td>
                  <button
                    className="table-action"
                    onClick={() => void toggleStatus(row)}
                  >
                    {row.TrangThai ? "Tắt" : "Bật"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls {...pagination} onPageChange={pagination.setPage} />
        {filtered.length === 0 && (
          <div className="empty-state">Không có mã giảm giá phù hợp.</div>
        )}
      </div>
      {form && (
        <VoucherForm
          onClose={() => setForm(false)}
          onSaved={(row) => {
            setRows((current) => [row, ...current]);
            setForm(false);
          }}
        />
      )}
    </section>
  );
}

function ProgramScreen({ flash }: { flash: boolean }) {
  const [rows, setRows] = useState<Program[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [form, setForm] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/admin/discount-programs`, { headers: headers() })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (Array.isArray(body?.data)) setRows(body.data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);
  const filtered = rows.filter(
    (row) =>
      (filter === "ALL" ||
        (filter === "ACTIVE" ? row.TrangThai === 1 : row.TrangThai === 0)) &&
      (!flash || row.TenChuongTrinh.toLowerCase().includes("flash")) &&
      row.TenChuongTrinh.toLowerCase().includes(query.toLowerCase()),
  );
  const pagination = usePaginatedRows(filtered, `${filter}:${flash}:${query}`);
  const toggleStatus = async (row: Program) => {
    const response = await fetch(
      `${API}/api/admin/discount-programs/${row.MaChuongTrinh}`,
      {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ TrangThai: row.TrangThai ? 0 : 1 }),
      },
    );
    if (!response.ok) {
      window.alert("Không thể cập nhật trạng thái chương trình.");
      return;
    }
    setRows((current) =>
      current.map((item) =>
        item.MaChuongTrinh === row.MaChuongTrinh
          ? { ...item, TrangThai: row.TrangThai ? 0 : 1 }
          : item,
      ),
    );
  };
  const title = flash ? "Flash Sale" : "Chương trình giảm giá";
  return (
    <section className="promotion-page">
      <Header
        title={title}
        eyebrow={`KHUYẾN MÃI / ${title.toUpperCase()}`}
        description="Quản lý thời hạn, trạng thái và phạm vi sản phẩm được giảm giá."
        action="+ Tạo chương trình"
        onAction={() => setForm(true)}
      />
      <Metrics programs={rows} />
      <Tabs
        filter={filter}
        setFilter={setFilter}
        labels={["Tất cả", "Đang bật", "Đã tắt"]}
        counts={[
          rows.length,
          rows.filter((row) => row.TrangThai === 1).length,
          rows.filter((row) => row.TrangThai === 0).length,
        ]}
      />
      <div className="promotion-filters">
        <label>
          ⌕{" "}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên chương trình..."
          />
        </label>
      </div>
      <div className="promo-table-card">
        <Caption
          count={filtered.length}
          loading={loading}
          source="ChuongTrinhGiamGia"
        />
        <table className="promo-table">
          <thead>
            <tr>
              <th>Chương trình</th>
              <th>Mức giảm</th>
              <th>Thời gian hiệu lực</th>
              <th>Phạm vi áp dụng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageRows.map((row) => (
              <tr key={row.MaChuongTrinh}>
                <td>
                  <strong>{row.TenChuongTrinh}</strong>
                  <small>{row.MoTa || "Chưa có mô tả"}</small>
                </td>
                <td>
                  <strong>
                    {row.LoaiGiam === "PHAN_TRAM"
                      ? `${row.GiaTriGiam}%`
                      : money(row.GiaTriGiam)}
                  </strong>
                  <small>
                    {row.LoaiGiam === "PHAN_TRAM"
                      ? "Theo phần trăm"
                      : "Theo số tiền"}
                  </small>
                </td>
                <td>
                  {date(row.NgayBatDau)} - {date(row.NgayKetThuc)}
                </td>
                <td>
                  <span className="scope-pill">Quản lý bên dưới</span>
                </td>
                <td>
                  <span
                    className={`promo-status ${row.TrangThai ? "on" : "off"}`}
                  >
                    {row.TrangThai ? "Đang bật" : "Đã tắt"}
                  </span>
                </td>
                <td>
                  <button
                    className="table-action"
                    onClick={() => void toggleStatus(row)}
                  >
                    {row.TrangThai ? "Tắt" : "Bật"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls {...pagination} onPageChange={pagination.setPage} />
        {filtered.length === 0 && (
          <div className="empty-state">Không có chương trình phù hợp.</div>
        )}
      </div>
      {form && (
        <ProgramForm
          onClose={() => setForm(false)}
          onSaved={(row) => {
            setRows((current) => [row, ...current]);
            setForm(false);
          }}
        />
      )}
    </section>
  );
}

function VoucherForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (row: Voucher) => void;
}) {
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const payload = {
      ...values,
      GiaTriGiam: Number(values.GiaTriGiam),
      GiamToiDa: Number(values.GiamToiDa) || null,
      DonToiThieu: Number(values.DonToiThieu),
      TongSoLuong: Number(values.TongSoLuong) || null,
      SoLanSuDungMoiNguoi: Number(values.SoLanSuDungMoiNguoi),
      TrangThai: 1,
    };
    try {
      const response = await fetch(`${API}/api/admin/vouchers`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      const body = await response.json();
      onSaved({
        ...payload,
        MaGiamGia: body.insertId,
        SoLuongDaSuDung: 0,
      } as Voucher);
    } catch {
      window.alert(
        "Không thể tạo mã giảm giá. Kiểm tra ngày và dữ liệu bắt buộc.",
      );
    }
  };
  return (
    <Modal title="Tạo mã giảm giá" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Mã code
            <input name="MaCode" required placeholder="FASHION20" />
          </label>
          <label>
            Tên mã
            <input name="TenMaGiamGia" required placeholder="Ưu đãi tháng 9" />
          </label>
          <label>
            Loại giảm
            <select name="LoaiGiam">
              <option value="PHAN_TRAM">Phần trăm</option>
              <option value="SO_TIEN">Số tiền</option>
            </select>
          </label>
          <label>
            Giá trị giảm
            <input name="GiaTriGiam" type="number" min="1" required />
          </label>
          <label>
            Giảm tối đa
            <input name="GiamToiDa" type="number" min="0" />
          </label>
          <label>
            Đơn tối thiểu
            <input name="DonToiThieu" type="number" min="0" defaultValue="0" />
          </label>
          <label>
            Tổng số lượng
            <input name="TongSoLuong" type="number" min="1" />
          </label>
          <label>
            Lượt/người
            <input
              name="SoLanSuDungMoiNguoi"
              type="number"
              min="1"
              defaultValue="1"
            />
          </label>
          <label>
            Bắt đầu
            <input name="NgayBatDau" type="datetime-local" required />
          </label>
          <label>
            Kết thúc
            <input name="NgayKetThuc" type="datetime-local" required />
          </label>
        </div>
        <label>
          Mô tả
          <textarea name="MoTa" />
        </label>
        <button className="primary-action">Luu m× gi?m gi×</button>
      </form>
    </Modal>
  );
}
function ProgramForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (row: Program) => void;
}) {
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const payload = {
      ...values,
      GiaTriGiam: Number(values.GiaTriGiam),
      TrangThai: 1,
    };
    try {
      const response = await fetch(`${API}/api/admin/discount-programs`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      const body = await response.json();
      onSaved({ ...payload, MaChuongTrinh: body.insertId } as Program);
    } catch {
      window.alert(
        "Không thể tạo chương trình. Kiểm tra ngày và dữ liệu bắt buộc.",
      );
    }
  };
  return (
    <Modal title="Tạo chương trình giảm giá" onClose={onClose}>
      <form onSubmit={submit}>
        <label>
          Tên chương trình
          <input
            name="TenChuongTrinh"
            required
            placeholder="Flash Sale cuối tuần"
          />
        </label>
        <div className="form-grid">
          <label>
            Loại giảm
            <select name="LoaiGiam">
              <option value="PHAN_TRAM">Phần trăm</option>
              <option value="SO_TIEN">Số tiền</option>
            </select>
          </label>
          <label>
            Giá trị giảm
            <input name="GiaTriGiam" type="number" min="1" required />
          </label>
          <label>
            Bắt đầu
            <input name="NgayBatDau" type="datetime-local" required />
          </label>
          <label>
            Kết thúc
            <input name="NgayKetThuc" type="datetime-local" required />
          </label>
        </div>
        <label>
          Mô tả
          <textarea name="MoTa" />
        </label>
        <button className="primary-action">Lưu chương trình</button>
      </form>
    </Modal>
  );
}
function Header({
  eyebrow,
  title,
  description,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="promotion-heading">
      <div>
        <small>{eyebrow}</small>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div>
        <button className="primary-action" onClick={onAction}>
          {action}
        </button>
      </div>
    </div>
  );
}
function Metrics({
  vouchers,
  programs,
}: {
  vouchers?: Voucher[];
  programs?: Program[];
}) {
  const total = vouchers || programs || [];
  const active = total.filter((row) => row.TrangThai === 1).length;
  const now = Date.now();
  const effective = total.filter((row) => {
    const start = new Date(row.NgayBatDau).getTime();
    const end = new Date(row.NgayKetThuc).getTime();
    return row.TrangThai === 1 && start <= now && end >= now;
  }).length;
  const endingSoon = total.filter((row) => {
    const remaining = new Date(row.NgayKetThuc).getTime() - now;
    return row.TrangThai === 1 && remaining > 0 && remaining < 7 * 86400000;
  }).length;
  return (
    <div className="promotion-metrics">
      <Metric
        title={vouchers ? "Tổng mã giảm giá" : "Tổng chương trình"}
        value={total.length}
        note="theo dữ liệu hệ thống"
        tone="violet"
      />
      <Metric
        title="Đang bật"
        value={active}
        note="theo trạng thái"
        tone="blue"
      />
      <Metric
        title="Đang hiệu lực"
        value={effective}
        note="đúng trạng thái và thời hạn"
        tone="green"
      />
      <Metric
        title="Sắp kết thúc"
        value={endingSoon}
        note="trong 7 ngày tới"
        tone="orange"
      />
    </div>
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
    <article className={`promotion-metric ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
function Tabs({
  filter,
  setFilter,
  labels,
  counts,
}: {
  filter: string;
  setFilter: (value: string) => void;
  labels: string[];
  counts: number[];
}) {
  return (
    <div className="promotion-tabs">
      {labels.map((label, index) => {
        const key = index === 0 ? "ALL" : index === 1 ? "ACTIVE" : "INACTIVE";
        return (
          <button
            className={filter === key ? "selected" : ""}
            key={key}
            onClick={() => setFilter(key)}
          >
            {label}
            <b>{counts[index]}</b>
          </button>
        );
      })}
    </div>
  );
}
function Caption({
  count,
  loading,
  source,
}: {
  count: number;
  loading: boolean;
  source: string;
}) {
  return (
    <div className="table-caption">
      <strong>{count} bản ghi</strong>
      <span>{loading ? "Đang đồng bộ..." : `Cập nhật từ ${source}`}</span>
    </div>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop">
      <div className="promo-modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>{title}</h2>
        <p>Nhập dữ liệu theo đúng schema khuyến mãi.</p>
        {children}
      </div>
    </div>
  );
}
