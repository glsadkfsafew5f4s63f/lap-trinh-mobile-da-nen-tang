import { useEffect, useState } from "react";
import "./customer.css";
import ReviewAdminScreen from "./ReviewAdminScreen";

type User = {
  MaNguoiDung: number;
  TenDangNhap: string;
  HoTen: string;
  Email?: string;
  DienThoai?: string;
  TrangThai: "HOAT_DONG" | "KHOA";
  NgayTao: string;
  roles?: string;
};
const API = import.meta.env.VITE_API_URL || "http://localhost:7000";
const headers = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("admin_token")
    ? { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
    : {}),
});
const date = (value?: string) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "-";
export default function CustomerManagement({ mode }: { mode: string }) {
  return mode === "reviews" ? <ReviewAdminScreen /> : <UserScreen />;
}

function UserScreen() {
  const [rows, setRows] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/admin/customers`, {
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
      (filter === "ALL" || row.TrangThai === filter) &&
      `${row.HoTen} ${row.Email || ""} ${row.TenDangNhap} ${row.DienThoai || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const setStatus = async (row: User) => {
    const next = row.TrangThai === "HOAT_DONG" ? "KHOA" : "HOAT_DONG";
    try {
      const response = await fetch(
        `${API}/api/admin/customers/${row.MaNguoiDung}/status`,
        {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({ TrangThai: next }),
        },
      );
      if (!response.ok) throw new Error();
      setRows((current) =>
        current.map((item) =>
          item.MaNguoiDung === row.MaNguoiDung
            ? { ...item, TrangThai: next }
            : item,
        ),
      );
    } catch {
      window.alert("Không thể cập nhật trạng thái người dùng.");
    }
  };
  return (
    <section className="customer-page">
      <Heading
        title="Quản lý khách hàng"
        eyebrow="KHÁCH HÀNG / NGƯỜI DÙNG"
        description="Xem hồ sơ khách hàng và cập nhật trạng thái tài khoản."
      />
      <div className="customer-metrics">
        <Metric
          title="Tổng khách hàng"
          value={rows.length}
          note="toàn hệ thống"
          tone="blue"
        />
        <Metric
          title="Khách hoạt động"
          value={rows.filter((row) => row.TrangThai === "HOAT_DONG").length}
          note="đang tương tác"
          tone="green"
        />
        <Metric
          title="Hồ sơ bị khóa"
          value={rows.filter((row) => row.TrangThai === "KHOA").length}
          note="cần kiểm tra"
          tone="red"
        />
      </div>
      <div className="customer-tabs">
        {[
          ["ALL", "Tất cả"],
          ["HOAT_DONG", "Hoạt động"],
          ["KHOA", "Đã khóa"],
        ].map(([key, label]) => (
          <button
            className={filter === key ? "selected" : ""}
            key={key}
            onClick={() => setFilter(key)}
          >
            {label}
            <b>
              {key === "ALL"
                ? rows.length
                : rows.filter((row) => row.TrangThai === key).length}
            </b>
          </button>
        ))}
      </div>
      <div className="customer-filters">
        <label>
          ⌕{" "}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên, email, số điện thoại hoặc mã khách hàng..."
          />
        </label>
      </div>
      <div className="customer-table-card">
        <div className="table-caption">
          <strong>{filtered.length} khách hàng</strong>
          <span>{loading ? "Đang đồng bộ..." : "Cập nhật từ NguoiDung"}</span>
        </div>
        <table className="customer-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Liên hệ</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.MaNguoiDung}>
                <td>
                  <strong>{row.HoTen}</strong>
                  <small>
                    KH-{String(row.MaNguoiDung).padStart(5, "0")} · Tham gia:{" "}
                    {date(row.NgayTao)}
                  </small>
                </td>
                <td>
                  <strong>{row.DienThoai || "-"}</strong>
                  <small>{row.Email || "Chưa có email"}</small>
                </td>
                <td>{row.roles || "KHACH_HANG"}</td>
                <td>{date(row.NgayTao)}</td>
                <td>
                  <span className={`user-status ${row.TrangThai}`}>
                    {row.TrangThai === "HOAT_DONG"
                      ? "● Hoạt động"
                      : "● Đã khóa"}
                  </span>
                </td>
                <td>
                  <button
                    className="table-action"
                    onClick={() => void setStatus(row)}
                  >
                    {row.TrangThai === "HOAT_DONG" ? "Khóa" : "Mở khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">Không có khách hàng phù hợp.</div>
        )}
      </div>
    </section>
  );
}

function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="customer-heading">
      <div>
        <small>{eyebrow}</small>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
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
    <article className={`customer-metric ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
