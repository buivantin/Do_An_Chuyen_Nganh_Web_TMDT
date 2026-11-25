import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminModal from "../../components/admin/AdminModal";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";

const MEMBERSHIP_TIERS = [
  { level: 1, name: "Mầm Sách", badge: "bg-stone-100 text-stone-700 border-stone-200" },
  { level: 2, name: "Bạn Đọc Tích Cực", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { level: 3, name: "Độc Giả Thân Thiết", badge: "bg-sky-50 text-sky-700 border-sky-200" },
  { level: 4, name: "Tri Kỷ Sách", badge: "bg-amber-50 text-amber-800 border-amber-200" },
  { level: 5, name: "Đại Sứ Tri Thức", badge: "bg-purple-50 text-purple-800 border-purple-200" },
];

const DISTRIBUTION_MODES = [
  {
    value: "all_eligible",
    label: "Mở chung cho tất cả hạng đã chọn",
    desc: "Mọi thành viên thuộc các cấp đã chọn đều thấy mã và sử dụng theo nguyên tắc ai dùng trước được trước.",
  },
  {
    value: "priority_high_tier",
    label: "Ưu tiên cấp bậc cao nhất từ trên xuống (Cấp 5 → 1)",
    desc: "Khi số lượng voucher ít hơn tổng thành viên đủ hạng, hệ thống tự động chọn đúng N người có cấp bậc & chi tiêu cao nhất để phát độc quyền.",
  },
  {
    value: "random",
    label: "Phát ngẫu nhiên (Random) trong nhóm đủ điều kiện",
    desc: "Hệ thống bốc thăm ngẫu nhiên đúng N thành viên thuộc các cấp đã chọn và gửi mã độc quyền vào ví của họ.",
  },
];

const EMPTY_FORM = {
  code: "",
  name: "",
  discount_type: "percent",
  discount_value: "",
  max_discount: "0",
  min_order_amount: "0",
  min_spent: "0",
  usage_limit: "50",
  target_tiers: [], // [] = tất cả cấp bậc
  distribution_mode: "all_eligible",
  start_date: "",
  end_date: "",
  status: "active",
};

const formatVND = (val) => Number(val || 0).toLocaleString("vi-VN") + " ₫";

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [tierStats, setTierStats] = useState([]);
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

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const [voucherRes, statsRes] = await Promise.all([
        axios.get("/api/admin/vouchers", getAuthConfig()),
        axios.get("/api/admin/vouchers/tier-stats", getAuthConfig()).catch(() => null),
      ]);
      const list = voucherRes.data?.data || voucherRes.data || [];
      setVouchers(Array.isArray(list) ? list : []);

      if (statsRes?.data?.tiers) {
        setTierStats(statsRes.data.tiers);
      }
    } catch (err) {
      setAlertMessage({
        type: "error",
        text: err.response?.data?.message || "Không thể tải danh sách voucher từ máy chủ.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Tính tổng số thành viên thuộc các cấp đang chọn trong form
  const eligibleMembersCount = useMemo(() => {
    if (!tierStats.length) return 0;
    if (!formData.target_tiers || formData.target_tiers.length === 0) {
      return tierStats.reduce((sum, item) => sum + Number(item.count || 0), 0);
    }
    return tierStats
      .filter((item) => formData.target_tiers.includes(Number(item.tier)))
      .reduce((sum, item) => sum + Number(item.count || 0), 0);
  }, [tierStats, formData.target_tiers]);

  const toggleTargetTier = (level) => {
    setFormData((prev) => {
      const exists = prev.target_tiers.includes(level);
      const nextTiers = exists
        ? prev.target_tiers.filter((t) => t !== level)
        : [...prev.target_tiers, level].sort((a, b) => a - b);
      return { ...prev, target_tiers: nextTiers };
    });
  };

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
    setFormData({
      ...EMPTY_FORM,
      start_date: new Date().toISOString().slice(0, 10),
    });
    setAlertMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (v) => {
    setEditingId(v.id);
    const parsedTiers = Array.isArray(v.target_tiers) && v.target_tiers.length > 0
      ? v.target_tiers.map(Number)
      : v.membership_tier
      ? MEMBERSHIP_TIERS.filter((t) => t.level >= Number(v.membership_tier)).map((t) => t.level)
      : [];

    setFormData({
      code: v.code || "",
      name: v.name || "",
      discount_type: v.discount_type || "fixed",
      discount_value: String(v.discount_value ?? v.discount_amount ?? ""),
      max_discount: String(v.max_discount ?? 0),
      min_order_amount: String(v.min_order_amount ?? v.min_order_value ?? 0),
      min_spent: String(v.min_spent ?? 0),
      usage_limit: String(v.usage_limit ?? 0),
      target_tiers: parsedTiers,
      distribution_mode: v.distribution_mode || "all_eligible",
      start_date: (v.start_date || "").slice(0, 10),
      end_date: (v.end_date || v.expiration_date || "").slice(0, 10),
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
      code: cleanCode,
      name: formData.name.trim(),
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value || 0),
      max_discount:
        formData.discount_type === "percent" ? Number(formData.max_discount || 0) : 0,
      min_order_amount: Number(formData.min_order_amount || 0),
      min_spent: Number(formData.min_spent || 0),
      usage_limit: Number(formData.usage_limit || 0),
      target_tiers: formData.target_tiers.length > 0 ? formData.target_tiers : null,
      distribution_mode: formData.distribution_mode,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: formData.status,
    };

    try {
      let res;
      if (editingId) {
        res = await axios.put(
          `/api/admin/vouchers/${editingId}`,
          payload,
          getAuthConfig()
        );
      } else {
        res = await axios.post("/api/admin/vouchers", payload, getAuthConfig());
      }
      await fetchVouchers();
      window.dispatchEvent(new CustomEvent("vouchers-updated"));
      setAlertMessage({
        type: "success",
        text:
          res.data?.message ||
          (editingId
            ? `Đã cập nhật voucher ${cleanCode}.`
            : `Đã tạo voucher khuyến mãi ${cleanCode}.`),
      });
      resetAndCloseModal();
    } catch (err) {
      const apiMsg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})?.[0]?.[0] ||
        "Không thể lưu voucher. Vui lòng kiểm tra lại dữ liệu.";
      setAlertMessage({ type: "error", text: apiMsg });
    } finally {
      setActionLoading(false);
      setConfirmState((prev) => ({ ...prev, open: false }));
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      setAlertMessage({ type: "error", text: "Vui lòng nhập mã voucher." });
      return;
    }

    if (
      formData.distribution_mode !== "all_eligible" &&
      Number(formData.usage_limit) <= 0
    ) {
      setAlertMessage({
        type: "error",
        text: "Vui lòng nhập số lượng voucher phát hành (> 0) khi chọn chế độ Ưu tiên cấp cao hoặc Random.",
      });
      return;
    }

    const tierSummary =
      formData.target_tiers.length === 0
        ? "Tất cả cấp bậc"
        : formData.target_tiers
            .map((lv) => MEMBERSHIP_TIERS.find((t) => t.level === lv)?.name || `Cấp ${lv}`)
            .join(", ");

    setConfirmState({
      open: true,
      variant: "info",
      title: editingId
        ? "Xác nhận cập nhật voucher"
        : "Xác nhận phát hành voucher khuyến mãi",
      message: editingId
        ? "Bạn có chắc chắn muốn lưu thay đổi cho mã khuyến mãi này?"
        : "Bạn có chắc chắn muốn phát hành mã khuyến mãi mới này theo cấu hình đã chọn?",
      detailText: `Mã: ${cleanCode} • ${
        formData.discount_type === "percent"
          ? `Giảm ${formData.discount_value}%`
          : `Giảm ${formatVND(formData.discount_value)}`
      } • Đối tượng: ${tierSummary}`,
      confirmText: editingId ? "Lưu voucher" : "Phát hành voucher",
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
            {
              code: voucher.code,
              name: voucher.name,
              discount_type: voucher.discount_type,
              discount_value: voucher.discount_value ?? voucher.discount_amount,
              max_discount: voucher.max_discount,
              min_order_amount: voucher.min_order_amount ?? voucher.min_order_value,
              min_spent: voucher.min_spent,
              usage_limit: voucher.usage_limit,
              target_tiers: voucher.target_tiers,
              distribution_mode: voucher.distribution_mode,
              start_date: voucher.start_date,
              end_date: voucher.end_date,
              status: nextStatus,
            },
            getAuthConfig()
          );
          await fetchVouchers();
          setAlertMessage({
            type: "success",
            text: `Đã đổi trạng thái mã ${voucher.code}.`,
          });
        } catch (err) {
          setAlertMessage({
            type: "error",
            text: err.response?.data?.message || "Không thể cập nhật trạng thái voucher.",
          });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
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
          await fetchVouchers();
          setAlertMessage({
            type: "success",
            text: `Đã xóa voucher ${voucher.code}.`,
          });
        } catch (err) {
          setAlertMessage({
            type: "error",
            text: err.response?.data?.message || "Không thể xóa voucher này.",
          });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchKw =
        !keyword.trim() ||
        v.code?.toLowerCase().includes(keyword.toLowerCase()) ||
        v.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        v.tier_name?.toLowerCase().includes(keyword.toLowerCase());

      const eff = v.effective_status || v.status;
      const matchSt =
        statusFilter === "all" ||
        eff === statusFilter ||
        (statusFilter === "inactive" && v.status === "inactive");

      return matchKw && matchSt;
    });
  }, [vouchers, keyword, statusFilter]);

  const inputClass =
    "w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13]";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5";

  const renderStatusBadge = (v) => {
    const eff = v.effective_status || v.status;
    if (eff === "expired" || v.is_expired) {
      return (
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          Đã hết hạn
        </span>
      );
    }
    if (eff === "exhausted") {
      return (
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          Hết lượt dùng
        </span>
      );
    }
    if (v.status === "active") {
      return (
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          Đang chạy
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
        Tạm ngưng
      </span>
    );
  };

  const renderDistributionBadge = (v) => {
    if (v.distribution_mode === "priority_high_tier") {
      return (
        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-[10px] font-semibold text-purple-800">
          Ưu tiên cấp cao ({v.assigned_count || 0} người nhận)
        </span>
      );
    }
    if (v.distribution_mode === "random") {
      return (
        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-[10px] font-semibold text-sky-800">
          Phát ngẫu nhiên ({v.assigned_count || 0} người nhận)
        </span>
      );
    }
    return (
      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-stone-100 text-[10px] font-medium text-stone-600">
        Mở chung theo hạng
      </span>
    );
  };

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
              Phát hành mã giảm giá theo hạng thành viên, giới hạn lượt dùng và
              tự động kiểm soát hạn sử dụng
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
            placeholder="Tìm theo mã voucher, tên chương trình hoặc hạng thành viên..."
            className="flex-1 px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          >
            <option value="all">Tất cả trạng thái ({vouchers.length})</option>
            <option value="active">Đang chạy</option>
            <option value="expired">Đã hết hạn</option>
            <option value="exhausted">Hết lượt dùng</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4">Mã Voucher</th>
                <th className="py-3.5 px-4">Mức giảm & Điều kiện</th>
                <th className="py-3.5 px-4">Hạng thành viên & Phân phối</th>
                <th className="py-3.5 px-4">Lượt sử dụng</th>
                <th className="py-3.5 px-4">Thời gian áp dụng</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-stone-400">
                    Đang tải danh sách voucher...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-stone-400">
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
                        <div className="text-xs font-medium text-stone-700 mt-1 max-w-[190px] truncate">
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

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-stone-800 max-w-[210px] truncate" title={v.tier_name}>
                          {v.tier_name || "Tất cả cấp bậc"}
                        </div>
                        {renderDistributionBadge(v)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
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
                        <div className={v.is_expired ? "text-red-600 font-semibold" : ""}>
                          Đến: {v.end_date || "Không giới hạn"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {renderStatusBadge(v)}
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
        maxWidth="max-w-2xl"
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
              {editingId ? "Lưu voucher" : "Phát hành voucher"}
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
                placeholder="VD: Tri ân Tri Kỷ Sách & Đại Sứ"
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
              <label className={labelClass}>
                Số lượng voucher phát hành (0 = Không giới hạn)
              </label>
              <input
                type="number"
                min="0"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({ ...formData, usage_limit: e.target.value })
                }
                placeholder="50"
                className={inputClass}
              />
            </div>
          </div>

          {/* KHỐI CHỌN ĐỐI TƯỢNG HẠNG THÀNH VIÊN (1 -> 5) */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Đối tượng hạng thành viên áp dụng
              </label>
              <span className="text-[11px] font-semibold text-[#9A5B13]">
                {formData.target_tiers.length === 0
                  ? `Tất cả cấp bậc (${eligibleMembersCount} thành viên)`
                  : `Đã chọn ${formData.target_tiers.length} cấp (${eligibleMembersCount} thành viên phù hợp)`}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, target_tiers: [] })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  formData.target_tiers.length === 0
                    ? "bg-[#141414] text-white border-[#141414]"
                    : "bg-white text-stone-600 border-stone-300 hover:bg-stone-50"
                }`}
              >
                Tất cả cấp bậc
              </button>

              {MEMBERSHIP_TIERS.map((tier) => {
                const selected = formData.target_tiers.includes(tier.level);
                const count =
                  tierStats.find((s) => Number(s.tier) === tier.level)?.count ?? 0;
                return (
                  <button
                    key={tier.level}
                    type="button"
                    onClick={() => toggleTargetTier(tier.level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                      selected
                        ? "bg-[#9A5B13] text-white border-[#9A5B13]"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <span>
                      Cấp {tier.level}: {tier.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        selected
                          ? "bg-white/20 text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* CHẾ ĐỘ PHÂN PHỐI KHI SỐ LƯỢNG VOUCHER < SỐ THÀNH VIÊN ĐỦ ĐIỀU KIỆN */}
            {!editingId && (
              <div className="pt-2 border-t border-stone-200/80 space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Chế độ phân phối voucher
                </label>
                <div className="space-y-2">
                  {DISTRIBUTION_MODES.map((m) => (
                    <label
                      key={m.value}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                        formData.distribution_mode === m.value
                          ? "bg-white border-[#9A5B13] shadow-2xs"
                          : "bg-white/60 border-stone-200 hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="distribution_mode"
                        value={m.value}
                        checked={formData.distribution_mode === m.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            distribution_mode: e.target.value,
                          })
                        }
                        className="mt-0.5 accent-[#9A5B13]"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-stone-800">{m.label}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {m.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
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