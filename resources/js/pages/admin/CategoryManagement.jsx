import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminModal from "../../components/admin/AdminModal";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";

const EMPTY_FORM = {
  name: "",
  description: "",
  display_order: "0",
  status: "active",
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/categories", getAuthConfig());
      setCategories(res.data.data || []);
    } catch {
      setAlertMessage({
        type: "error",
        text: "Không thể tải danh sách danh mục.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
        "Bạn có chắc chắn muốn hủy và đóng biểu mẫu danh mục? Thay đổi chưa lưu sẽ bị mất.",
      detailText: formData.name ? `Danh mục: ${formData.name}` : "",
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

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      display_order: String(category.display_order ?? 0),
      status: category.status || "active",
    });
    setServerErrors({});
    setAlertMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const executeSaveCategory = async () => {
    setServerErrors({});
    setAlertMessage({ type: "", text: "" });
    setActionLoading(true);

    try {
      if (editingId) {
        const res = await axios.put(
          `/api/admin/categories/${editingId}`,
          formData,
          getAuthConfig()
        );
        setAlertMessage({
          type: "success",
          text: res.data?.message || "Cập nhật danh mục thành công!",
        });
      } else {
        const res = await axios.post(
          "/api/admin/categories",
          formData,
          getAuthConfig()
        );
        setAlertMessage({
          type: "success",
          text: res.data?.message || "Thêm danh mục mới thành công!",
        });
      }
      resetAndCloseModal();
      fetchCategories();
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
      } else {
        setAlertMessage({
          type: "error",
          text:
            error.response?.data?.message || "Có lỗi xảy ra khi lưu danh mục.",
        });
      }
    } finally {
      setActionLoading(false);
      setConfirmState((prev) => ({ ...prev, open: false }));
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    setConfirmState({
      open: true,
      variant: "info",
      title: editingId
        ? "Xác nhận cập nhật danh mục"
        : "Xác nhận thêm danh mục mới",
      message: editingId
        ? "Bạn có chắc chắn muốn lưu thay đổi cho danh mục này?"
        : "Bạn có chắc chắn muốn thêm danh mục mới này?",
      detailText: `Danh mục: ${formData.name}`,
      confirmText: editingId ? "Lưu thay đổi" : "Thêm danh mục",
      cancelText: "Quay lại",
      action: executeSaveCategory,
    });
  };

  const requestToggleStatus = (category) => {
    const nextStatus = category.status === "active" ? "inactive" : "active";
    const label = nextStatus === "active" ? "Hiển thị" : "Ẩn";
    setConfirmState({
      open: true,
      variant: "warning",
      title: `Xác nhận ${label.toLowerCase()} danh mục`,
      message: `Bạn có chắc chắn muốn chuyển danh mục "${category.name}" sang trạng thái ${label}?`,
      detailText: `Danh mục #${category.id}: ${category.name}`,
      confirmText: `Xác nhận ${label}`,
      cancelText: "Hủy",
      action: async () => {
        setActionLoading(true);
        try {
          await axios.put(
            `/api/admin/categories/${category.id}`,
            {
              name: category.name,
              description: category.description || "",
              display_order: category.display_order ?? 0,
              status: nextStatus,
            },
            getAuthConfig()
          );
          setAlertMessage({
            type: "success",
            text: `Đã cập nhật trạng thái danh mục "${category.name}".`,
          });
          fetchCategories();
        } catch (error) {
          setAlertMessage({
            type: "error",
            text: error.response?.data?.message || "Không thể đổi trạng thái.",
          });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const requestDeleteCategory = (category) => {
    setConfirmState({
      open: true,
      variant: "danger",
      title: "Xác nhận xóa danh mục",
      message:
        "Bạn có chắc chắn muốn xóa danh mục này? Các sách thuộc danh mục có thể bị ảnh hưởng.",
      detailText: `Danh mục #${category.id}: ${category.name}`,
      confirmText: "Xóa danh mục",
      cancelText: "Hủy",
      action: async () => {
        setActionLoading(true);
        setAlertMessage({ type: "", text: "" });
        try {
          const res = await axios.delete(
            `/api/admin/categories/${category.id}`,
            getAuthConfig()
          );
          setAlertMessage({
            type: "success",
            text: res.data?.message || "Đã xóa danh mục.",
          });
          if (editingId === category.id) resetAndCloseModal();
          fetchCategories();
        } catch (error) {
          setAlertMessage({
            type: "error",
            text:
              error.response?.data?.message || "Không thể xóa danh mục này.",
          });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchKeyword =
        !keyword.trim() ||
        cat.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        cat.description?.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus =
        statusFilter === "all" || cat.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [categories, keyword, statusFilter]);

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

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
              Danh Sách Danh Mục Sách
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Phân loại thể loại sách hiển thị trên thanh điều hướng và bộ lọc
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs shrink-0"
          >
            <span className="text-base leading-none">+</span>
            <span>Thêm danh mục</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-4 bg-[#FAF8F5]/70 border-b border-stone-200">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên danh mục hoặc mô tả..."
            className="flex-1 px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          >
            <option value="all">Tất cả trạng thái ({categories.length})</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đang ẩn</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4 whitespace-nowrap">ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tên danh mục</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Mô tả</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  Thứ tự
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  Số đầu sách
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap w-44">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-stone-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-stone-400">
                    Chưa có danh mục nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-600 whitespace-nowrap">
                      #{cat.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1A1A1A] whitespace-nowrap">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 max-w-sm lg:max-w-md truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-stone-600 whitespace-nowrap">
                      {cat.display_order ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-block bg-amber-50 text-[#9A5B13] font-semibold px-2.5 py-0.5 rounded-full text-xs">
                        {cat.products_count ?? 0} sách
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          cat.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {cat.status === "active" ? "Hiển thị" : "Đang ẩn"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap w-44">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(cat)}
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => requestToggleStatus(cat)}
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 border border-stone-200 text-[#9A5B13] text-xs font-medium transition cursor-pointer"
                        >
                          {cat.status === "active" ? "Ẩn" : "Hiện"}
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteCategory(cat)}
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-red-50/70 border border-red-200/80 text-red-600 text-xs font-medium transition cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        open={isModalOpen}
        onClose={requestCancelModal}
        subtitle={editingId ? `Danh mục #${editingId}` : "Tạo phân loại mới"}
        title={editingId ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
        maxWidth="max-w-lg"
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
              form="category-modal-form"
              className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              {editingId ? "Lưu thay đổi" : "Thêm danh mục"}
            </button>
          </>
        }
      >
        <form
          id="category-modal-form"
          onSubmit={handleRequestSubmit}
          className="space-y-4"
        >
          <div>
            <label className={labelClass}>
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Tiểu thuyết trinh thám"
              className={inputClass}
            />
            {serverErrors.name && (
              <p className="text-red-600 text-xs mt-1">
                {serverErrors.name[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Thứ tự hiển thị</label>
              <input
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: e.target.value })
                }
                className={inputClass}
              />
              {serverErrors.display_order && (
                <p className="text-red-600 text-xs mt-1">
                  {serverErrors.display_order[0]}
                </p>
              )}
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
                <option value="active">Hiển thị (Active)</option>
                <option value="inactive">Đang ẩn (Inactive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn về danh mục..."
              className={inputClass}
            />
            {serverErrors.description && (
              <p className="text-red-600 text-xs mt-1">
                {serverErrors.description[0]}
              </p>
            )}
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