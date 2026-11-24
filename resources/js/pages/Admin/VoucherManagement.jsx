import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminModal from "../../components/admin/AdminModal";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";

const VOUCHERS_STORAGE_KEY = "bookhouse_admin_vouchers";

const DEFAULT_VOUCHERS = [
  {
    id: 1,
    code: "BOOKHOUSE15",
    name: "Ưu đãi độc giả mới giảm 15%",
    discount_type: "percent",
    discount_value: 15,
    max_discount: 50000,
    min_order_amount: 150000,
    usage_limit: 200,
    used_count: 48,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "active",
  },
  {
    id: 2,
    code: "TRIKY30K",
    name: "Voucher giảm trực tiếp 30.000đ",
    discount_type: "fixed",
    discount_value: 30000,
    max_discount: 0,
    min_order_amount: 250000,
    usage_limit: 100,
    used_count: 100,
    start_date: "2026-03-01",
    end_date: "2026-12-31",
    status: "active",
  },
];

const EMPTY_FORM = {
  code: "",
  name: "",
  discount_type: "percent",
  discount_value: "",
  max_discount: "0",
  min_order_amount: "0",
  usage_limit: "100",
  start_date: "",
  end_date: "",
  status: "active",
};

const formatVND = (val) => Number(val || 0).toLocaleString("vi-VN") + " ₫";

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
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

  const syncLocal = (nextList) => {
    setVouchers(nextList);
    localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(nextList));
    window.dispatchEvent(new CustomEvent("vouchers-updated"));
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/vouchers", getAuthConfig());
      const list = res.data?.data || res.data || [];
      setVouchers(Array.isArray(list) ? list : []);
    } catch {
      try {
        const saved = JSON.parse(
          localStorage.getItem(VOUCHERS_STORAGE_KEY) || "null"
        );
        setVouchers(Array.isArray(saved) ? saved : DEFAULT_VOUCHERS);
      } catch {
        setVouchers(DEFAULT_VOUCHERS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const requestCancelModal = () => {
    setConfirmState({
      open: true,
      variant: "danger",
      title: "Xác nhận hủy thao tác",
      message:
        "Bạn có chắc chắn muốn hủy và đóng biểu mẫu voucher? Dữ liệu chưa lưu sẽ bị mất.",
      detailText: formData.code ? `Mã voucher: ${formData.code}` : "",
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
    setAlertMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (v) => {
    setEditingId(v.id);
    setFormData({
      code: v.code || "",
      name: v.name || v.description || "",
      discount_type: v.discount_type || "percent",
      discount_value: String(v.discount_value ?? ""),
      max_discount: String(v.max_discount ?? 0),
      min_order_amount: String(v.min_order_amount ?? 0),
      usage_limit: String(v.usage_limit ?? 100),
      start_date: (v.start_date || "").slice(0, 10),
      end_date: (v.end_date || "").slice(0, 10),
      status: v.status || "active",
    });
    setAlertMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const executeSaveVoucher = async () => {
    const cleanCode = formData.code.trim().toUpperCase();
    setActionLoading(true);
    setAlertMessage({ type: "", text: "" });

    const payload = {
      ...formData,
      code: cleanCode,
      discount_value: Number(formData.discount_value || 0),
      max_discount: Number(formData.max_discount || 0),
      min_order_amount: Number(formData.min_order_amount || 0),
      usage_limit: Number(formData.usage_limit || 0),
    };

    try {
      if (editingId) {
        await axios.put(
          `/api/admin/vouchers/${editingId}`,
          payload,
          getAuthConfig()
        );
      } else {
        await axios.post("/api/admin/vouchers", payload, getAuthConfig());
      }
      await fetchVouchers();
    } catch {
      if (editingId) {
        const next = vouchers.map((item) =>
          item.id === editingId ? { ...item, ...payload, id: editingId } : item
        );
        syncLocal(next);
      } else {
        const next = [
          { ...payload, id: Date.now(), used_count: 0 },
          ...vouchers,
        ];
        syncLocal(next);
      }
    }

    setAlertMessage({
      type: "success",
      text: editingId
        ? `Đã cập nhật voucher ${cleanCode}.`
        : `Đã tạo voucher khuyến mãi ${cleanCode}.`,
    });
    setActionLoading(false);
    setConfirmState((prev) => ({ ...prev, open: false }));
    resetAndCloseModal();
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      setAlertMessage({ type: "error", text: "Vui lòng nhập mã voucher." });
      return;
    }

    setConfirmState({
      open: true,
      variant: "info",
      title: editingId
        ? "Xác nhận cập nhật voucher"
        : "Xác nhận tạo voucher khuyến mãi",
      message: editingId
        ? "Bạn có chắc chắn muốn lưu thay đổi cho mã khuyến mãi này?"
        : "Bạn có chắc chắn muốn phát hành mã khuyến mãi mới này?",
      detailText: `Mã: ${cleanCode} (${
        formData.discount_type === "percent"
          ? `Giảm ${formData.discount_value}%`
          : `Giảm ${formatVND(formData.discount_value)}`
      })`,
      confirmText: editingId ? "Lưu voucher" : "Tạo voucher",
      cancelText: "Quay lại",
      action: executeSaveVoucher,
    });
  };

  const requestToggleStatus = (voucher) => {
    const nextStatus = voucher.status === "active" ? "inactive" : "active";
    const label = nextStatus === "active" ? "Kích hoạt" : "Tạm ngưng";
    setConfirmState({
      open: true,
      variant: "warning",
      title: `Xác nhận ${label.toLowerCase()} voucher`,
      message: `Bạn có chắc chắn muốn ${label.toLowerCase()} mã khuyến mãi "${
        voucher.code
      }"?`,
      detailText: `${voucher.code} — ${voucher.name || ""}`,
      confirmText: label,
      cancelText: "Hủy",
      action: async () => {
        setActionLoading(true);
        try {
          await axios.put(
            `/api/admin/vouchers/${voucher.id}`,
            { ...voucher, status: nextStatus },
            getAuthConfig()
          );
          fetchVouchers();
        } catch {
          const next = vouchers.map((v) =>
            v.id === voucher.id ? { ...v, status: nextStatus } : v
          );
          syncLocal(next);
        }
        setAlertMessage({
          type: "success",
          text: `Đã đổi trạng thái mã ${voucher.code}.`,
        });
        setActionLoading(false);
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const requestDeleteVoucher = (voucher) => {
    setConfirmState({
      open: true,
      variant: "danger",
      title: "Xác nhận xóa voucher khuyến mãi",
      message: "Bạn có chắc chắn muốn xóa vĩnh viễn mã khuyến mãi này?",
      detailText: `Mã voucher: ${voucher.code}`,
      confirmText: "Xóa voucher",
      cancelText: "Hủy",
      action: async () => {
        setActionLoading(true);
        try {
          await axios.delete(
            `/api/admin/vouchers/${voucher.id}`,
            getAuthConfig()
          );
          fetchVouchers();
        } catch {
          const next = vouchers.filter((v) => v.id !== voucher.id);
          syncLocal(next);
        }
        setAlertMessage({
          type: "success",
          text: `Đã xóa voucher ${voucher.code}.`,
        });
        setActionLoading(false);
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchKw =
        !keyword.trim() ||
        v.code?.toLowerCase().includes(keyword.toLowerCase()) ||
        v.name?.toLowerCase().includes(keyword.toLowerCase());
      const matchSt = statusFilter === "all" || v.status === statusFilter;
      return matchKw && matchSt;
    });
  }, [vouchers, keyword, statusFilter]);

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
              Quản Lý Voucher Khuyến Mãi
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Tạo và kiểm soát mã giảm giá, điều kiện áp dụng đơn hàng và giới
              hạn lượt dùng
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs shrink-0"
          >
            <span className="text-base leading-none">+</span>
            <span>Thêm voucher mới</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-4 bg-[#FAF8F5]/70 border-b border-stone-200">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã voucher hoặc tên chương trình..."
            className="flex-1 px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          >
            <option value="all">Tất cả trạng thái ({vouchers.length})</option>
            <option value="active">Đang kích hoạt</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4">Mã Voucher</th>
                <th className="py-3.5 px-4">Mức giảm & Điều kiện</th>
                <th className="py-3.5 px-4">Lượt sử dụng</th>
                <th className="py-3.5 px-4">Thời gian áp dụng</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-stone-400">
                    Đang tải danh sách voucher...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-stone-400">
                    Chưa có voucher khuyến mãi nào.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  const used = Number(v.used_count || 0);
                  const limit = Number(v.usage_limit || 0);
                  const percentUsed =
                    limit > 0
                      ? Math.min(100, Math.round((used / limit) * 100))
                      : 0;

                  return (
                    <tr key={v.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F5EDE2] border border-dashed border-[#9A5B13] font-mono text-xs font-bold text-[#9A5B13]">
                          {v.code}
                        </span>
                        <div className="text-xs font-medium text-stone-700 mt-1 max-w-[200px] truncate">
                          {v.name || "Khuyến mãi cửa hàng"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-[#1A1A1A]">
                          {v.discount_type === "percent"
                            ? `Giảm ${v.discount_value}%`
                            : `Giảm ${formatVND(v.discount_value)}`}
                          {v.discount_type === "percent" &&
                            Number(v.max_discount) > 0 && (
                              <span className="text-xs font-normal text-stone-500">
                                {" "}
                                (Tối đa {formatVND(v.max_discount)})
                              </span>
                            )}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Đơn tối thiểu:{" "}
                          {Number(v.min_order_amount) > 0
                            ? formatVND(v.min_order_amount)
                            : "0 ₫"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                        <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                          <span>
                            {used} / {limit > 0 ? limit : "∞"}
                          </span>
                          {limit > 0 && <span>{percentUsed}%</span>}
                        </div>
                        {limit > 0 && (
                          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percentUsed >= 100
                                  ? "bg-red-500"
                                  : "bg-[#9A5B13]"
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-stone-600 whitespace-nowrap">
                        <div>Từ: {v.start_date || "Ngay lập tức"}</div>
                        <div>Đến: {v.end_date || "Không giới hạn"}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            v.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {v.status === "active" ? "Đang chạy" : "Tạm ngưng"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(v)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] text-xs font-semibold transition cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => requestToggleStatus(v)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
                          >
                            {v.status === "active" ? "Tắt" : "Bật"}
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteVoucher(v)}
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
      </div>

      <AdminModal
        open={isModalOpen}
        onClose={requestCancelModal}
        subtitle={editingId ? `Mã #${editingId}` : "Chương trình ưu đãi"}
        title={
          editingId ? "Cập Nhật Voucher Khuyến Mãi" : "Thêm Voucher Khuyến Mãi"
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
              form="voucher-modal-form"
              className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              {editingId ? "Lưu voucher" : "Tạo voucher"}
            </button>
          </>
        }
      >
        <form
          id="voucher-modal-form"
          onSubmit={handleRequestSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Mã Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="VD: BOOKHOUSE20"
                className={`${inputClass} font-mono uppercase`}
              />
            </div>

            <div>
              <label className={labelClass}>Tên chương trình</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="VD: Ưu đãi mừng năm học mới"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Loại giảm giá</label>
              <select
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({ ...formData, discount_type: e.target.value })
                }
                className={inputClass}
              >
                <option value="percent">Theo phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={formData.discount_type === "percent" ? 100 : undefined}
                required
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: e.target.value })
                }
                placeholder={
                  formData.discount_type === "percent" ? "15" : "30000"
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Giảm tối đa (₫)</label>
              <input
                type="number"
                min="0"
                disabled={formData.discount_type !== "percent"}
                value={formData.max_discount}
                onChange={(e) =>
                  setFormData({ ...formData, max_discount: e.target.value })
                }
                placeholder="50000"
                className={`${inputClass} disabled:opacity-50`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Giá trị đơn tối thiểu (₫)</label>
              <input
                type="number"
                min="0"
                value={formData.min_order_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_order_amount: e.target.value,
                  })
                }
                placeholder="150000"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Tổng lượt sử dụng tối đa</label>
              <input
                type="number"
                min="1"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({ ...formData, usage_limit: e.target.value })
                }
                placeholder="100"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Ngày kết thúc</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className={inputClass}
              />
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
                <option value="active">Đang chạy (Active)</option>
                <option value="inactive">Tạm ngưng (Inactive)</option>
              </select>
            </div>
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