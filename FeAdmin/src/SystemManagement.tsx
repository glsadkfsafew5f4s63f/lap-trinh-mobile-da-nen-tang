import { useEffect, useState } from "react";
import "./system.css";

type AdminUser = {
  MaNguoiDung: number;
  TenDangNhap: string;
  HoTen: string;
  Email?: string;
  DienThoai?: string;
  TrangThai: "HOAT_DONG" | "KHOA";
  NgayTao: string;
  roles?: string;
  roleIds?: string;
};
type AssignableRole = Pick<Role, "MaVaiTro" | "TenVaiTro" | "MoTa">;
type Role = {
  MaVaiTro: number;
  TenVaiTro: string;
  MoTa?: string;
  TrangThai: number;
  SoTaiKhoan: number;
  NgayTao: string;
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
export default function SystemManagement({ mode }: { mode: string }) {
  return mode === "roles" ? <RoleScreen /> : <AdminUserScreen />;
}
function AdminUserScreen() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [assignableRoles, setAssignableRoles] = useState<AssignableRole[]>([]);
  const [assigning, setAssigning] = useState<AdminUser | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newStaffRoleIds, setNewStaffRoleIds] = useState<number[]>([]);
  const [savingNewStaff, setSavingNewStaff] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/admin/users`, { headers: headers() }),
      fetch(`${API}/api/vaitro`, { headers: headers() }),
    ])
      .then(async ([usersResponse, rolesResponse]) => {
        const [usersBody, rolesBody] = await Promise.all([
          usersResponse.ok ? usersResponse.json() : null,
          rolesResponse.ok ? rolesResponse.json() : null,
        ]);
        if (Array.isArray(usersBody?.data)) setRows(usersBody.data);
        if (Array.isArray(rolesBody?.data)) {
          setAssignableRoles(
            rolesBody.data.filter(
              (role: Role) =>
                role.TrangThai === 1 &&
                (role.TenVaiTro === "ADMIN" || role.TenVaiTro.startsWith("NHAN_VIEN_")),
            ),
          );
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);
  const filtered = rows.filter(
    (row) =>
      (filter === "ALL" || row.TrangThai === filter) &&
      `${row.HoTen} ${row.TenDangNhap} ${row.Email || ""} ${row.roles || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const update = async (row: AdminUser) => {
    const next = row.TrangThai === "HOAT_DONG" ? "KHOA" : "HOAT_DONG";
    const response = await fetch(
      `${API}/api/admin/users/${row.MaNguoiDung}/status`,
      {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ TrangThai: next }),
      },
    );
    if (response.ok)
      setRows((current) =>
        current.map((item) =>
          item.MaNguoiDung === row.MaNguoiDung
            ? { ...item, TrangThai: next }
            : item,
        ),
      );
    else window.alert("Không thể cập nhật tài khoản quản trị.");
  };
  const openRoleAssignment = (row: AdminUser) => {
    const validIds = new Set(assignableRoles.map((role) => role.MaVaiTro));
    setSelectedRoleIds(
      (row.roleIds || "")
        .split(",")
        .map(Number)
        .filter((id) => validIds.has(id)),
    );
    setAssigning(row);
  };
  const saveRoleAssignment = async () => {
    if (!assigning || !selectedRoleIds.length) return;
    setSavingRoles(true);
    try {
      const response = await fetch(
        `${API}/api/admin/users/${assigning.MaNguoiDung}/roles`,
        {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({ MaVaiTro: selectedRoleIds }),
        },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Không thể lưu phân quyền.");
      setRows((current) =>
        current.map((row) =>
          row.MaNguoiDung === assigning.MaNguoiDung
            ? {
                ...row,
                roles: selectedRoleIds
                  .map((id) => assignableRoles.find((role) => role.MaVaiTro === id)?.TenVaiTro)
                  .filter(Boolean)
                  .join(", "),
                roleIds: selectedRoleIds.join(","),
              }
            : row,
        ),
      );
      setAssigning(null);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không thể lưu phân quyền.");
    } finally {
      setSavingRoles(false);
    }
  };
  const createEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newStaffRoleIds.length) {
      window.alert("Chọn ít nhất một lĩnh vực cho nhân viên.");
      return;
    }
    setSavingNewStaff(true);
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await fetch(`${API}/api/admin/users`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ ...values, MaVaiTro: newStaffRoleIds }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Không thể tạo tài khoản nhân viên.");
      setRows((current) => [body.data, ...current]);
      setCreating(false);
      setNewStaffRoleIds([]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không thể tạo tài khoản nhân viên.");
    } finally {
      setSavingNewStaff(false);
    }
  };
  return (
    <SystemShell
      eyebrow="HỆ THỐNG / TÀI KHOẢN QUẢN TRỊ"
      title="Tài khoản quản trị"
      description="Quản lý tài khoản nhân sự được cấp vai trò quản trị và quyền vận hành trong hệ thống."
    >
      <div className="system-metrics">
        <Metric
          title="Tổng tài khoản"
          value={rows.length}
          note="ADMIN & NHÂN VIÊN"
          tone="blue"
        />
        <Metric
          title="Đang hoạt động"
          value={rows.filter((row) => row.TrangThai === "HOAT_DONG").length}
          note="có thể đăng nhập"
          tone="green"
        />
        <Metric
          title="Đã khóa"
          value={rows.filter((row) => row.TrangThai === "KHOA").length}
          note="không thể đăng nhập"
          tone="red"
        />
        <Metric
          title="Vai trò đang dùng"
          value={
            new Set(rows.flatMap((row) => (row.roles || "").split(", "))).size
          }
          note="theo tài khoản"
          tone="violet"
        />
      </div>
      <SystemTabs
        filter={filter}
        setFilter={setFilter}
        labels={["Tất cả", "Đang hoạt động", "Đã khóa"]}
        counts={[
          rows.length,
          rows.filter((row) => row.TrangThai === "HOAT_DONG").length,
          rows.filter((row) => row.TrangThai === "KHOA").length,
        ]}
      />
      <div className="system-filters">
        <label>
          ⌕{" "}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên, username, email hoặc vai trò..."
          />
        </label>
        <button className="primary-action" onClick={() => setCreating(true)}>
          ＋ Tạo tài khoản nhân viên
        </button>
      </div>
      <TableBox
        count={filtered.length}
        loading={loading}
        source="NguoiDung + NguoiDungVaiTro"
      >
        <table className="system-table">
          <thead>
            <tr>
              <th>Tài khoản</th>
              <th>Liên hệ</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
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
                    @{row.TenDangNhap} · #{row.MaNguoiDung}
                  </small>
                </td>
                <td>
                  <strong>{row.Email || "-"}</strong>
                  <small>{row.DienThoai || "Chưa có số điện thoại"}</small>
                </td>
                <td>
                  <div className="role-list">
                    {(row.roles || "Chưa gán").split(", ").map((role) => (
                      <span key={role}>{role}</span>
                    ))}
                  </div>
                </td>
                <td>{date(row.NgayTao)}</td>
                <td>
                  <span className={`account-status ${row.TrangThai}`}>
                    {row.TrangThai === "HOAT_DONG"
                      ? "● Hoạt động"
                      : "● Đã khóa"}
                  </span>
                </td>
                <td>
                  <button
                    className="table-action"
                    onClick={() => openRoleAssignment(row)}
                  >
                    Phân quyền
                  </button>
                  <button
                    className="table-action"
                    onClick={() => void update(row)}
                  >
                    {row.TrangThai === "HOAT_DONG" ? "Khóa" : "Mở khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableBox>
      {assigning && (
        <div className="modal-backdrop">
          <section className="system-modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => setAssigning(null)}
            >
              ×
            </button>
            <h2>Phân công lĩnh vực</h2>
            <p>{assigning.HoTen} · @{assigning.TenDangNhap}</p>
            <div className="permission-options">
              {assignableRoles.map((role) => (
                <label className="permission-option" key={role.MaVaiTro}>
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.MaVaiTro)}
                    onChange={(event) =>
                      setSelectedRoleIds((current) =>
                        event.target.checked
                          ? [...current, role.MaVaiTro]
                          : current.filter((id) => id !== role.MaVaiTro),
                      )
                    }
                  />
                  <span>
                    <strong>{role.TenVaiTro}</strong>
                    <small>{role.MoTa || ""}</small>
                  </span>
                </label>
              ))}
            </div>
            <button
              className="primary-action"
              disabled={savingRoles || !selectedRoleIds.length}
              onClick={() => void saveRoleAssignment()}
            >
              {savingRoles ? "Đang lưu..." : "Lưu phân công"}
            </button>
          </section>
        </div>
      )}
      {creating && (
        <div className="modal-backdrop">
          <form className="system-modal" onSubmit={(event) => void createEmployee(event)}>
            <button type="button" className="modal-close" onClick={() => setCreating(false)}>
              ×
            </button>
            <h2>Tạo tài khoản nhân viên</h2>
            <label>
              Tên đăng nhập
              <input name="TenDangNhap" required maxLength={50} autoComplete="username" />
            </label>
            <label>
              Mật khẩu tạm
              <input name="MatKhau" required minLength={8} autoComplete="new-password" />
            </label>
            <label>
              Họ và tên
              <input name="HoTen" required maxLength={100} />
            </label>
            <label>
              Email
              <input name="Email" type="email" maxLength={100} />
            </label>
            <label>
              Điện thoại
              <input name="DienThoai" type="tel" maxLength={20} />
            </label>
            <strong>Phạm vi công việc</strong>
            <div className="permission-options">
              {assignableRoles.filter((role) => role.TenVaiTro !== "ADMIN").map((role) => (
                <label className="permission-option" key={role.MaVaiTro}>
                  <input
                    type="checkbox"
                    checked={newStaffRoleIds.includes(role.MaVaiTro)}
                    onChange={(event) =>
                      setNewStaffRoleIds((current) =>
                        event.target.checked
                          ? [...current, role.MaVaiTro]
                          : current.filter((id) => id !== role.MaVaiTro),
                      )
                    }
                  />
                  <span>
                    <strong>{role.TenVaiTro}</strong>
                    <small>{role.MoTa || ""}</small>
                  </span>
                </label>
              ))}
            </div>
            <button className="primary-action" disabled={savingNewStaff}>
              {savingNewStaff ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </form>
        </div>
      )}
    </SystemShell>
  );
}
function RoleScreen() {
  const [rows, setRows] = useState<Role[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/vaitro`, { headers: headers() }).then((response) =>
        response.ok ? response.json() : null,
      ),
      fetch(`${API}/api/nguoidungvaitro`, { headers: headers() }).then(
        (response) => (response.ok ? response.json() : null),
      ),
    ])
      .then(([roleBody, assignmentBody]) => {
        const roles: Role[] = Array.isArray(roleBody?.data)
          ? roleBody.data
          : [];
        const assignments = Array.isArray(assignmentBody?.data)
          ? assignmentBody.data
          : [];
        const counts = new Map<number, number>();
        for (const assignment of assignments) {
          counts.set(
            assignment.MaVaiTro,
            (counts.get(assignment.MaVaiTro) || 0) + 1,
          );
        }
        setRows(
          roles.map((role) => ({
            ...role,
            SoTaiKhoan: counts.get(role.MaVaiTro) || 0,
          })),
        );
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);
  const filtered = rows.filter((row) =>
    `${row.TenVaiTro} ${row.MoTa || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const toggleStatus = async (row: Role) => {
    const next = row.TrangThai ? 0 : 1;
    const response = await fetch(`${API}/api/vaitro/${row.MaVaiTro}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ TrangThai: next }),
    });
    if (!response.ok) {
      window.alert("Không thể cập nhật trạng thái vai trò.");
      return;
    }
    setRows((current) =>
      current.map((item) =>
        item.MaVaiTro === row.MaVaiTro ? { ...item, TrangThai: next } : item,
      ),
    );
  };
  return (
    <SystemShell
      eyebrow="HỆ THỐNG / PHÂN QUYỀN"
      title="Phân quyền"
      description="Quản lý vai trò được định nghĩa trong hệ thống và theo dõi số tài khoản đang sử dụng từng vai trò."
    >
      <div className="system-metrics">
        <Metric
          title="Tổng vai trò"
          value={rows.length}
          note="bản ghi VaiTro"
          tone="blue"
        />
        <Metric
          title="Đang hoạt động"
          value={rows.filter((row) => row.TrangThai === 1).length}
          note="có thể gán"
          tone="green"
        />
        <Metric
          title="Tài khoản đã gán"
          value={rows.reduce(
            (sum, row) => sum + Number(row.SoTaiKhoan || 0),
            0,
          )}
          note="tổng liên kết"
          tone="violet"
        />
        <Metric
          title="Chưa sử dụng"
          value={rows.filter((row) => !row.SoTaiKhoan).length}
          note="có thể rà soát"
          tone="orange"
        />
      </div>
      <div className="system-filters">
        <label>
          ⌕{" "}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên vai trò hoặc mô tả..."
          />
        </label>
      </div>
      <TableBox
        count={filtered.length}
        loading={loading}
        source="VaiTro + NguoiDungVaiTro"
      >
        <table className="system-table">
          <thead>
            <tr>
              <th>Vai trò</th>
              <th>Mô tả</th>
              <th>Tài khoản đang dùng</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.MaVaiTro}>
                <td>
                  <strong className="role-name">{row.TenVaiTro}</strong>
                  <small>#{row.MaVaiTro}</small>
                </td>
                <td>{row.MoTa || "Chưa có mô tả"}</td>
                <td>
                  <strong>{row.SoTaiKhoan}</strong> tài khoản
                </td>
                <td>{date(row.NgayTao)}</td>
                <td>
                  <span
                    className={`account-status ${row.TrangThai ? "HOAT_DONG" : "KHOA"}`}
                  >
                    {row.TrangThai ? "● Đang hoạt động" : "● Đã tắt"}
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
      </TableBox>
    </SystemShell>
  );
}
function SystemShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="system-page">
      <div className="system-heading">
        <div>
          <small>{eyebrow}</small>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
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
    <article className={`system-metric ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
function SystemTabs({
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
    <div className="system-tabs">
      {labels.map((label, index) => {
        const key = index === 0 ? "ALL" : index === 1 ? "HOAT_DONG" : "KHOA";
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
function TableBox({
  count,
  loading,
  source,
  children,
}: {
  count: number;
  loading: boolean;
  source: string;
  children: React.ReactNode;
}) {
  return (
    <div className="system-table-card">
      <div className="table-caption">
        <strong>{count} bản ghi</strong>
        <span>{loading ? "Đang đồng bộ..." : `Cập nhật từ ${source}`}</span>
      </div>
      {children}
    </div>
  );
}
