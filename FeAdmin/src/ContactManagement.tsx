import { useEffect, useState } from "react";
import "./contact.css";

type Contact = {
  MaLienHe: number;
  MaNguoiDung?: number;
  TenDangNhap?: string;
  HoTen: string;
  Email?: string;
  SoDienThoai?: string;
  ChuDe?: string;
  NoiDung: string;
  TrangThai: "CHUA_XU_LY" | "DANG_XU_LY" | "DA_XU_LY";
  NgayGui: string;
  NgayXuLy?: string;
};
const API = import.meta.env.VITE_API_URL || "http://localhost:7000";
const headers = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("admin_token")
    ? { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
    : {}),
});
const statusNames: Record<Contact["TrangThai"], string> = {
  CHUA_XU_LY: "Chưa xử lý",
  DANG_XU_LY: "Đang xử lý",
  DA_XU_LY: "Đã xử lý",
};
const date = (value?: string) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";
export default function ContactManagement() {
  const [rows, setRows] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/lienhe`, { headers: headers() });
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
      `${row.HoTen} ${row.Email || ""} ${row.SoDienThoai || ""} ${row.ChuDe || ""} ${row.NoiDung}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const update = async (row: Contact, next: Contact["TrangThai"]) => {
    try {
      const processedAt =
        next === "DA_XU_LY"
          ? new Date().toISOString().slice(0, 19).replace("T", " ")
          : null;
      const response = await fetch(`${API}/api/lienhe/${row.MaLienHe}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ TrangThai: next, NgayXuLy: processedAt }),
      });
      if (!response.ok) throw new Error();
      const updated = {
        ...row,
        TrangThai: next,
        NgayXuLy: processedAt || undefined,
      };
      setRows((current) =>
        current.map((item) =>
          item.MaLienHe === row.MaLienHe ? updated : item,
        ),
      );
      setSelected(selected?.MaLienHe === row.MaLienHe ? updated : selected);
    } catch {
      window.alert("Không thể cập nhật trạng thái liên hệ.");
    }
  };
  return (
    <section className="contact-page">
      <div className="contact-heading">
        <div>
          <small>LIÊN HỆ / YÊU CẦU KHÁCH HÀNG</small>
          <h1>Quản lý liên hệ</h1>
          <p>
            Tiếp nhận, phân loại và theo dõi tiến độ xử lý các yêu cầu gửi về
            FashionStore.
          </p>
        </div>
      </div>
      <div className="contact-metrics">
        <Metric
          title="Tổng yêu cầu"
          value={rows.length}
          note="toàn hệ thống"
          tone="blue"
        />
        <Metric
          title="Chưa xử lý"
          value={rows.filter((row) => row.TrangThai === "CHUA_XU_LY").length}
          note="cần tiếp nhận"
          tone="orange"
        />
        <Metric
          title="Đang xử lý"
          value={rows.filter((row) => row.TrangThai === "DANG_XU_LY").length}
          note="đang phụ trách"
          tone="violet"
        />
        <Metric
          title="Đã xử lý"
          value={rows.filter((row) => row.TrangThai === "DA_XU_LY").length}
          note="hoàn tất"
          tone="green"
        />
      </div>
      <div className="contact-tabs">
        {[
          ["ALL", "Tất cả"],
          ["CHUA_XU_LY", "Chưa xử lý"],
          ["DANG_XU_LY", "Đang xử lý"],
          ["DA_XU_LY", "Đã xử lý"],
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
      <div className="contact-layout">
        <div>
          <div className="contact-filters">
            <label>
              ⌕{" "}
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên, email, chủ đề hoặc nội dung..."
              />
            </label>
          </div>
          <div className="contact-table-card">
            <div className="table-caption">
              <strong>{filtered.length} yêu cầu liên hệ</strong>
              <span>{loading ? "Đang đồng bộ..." : "Cập nhật từ LienHe"}</span>
            </div>
            <table className="contact-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Người gửi</th>
                  <th>Chủ đề</th>
                  <th>Nội dung</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    className={
                      selected?.MaLienHe === row.MaLienHe ? "active-row" : ""
                    }
                    key={row.MaLienHe}
                  >
                    <td>
                      <b className="contact-code">
                        LH-{String(row.MaLienHe).padStart(5, "0")}
                      </b>
                    </td>
                    <td>
                      <strong>{row.HoTen}</strong>
                      <small>
                        {row.Email || row.SoDienThoai || "Chưa có liên hệ"}
                      </small>
                    </td>
                    <td>{row.ChuDe || "Không có chủ đề"}</td>
                    <td className="message-preview">{row.NoiDung}</td>
                    <td>{date(row.NgayGui)}</td>
                    <td>
                      <span className={`contact-status ${row.TrangThai}`}>
                        {statusNames[row.TrangThai]}
                      </span>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        onClick={() => setSelected(row)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state">Không có yêu cầu phù hợp.</div>
            )}
          </div>
        </div>
        {selected && (
          <ContactDetail
            contact={selected}
            onClose={() => setSelected(null)}
            onUpdate={update}
          />
        )}
      </div>
    </section>
  );
}

function ContactDetail({
  contact,
  onClose,
  onUpdate,
}: {
  contact: Contact;
  onClose: () => void;
  onUpdate: (contact: Contact, next: Contact["TrangThai"]) => Promise<void>;
}) {
  return (
    <aside className="contact-detail">
      <div className="detail-title">
        <div>
          <small>CHI TIẾT YÊU CẦU</small>
          <h2>LH-{String(contact.MaLienHe).padStart(5, "0")}</h2>
        </div>
        <button onClick={onClose}>×</button>
      </div>
      <span className={`contact-status ${contact.TrangThai}`}>
        {statusNames[contact.TrangThai]}
      </span>
      <div className="detail-section">
        <h3>Thông tin người gửi</h3>
        <strong>{contact.HoTen}</strong>
        <p>
          {contact.Email || "Chưa có email"}
          <br />
          {contact.SoDienThoai || "Chưa có số điện thoại"}
        </p>
      </div>
      <div className="detail-section">
        <h3>Nội dung liên hệ</h3>
        <strong>{contact.ChuDe || "Không có chủ đề"}</strong>
        <p className="detail-message">{contact.NoiDung}</p>
      </div>
      <div className="detail-section">
        <h3>Thời gian</h3>
        <p>
          Ngày gửi: {date(contact.NgayGui)}
          <br />
          Ngày xử lý: {date(contact.NgayXuLy)}
        </p>
      </div>
      <div className="detail-actions">
        <select
          value={contact.TrangThai}
          onChange={(event) =>
            void onUpdate(contact, event.target.value as Contact["TrangThai"])
          }
        >
          {Object.entries(statusNames).map(([key, label]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
        <button
          className="primary-action"
          onClick={() => void onUpdate(contact, "DA_XU_LY")}
        >
          Đánh dấu đã xử lý
        </button>
      </div>
    </aside>
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
    <article className={`contact-metric ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
