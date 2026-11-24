import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminModal from "../../components/admin/AdminModal";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";

const MEMBER_TIERS = {
  mam_sach: {
    label: "Mầm Sách",
    icon: "🌱",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  nguoi_doc: {
    label: "Người Đọc",
    icon: "📖",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
  },
  mot_sach: {
    label: "Mọt Sách",
    icon: "📚",
    badge: "bg-[#F5EDE2] text-[#9A5B13] border-[#E5D5BE]",
  },
  tri_ky: {
    label: "Tri Kỷ Thư Viện",
    icon: "🏛️",
    badge: "bg-amber-50 text-amber-900 border-amber-300",
  },
};

const EMPTY_FORM = {
  username: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  role: "user",
  member_tier: "mam_sach",
  status: "active",
};

function resolveMemberTierKey(user) {
  const raw = String(
    user.member_tier || user.tier || user.rank || ""
  ).toLowerCase();
  if (MEMBER_TIERS[raw]) return raw;
  if (raw.includes("tri") || raw.includes("vip")) return "tri_ky";
  if (raw.includes("mot") || raw.includes("gold")) return "mot_sach";
  if (raw.includes("doc") || raw.includes("silver")) return "nguoi_doc";

  const completed = Number(user.completed_orders_count || 0);
  const spent = Number(user.total_spent || 0);
  if (completed >= 7 || spent >= 3000000) return "tri_ky";
  if (completed >= 3 || spent >= 1000000) return "mot_sach";
  if (completed >= 1 || spent >= 300000) return "nguoi_doc";
  return "mam_sach";
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [serverErrors, setServerErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });

  const [confirmState, setConfirmState] = useState({
    open: false,
    variant: "warning",
    title: "",
    message: "",
    detailText: "",
    confirmText: "Xác nhận",
    cancelText: "Quay lại",
    action: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };
  };

  const fetchUsers = async (searchKeyword = "", page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/users", {
        ...getAuthConfig(),
        params: {
          keyword: searchKeyword || undefined,
          page,
        },
      });

      const payload = response.data?.data;
      if (payload && Array.isArray(payload.data)) {
        setUsers(payload.data);
        setCurrentPage(payload.current_page || 1);
        setLastPage(payload.last_page || 1);
      } else if (Array.isArray(payload)) {
        setUsers(payload);
        setCurrentPage(1);
        setLastPage(1);
      }
    } catch {
      setAlertMessage({
        type: "error",
        text: "Không thể tải danh sách người dùng.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("", 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(keyword, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchUsers(keyword, newPage);
    }
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setServerErrors({});
  };

  const requestCancelModal = () => {
    setConfirmState({
      open: true,
      variant: "danger",
      title: "Xác nhận hủy thao tác",
      message:
        "Bạn có chắc chắn muốn hủy và đóng biểu mẫu người dùng? Thông tin chưa lưu sẽ bị mất.",
      detailText: formData.email ? `Tài khoản: ${formData.email}` : "",
      confirmText: "Đồng ý hủy",
      cancelText: "Tiếp tục nhập",
      action: () => {
        resetAndCloseModal();
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setServerErrors({});
    setAlertMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      username: user.username || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      password: "",
      role: user.role || "user",
      member_tier: resolveMemberTierKey(user),
      status: user.status || "active",
    });
    setServerErrors({});
    setAlertMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const executeSaveUser = async () => {
    setActionLoading(true);
    setServerErrors({});
    setAlertMessage({ type: "", text: "" });

    const payload = {
      username: formData.username.trim(),
      name: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      role: formData.role,
      member_tier: formData.member_tier,
      status: formData.status,
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (editingId) {
        await axios.put(
          `/api/admin/users/${editingId}`,
          payload,
          getAuthConfig()
        );
        setAlertMessage({
          type: "success",
          text: `Đã cập nhật thông tin tài khoản #${editingId}.`,
        });
      } else {
        await axios.post("/api/admin/users", payload, getAuthConfig());
        setAlertMessage({
          type: "success",
          text: "Đã thêm tài khoản người dùng mới.",
        });
      }
      resetAndCloseModal();
      fetchUsers(keyword, currentPage);
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
      } else {
        setAlertMessage({
          type: "error",
          text:
            error.response?.data?.message ||
            "Không thể lưu thông tin người dùng.",
        });
      }
    } finally {
      setActionLoading(false);
      setConfirmState((prev) => ({ ...prev, open: false }));
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const tierLabel = MEMBER_TIERS[formData.member_tier]?.label || "Mầm Sách";
    setConfirmState({
      open: true,
      variant: "info",
      title: editingId
        ? "Xác nhận cập nhật người dùng"
        : "Xác nhận tạo tài khoản mới",
      message: editingId
        ? "Bạn có chắc chắn muốn lưu thông tin và cấp bậc thành viên cho tài khoản này?"
        : "Bạn có chắc chắn muốn tạo tài khoản người dùng mới?",
      detailText: `${formData.username} (${formData.email}) — Hạng: ${tierLabel}`,
      confirmText: editingId ? "Lưu thay đổi" : "Tạo tài khoản",
      cancelText: "Quay lại",
      action: executeSaveUser,
    });
  };

  const requestToggleStatus = (user) => {
    const isLocking = user.status === "active";
    setConfirmState({
      open: true,
      variant: isLocking ? "danger" : "warning",
      title: isLocking
        ? "Xác nhận khóa tài khoản"
        : "Xác nhận mở khóa tài khoản",
      message: isLocking
        ? `Người dùng "${user.username}" sẽ không thể đăng nhập sau khi bị khóa.`
        : `Khôi phục quyền đăng nhập và mua hàng cho "${user.username}"?`,
      detailText: `Tài khoản #${user.id}: ${user.email}`,
      confirmText: isLocking ? "Khóa tài khoản" : "Mở khóa",
      cancelText: "Hủy",
      action: async () => {
        setActionLoading(true);
        try {
          await axios.put(
            `/api/admin/users/${user.id}/toggle-status`,
            {},
            getAuthConfig()
          );
          setAlertMessage({
            type: "success",
            text: `Đã cập nhật trạng thái tài khoản "${user.username}".`,
          });
          fetchUsers(keyword, currentPage);
        } catch {
          setAlertMessage({ type: "error", text: "Thao tác thất bại!" });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const requestDeleteUser = (user) => {
    setConfirmState({
      open: true,
      variant: "danger",
      title: "Xác nhận xóa người dùng",
      message:
        "Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản người dùng này khỏi hệ thống?",
      detailText: `#${user.id} - ${user.username} (${user.email})`,
      confirmText: "Xóa người dùng",
      cancelText: "Hủy",
      action: async () => {
        setActionLoading(true);
        try {
          await axios.delete(`/api/admin/users/${user.id}`, getAuthConfig());
          setAlertMessage({
            type: "success",
            text: `Đã xóa người dùng "${user.username}".`,
          });
          fetchUsers(keyword, currentPage);
        } catch (error) {
          setAlertMessage({
            type: "error",
            text:
              error.response?.data?.message || "Không thể xóa người dùng này.",
          });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const displayedUsers =
    tierFilter === "all"
      ? users
      : users.filter((u) => resolveMemberTierKey(u) === tierFilter);

  const inputClass =
    "w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13]";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5";

  return (
    <div className="space-y-4">
      {alertMessage.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium ${
            alertMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {alertMessage.text}
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
              Danh Sách Người Dùng
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Quản lý tài khoản độc giả, phân quyền và cấp bậc thành viên thân
              thiết
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs shrink-0"
          >
            <span className="text-base leading-none">+</span>
            <span>Thêm người dùng</span>
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-4 bg-[#FAF8F5]/70 border-b border-stone-200"
        >
          <input
            type="text"
            placeholder="Tìm theo tên người dùng, email, SĐT..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          >
            <option value="all">Tất cả cấp bậc thành viên</option>
            <option value="mam_sach">🌱 Mầm Sách</option>
            <option value="nguoi_doc">📖 Người Đọc</option>
            <option value="mot_sach">📚 Mọt Sách</option>
            <option value="tri_ky">🏛️ Tri Kỷ Thư Viện</option>
          </select>
          <button
            type="submit"
            className="bg-[#141414] text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-800 transition cursor-pointer"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Độc giả</th>
                <th className="py-3.5 px-4">Liên hệ</th>
                <th className="py-3.5 px-4">Cấp bậc thành viên</th>
                <th className="py-3.5 px-4 text-center">Vai trò</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-stone-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-stone-400">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => {
                  const tierKey = resolveMemberTierKey(user);
                  const tierInfo =
                    MEMBER_TIERS[tierKey] || MEMBER_TIERS.mam_sach;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-stone-50/70 transition"
                    >
                      <td className="py-3.5 px-4 font-semibold text-stone-600 whitespace-nowrap">
                        #{user.id}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#1A1A1A]">
                          {user.username || user.name}
                        </div>
                        <div className="text-xs text-stone-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-stone-700 whitespace-nowrap">
                          {user.phone || "Chưa có SĐT"}
                        </div>
                        <div className="text-[11px] text-stone-400 max-w-[200px] truncate">
                          {user.address || "—"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${tierInfo.badge}`}
                        >
                          <span>{tierInfo.icon}</span>
                          <span>{tierInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {user.role === "admin" ? "Quản trị viên" : "Độc giả"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] text-xs font-semibold transition cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => requestToggleStatus(user)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
                          >
                            {user.status === "active" ? "Khóa" : "Mở"}
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteUser(user)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-stone-200">
          <span className="text-xs sm:text-sm text-stone-500">
            Trang <strong>{currentPage}</strong> / {lastPage}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold disabled:opacity-50 hover:bg-stone-50 transition cursor-pointer"
            >
              Trang trước
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="px-3.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold disabled:opacity-50 hover:bg-stone-50 transition cursor-pointer"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      <AdminModal
        open={isModalOpen}
        onClose={requestCancelModal}
        subtitle={
          editingId ? `Tài khoản #${editingId}` : "Tạo tài khoản độc giả"
        }
        title={
          editingId ? "Cập Nhật Thông Tin Người Dùng" : "Thêm Người Dùng Mới"
        }
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={requestCancelModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="user-modal-form"
              className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              {editingId ? "Lưu thay đổi" : "Tạo tài khoản"}
            </button>
          </>
        }
      >
        <form
          id="user-modal-form"
          onSubmit={handleRequestSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Họ và tên / Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Nguyễn Văn A"
                className={inputClass}
              />
              {serverErrors.username && (
                <p className="text-red-600 text-xs mt-1">
                  {serverErrors.username[0]}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="docgia@bookhouse.vn"
                className={inputClass}
              />
              {serverErrors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {serverErrors.email[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="0909 123 456"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                {editingId
                  ? "Mật khẩu mới (Để trống nếu không đổi)"
                  : "Mật khẩu *"}
              </label>
              <input
                type="password"
                required={!editingId}
                minLength={8}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Tối thiểu 8 ký tự"
                className={inputClass}
              />
              {serverErrors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {serverErrors.password[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Cấp bậc thành viên</label>
              <select
                value={formData.member_tier}
                onChange={(e) =>
                  setFormData({ ...formData, member_tier: e.target.value })
                }
                className={inputClass}
              >
                <option value="mam_sach">🌱 Mầm Sách</option>
                <option value="nguoi_doc">📖 Người Đọc</option>
                <option value="mot_sach">📚 Mọt Sách</option>
                <option value="tri_ky">🏛️ Tri Kỷ Thư Viện</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className={inputClass}
              >
                <option value="user">Độc giả (User)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className={inputClass}
              >
                <option value="active">Hoạt động</option>
                <option value="locked">Đã khóa</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Địa chỉ nhận hàng mặc định</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
              className={inputClass}
            />
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        open={confirmState.open}
        variant={confirmState.variant}
        title={confirmState.title}
        message={confirmState.message}
        detailText={confirmState.detailText}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        loading={actionLoading}
        onConfirm={() => confirmState.action?.()}
        onCancel={() =>
          !actionLoading &&
          setConfirmState((prev) => ({ ...prev, open: false }))
        }
      />
    </div>
  );
}