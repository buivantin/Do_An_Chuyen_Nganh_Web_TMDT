import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminModal from "../../components/admin/AdminModal";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";

const STATUS_META = {
  pending: {
    label: "Chờ xác nhận",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  processing: {
    label: "Chuẩn bị hàng",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  shipping: {
    label: "Đang giao",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
  delivered: {
    label: "Đã giao (3 ngày đổi/hoàn)",
    badge: "bg-teal-100 text-teal-800 border-teal-200",
  },
  completed: {
    label: "Hoàn thành",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  return_requested: {
    label: "Yêu cầu hoàn đơn",
    badge: "bg-orange-100 text-orange-800 border-orange-300",
  },
  returned: {
    label: "Đã hoàn đơn",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
  },
  cancelled: {
    label: "Đã hủy",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
};

const SHIPPING_PROVIDERS = [
  "Giao Hàng Nhanh (GHN)",
  "Giao Hàng Tiết Kiệm (GHTK)",
  "Viettel Post",
  "J&T Express",
  "Đội giao hàng nội bộ BookHouse",
];

const EMPTY_DELIVERY_FORM = {
  shipping_provider: "Giao Hàng Nhanh (GHN)",
  tracking_code: "",
  shipper_info: "",
  delivery_note: "",
};

function resolveAssetUrl(path) {
  if (!path) return null;
  const raw = String(path).trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const clean = raw.replace(/^\/+/, "");
  if (clean.startsWith("storage/") || clean.startsWith("imgs/")) return `/${clean}`;
  return `/storage/${clean}`;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    shipping: 0,
    completed: 0,
    return_requested: 0,
    returned: 0,
    cancelled: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Modal chi tiết đơn hàng & ghi chú phản hồi hoàn đơn
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [adminReturnNote, setAdminReturnNote] = useState("");

  // Modal nhập thông tin giao hàng (bắt buộc khi chuyển từ Chuẩn bị -> Đang giao / Hoàn thành)
  const [deliveryModal, setDeliveryModal] = useState({
    open: false,
    order: null,
    targetStatus: "shipping",
  });
  const [deliveryForm, setDeliveryForm] = useState(EMPTY_DELIVERY_FORM);
  const [deliveryError, setDeliveryError] = useState("");

  // Modal thông báo xác nhận / hủy chung
  const [confirmState, setConfirmState] = useState({
    open: false,
    variant: "warning",
    title: "",
    message: "",
    detailText: "",
    detailsList: [],
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

  const fetchOrders = async (status = "all", page = 1, searchKw = keyword) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/orders", {
        ...getAuthConfig(),
        params: {
          status: status !== "all" ? status : undefined,
          keyword: searchKw.trim() || undefined,
          page,
        },
      });

      let list = [];
      if (res.data?.data && Array.isArray(res.data.data.data)) {
        list = res.data.data.data;
        setCurrentPage(res.data.data.current_page || 1);
        setLastPage(res.data.data.last_page || 1);
      } else if (Array.isArray(res.data?.data)) {
        list = res.data.data;
        setCurrentPage(1);
        setLastPage(1);
      }
      setOrders(list);

      if (res.data?.counts) {
        setCounts((prev) => ({ ...prev, ...res.data.counts }));
      } else {
        const computed = {
          all: list.length,
          pending: 0,
          processing: 0,
          shipping: 0,
          completed: 0,
          return_requested: 0,
          returned: 0,
          cancelled: 0,
        };
        list.forEach((o) => {
          const stKey = o.status === "delivered" ? "completed" : o.status;
          if (Object.prototype.hasOwnProperty.call(computed, stKey)) {
            computed[stKey] += 1;
          }
        });
        setCounts(computed);
      }
    } catch {
      setMsg({ type: "error", text: "Không thể tải danh sách đơn hàng." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(statusFilter, 1, keyword);
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders(statusFilter, 1, keyword);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchOrders(statusFilter, newPage, keyword);
    }
  };

  const handleOpenDetailModal = async (order) => {
    setSelectedOrder(order);
    setNextStatus(order.status);
    setAdminReturnNote(order.admin_return_note || "");

    try {
      const res = await axios.get(
        `/api/admin/orders/${order.id}`,
        getAuthConfig()
      );
      const detail = res.data?.order || res.data?.data || res.data;
      if (detail && typeof detail === "object") {
        setSelectedOrder({ ...order, ...detail });
        setNextStatus(detail.status || order.status);
        setAdminReturnNote(detail.admin_return_note || "");
      }
    } catch {
      // Giữ nguyên dữ liệu hiện có
    }
  };

  const executeStatusUpdate = async (orderId, payload) => {
    setActionLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await axios.put(
        `/api/admin/orders/${orderId}/status`,
        payload,
        getAuthConfig()
      );
      const statusLabel =
        STATUS_META[payload.status]?.label || payload.status;
      setMsg({
        type: "success",
        text:
          res.data?.message ||
          `Đã cập nhật đơn #${orderId} sang trạng thái "${statusLabel}".`,
      });
      window.dispatchEvent(new Event("order-status-updated"));
      setSelectedOrder(null);
      setDeliveryModal({ open: false, order: null, targetStatus: "shipping" });
      setDeliveryForm(EMPTY_DELIVERY_FORM);
      fetchOrders(statusFilter, currentPage, keyword);
    } catch (error) {
      setMsg({
        type: "error",
        text:
          error.response?.data?.message || "Lỗi cập nhật trạng thái đơn hàng!",
      });
    } finally {
      setActionLoading(false);
      setConfirmState((prev) => ({ ...prev, open: false }));
    }
  };

  /**
   * Điều phối chuyển trạng thái:
   * - Nếu chuyển từ "Chuẩn bị hàng" (processing) sang "Đang giao" (shipping) hoặc "Hoàn thành" (completed):
   *   Đóng modal chi tiết (nếu đang mở) và mở modal nhập thông tin vận chuyển/bàn giao trước.
   * - Các trường hợp khác: Mở thẳng Modal thông báo xác nhận AdminConfirmModal.
   */
  const requestChangeOrderStatus = (order, targetStatus, extraPayload = {}) => {
    if (!order || !targetStatus || targetStatus === order.status) return;

    const orderCode =
      order.order_code || `#DH${String(order.id).padStart(4, "0")}`;
    const currentLabel = STATUS_META[order.status]?.label || order.status;
    const targetLabel = STATUS_META[targetStatus]?.label || targetStatus;

    const requiresDeliveryInfo =
      order.status === "processing" &&
      (targetStatus === "shipping" || targetStatus === "completed");

    if (requiresDeliveryInfo) {
      setSelectedOrder(null);
      setDeliveryError("");
      setDeliveryForm({
        shipping_provider:
          order.shipping_provider || "Giao Hàng Nhanh (GHN)",
        tracking_code: order.tracking_code || "",
        shipper_info: order.shipper_info || "",
        delivery_note: order.delivery_note || "",
      });
      setDeliveryModal({
        open: true,
        order,
        targetStatus,
      });
      return;
    }

    const isCancelAction = targetStatus === "cancelled";
    const isApproveReturn = targetStatus === "returned";

    setConfirmState({
      open: true,
      variant: isCancelAction ? "danger" : isApproveReturn ? "info" : "warning",
      title: isCancelAction
        ? "Xác nhận hủy đơn hàng"
        : isApproveReturn
        ? "Xác nhận hoàn đơn & hoàn lại tồn kho"
        : "Xác nhận chuyển trạng thái đơn hàng",
      message: isCancelAction
        ? "Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác này không thể hoàn tác."
        : isApproveReturn
        ? "Chấp nhận yêu cầu hoàn đơn của khách hàng và cộng lại số lượng sách vào kho?"
        : `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang "${targetLabel}"?`,
      detailText: "",
      detailsList: [
        { label: "Mã đơn hàng", value: orderCode },
        {
          label: "Khách hàng",
          value:
            order.receiver_name || order.user?.username || "Khách hàng",
        },
        { label: "Trạng thái hiện tại", value: currentLabel },
        { label: "Trạng thái mới", value: targetLabel },
      ],
      confirmText: isCancelAction
        ? "Xác nhận hủy đơn"
        : isApproveReturn
        ? "Xác nhận hoàn đơn"
        : "Xác nhận cập nhật",
      cancelText: "Quay lại",
      action: () =>
        executeStatusUpdate(order.id, { status: targetStatus, ...extraPayload }),
    });
  };

  /**
   * Xử lý sau khi nhập đầy đủ thông tin bàn giao/giao hàng -> Gọi Modal thông báo xác nhận
   */
  const handleDeliveryFormSubmit = (e) => {
    e.preventDefault();
    const { order, targetStatus } = deliveryModal;
    if (!order) return;

    if (!deliveryForm.shipping_provider.trim()) {
      setDeliveryError("Vui lòng chọn hoặc nhập đơn vị vận chuyển.");
      return;
    }
    if (!deliveryForm.tracking_code.trim()) {
      setDeliveryError("Vui lòng nhập mã vận đơn / mã phiếu bàn giao.");
      return;
    }

    setDeliveryError("");
    const orderCode =
      order.order_code || `#DH${String(order.id).padStart(4, "0")}`;
    const targetLabel = STATUS_META[targetStatus]?.label || targetStatus;

    const payload = {
      status: targetStatus,
      shipping_provider: deliveryForm.shipping_provider.trim(),
      tracking_code: deliveryForm.tracking_code.trim().toUpperCase(),
      shipper_info: deliveryForm.shipper_info.trim(),
      delivery_note: deliveryForm.delivery_note.trim(),
    };

    const detailsList = [
      { label: "Mã đơn hàng", value: orderCode },
      { label: "Chuyển sang", value: targetLabel },
      { label: "Đơn vị vận chuyển", value: payload.shipping_provider },
      { label: "Mã vận đơn", value: payload.tracking_code },
    ];
    if (payload.shipper_info) {
      detailsList.push({
        label: "Người giao / SĐT",
        value: payload.shipper_info,
      });
    }
    if (payload.delivery_note) {
      detailsList.push({
        label: "Ghi chú bàn giao",
        value: payload.delivery_note,
      });
    }

    setConfirmState({
      open: true,
      variant: "info",
      title: "Xác nhận thông tin bàn giao & chuyển trạng thái",
      message: `Kiểm tra lại thông tin giao nhận trước khi chuyển đơn sang "${targetLabel}":`,
      detailText: "",
      detailsList,
      confirmText: "Xác nhận bàn giao",
      cancelText: "Chỉnh sửa lại",
      action: () => executeStatusUpdate(order.id, payload),
    });
  };

  const requestCancelDeliveryModal = () => {
    setConfirmState({
      open: true,
      variant: "danger",
      title: "Xác nhận hủy nhập thông tin giao hàng",
      message:
        "Bạn có chắc chắn muốn hủy bỏ? Thông tin bàn giao đã nhập sẽ không được lưu.",
      detailText: "",
      detailsList: [],
      confirmText: "Đồng ý hủy",
      cancelText: "Tiếp tục nhập",
      action: () => {
        setDeliveryModal({
          open: false,
          order: null,
          targetStatus: "shipping",
        });
        setDeliveryForm(EMPTY_DELIVERY_FORM);
        setDeliveryError("");
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const requestCloseDetailModal = () => {
    if (selectedOrder && nextStatus !== selectedOrder.status) {
      setConfirmState({
        open: true,
        variant: "warning",
        title: "Xác nhận hủy thay đổi",
        message:
          "Bạn đã chọn trạng thái mới nhưng chưa lưu. Bạn có chắc muốn đóng cửa sổ này?",
        detailText: "",
        detailsList: [],
        confirmText: "Hủy thay đổi",
        cancelText: "Ở lại",
        action: () => {
          setSelectedOrder(null);
          setConfirmState((prev) => ({ ...prev, open: false }));
        },
      });
    } else {
      setSelectedOrder(null);
    }
  };

  const orderItems =
    selectedOrder?.items ||
    selectedOrder?.order_items ||
    selectedOrder?.orderDetails ||
    [];

  return (
    <div className="space-y-4">
      {msg.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium ${
            msg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {msg.text}
        </div>
      )}

      {counts.pending > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-amber-900">
            <span className="text-xl">🔔</span>
            <p className="font-medium text-xs sm:text-sm">
              Hiện có{" "}
              <strong className="text-base text-[#9A5B13]">
                {counts.pending}
              </strong>{" "}
              đơn hàng mới đang chờ xác nhận.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className="px-4 py-2 bg-[#141414] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition cursor-pointer"
          >
            Xem đơn chờ duyệt
          </button>
        </div>
      )}

      {counts.return_requested > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-orange-900">
            <span className="text-xl">📦</span>
            <p className="font-medium text-xs sm:text-sm">
              Hiện có{" "}
              <strong className="text-base text-orange-700">
                {counts.return_requested}
              </strong>{" "}
              yêu cầu hoàn đơn / đổi trả từ khách hàng cần xử lý.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("return_requested")}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-700 transition cursor-pointer"
          >
            Xem yêu cầu hoàn đơn
          </button>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header đồng bộ */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
              Quản Lý Đơn Hàng
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Xác nhận đơn, chuẩn bị ấn phẩm, bàn giao vận chuyển và cập nhật
              trạng thái hoàn thành
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(statusFilter, currentPage, keyword)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0"
          >
            <span>Làm mới danh sách</span>
          </button>
        </div>

        {/* Các ô lọc trạng thái kèm số lượng đơn hàng */}
        <div className="p-4 bg-[#FAF8F5]/70 border-b border-stone-200 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ xác nhận" },
              { key: "processing", label: "Chuẩn bị hàng" },
              { key: "shipping", label: "Đang giao" },
              { key: "completed", label: "Hoàn thành" },
              { key: "return_requested", label: "Yêu cầu hoàn đơn" },
              { key: "returned", label: "Đã hoàn đơn" },
              { key: "cancelled", label: "Đã hủy" },
            ].map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#141414] text-white border-[#141414]"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                      isActive
                        ? "bg-[#9A5B13] text-white"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {counts[tab.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã đơn, tên người nhận hoặc số điện thoại..."
              className="flex-1 px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              Tìm đơn
            </button>
          </form>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <th className="py-3.5 px-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Vận chuyển</th>
                <th className="py-3.5 px-4">Ngày đặt</th>
                <th className="py-3.5 px-4 text-right">Tổng thanh toán</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-stone-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-stone-400">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const meta = STATUS_META[order.status] || {
                    label: order.status,
                    badge: "bg-stone-100 text-stone-700 border-stone-200",
                  };

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-50/70 transition"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#1A1A1A] whitespace-nowrap">
                        {order.order_code ||
                          `#DH${String(order.id).padStart(4, "0")}`}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-stone-800">
                          {order.receiver_name ||
                            order.user?.username ||
                            "Khách hàng"}
                        </div>
                        <div className="text-xs text-stone-500">
                          {order.phone || order.shipping_phone || "—"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.tracking_code ? (
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded bg-stone-100 font-mono text-[11px] font-bold text-stone-800">
                              {order.tracking_code}
                            </span>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              {order.shipping_provider || "Đơn vị vận chuyển"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">
                            Chưa bàn giao
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-600 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#9A5B13] whitespace-nowrap">
                        {Number(order.total_amount || 0).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        ₫
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] text-xs font-semibold transition cursor-pointer"
                          >
                            Chi tiết / Sửa
                          </button>

                          {order.status === "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  requestChangeOrderStatus(order, "processing")
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold transition cursor-pointer"
                              >
                                Chuẩn bị hàng
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  requestChangeOrderStatus(order, "cancelled")
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition cursor-pointer"
                              >
                                Hủy đơn
                              </button>
                            </>
                          )}

                          {order.status === "processing" && (
                            <button
                              type="button"
                              onClick={() =>
                                requestChangeOrderStatus(order, "shipping")
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold transition cursor-pointer"
                            >
                              Bàn giao vận chuyển
                            </button>
                          )}

                          {order.status === "shipping" && (
                            <button
                              type="button"
                              onClick={() =>
                                requestChangeOrderStatus(order, "completed")
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition cursor-pointer"
                            >
                              Xác nhận đã giao
                            </button>
                          )}

                          {order.status === "delivered" && (
                            <button
                              type="button"
                              onClick={() =>
                                requestChangeOrderStatus(order, "completed")
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition cursor-pointer"
                              title="Chốt hoàn thành ngay mà không cần đợi hết 3 ngày"
                            >
                              Chốt hoàn thành
                            </button>
                          )}

                          {order.status === "return_requested" && (
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-800 text-xs font-semibold transition cursor-pointer"
                            >
                              Duyệt hoàn đơn
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="p-4 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-3">
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

      {/* MODAL 1: NHẬP THÔNG TIN BÀN GIAO / VẬN CHUYỂN (KHI CHUYỂN TỪ CHUẨN BỊ -> ĐANG GIAO / HOÀN THÀNH) */}
      <AdminModal
        open={deliveryModal.open}
        onClose={requestCancelDeliveryModal}
        subtitle={`Đơn hàng #${deliveryModal.order?.id ?? ""}`}
        title={`Nhập Thông Tin Bàn Giao (${
          STATUS_META[deliveryModal.targetStatus]?.label || "Giao hàng"
        })`}
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={requestCancelDeliveryModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="order-delivery-form"
              className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Tiếp tục xác nhận
            </button>
          </>
        }
      >
        <form
          id="order-delivery-form"
          onSubmit={handleDeliveryFormSubmit}
          className="space-y-4"
        >
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-600">
            Vui lòng nhập đầy đủ thông tin đơn vị vận chuyển và mã vận đơn
            trước khi chuyển trạng thái đơn hàng từ{" "}
            <strong className="text-stone-900">Chuẩn bị hàng</strong> sang{" "}
            <strong className="text-[#9A5B13]">
              {STATUS_META[deliveryModal.targetStatus]?.label}
            </strong>
            .
          </div>

          {deliveryError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {deliveryError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Đơn vị vận chuyển <span className="text-red-500">*</span>
            </label>
            <select
              value={deliveryForm.shipping_provider}
              onChange={(e) =>
                setDeliveryForm({
                  ...deliveryForm,
                  shipping_provider: e.target.value,
                })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
            >
              {SHIPPING_PROVIDERS.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Mã vận đơn / Mã giao nhận <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={deliveryForm.tracking_code}
              onChange={(e) =>
                setDeliveryForm({
                  ...deliveryForm,
                  tracking_code: e.target.value.toUpperCase(),
                })
              }
              placeholder="VD: GHN89234102"
              className="w-full px-3.5 py-2.5 text-sm font-mono uppercase bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Nhân viên giao hàng / SĐT liên hệ
            </label>
            <input
              type="text"
              value={deliveryForm.shipper_info}
              onChange={(e) =>
                setDeliveryForm({
                  ...deliveryForm,
                  shipper_info: e.target.value,
                })
              }
              placeholder="VD: Trần Văn B - 0909 888 777"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Ghi chú bàn giao / Tình trạng gói hàng
            </label>
            <textarea
              rows={2}
              value={deliveryForm.delivery_note}
              onChange={(e) =>
                setDeliveryForm({
                  ...deliveryForm,
                  delivery_note: e.target.value,
                })
              }
              placeholder="VD: Đã bọc chống sốc 2 lớp, bàn giao lúc 14:30..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
            />
          </div>
        </form>
      </AdminModal>

      {/* MODAL 2: CHI TIẾT & CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG */}
      <AdminModal
        open={Boolean(selectedOrder)}
        onClose={requestCloseDetailModal}
        subtitle={`Đơn hàng #${selectedOrder?.id ?? ""}`}
        title="Chi Tiết & Cập Nhật Đơn Hàng"
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={requestCloseDetailModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              Hủy / Đóng
            </button>
            {selectedOrder &&
              selectedOrder.status !== "completed" &&
              selectedOrder.status !== "returned" &&
              selectedOrder.status !== "cancelled" && (
                <button
                  type="button"
                  disabled={nextStatus === selectedOrder.status}
                  onClick={() =>
                    requestChangeOrderStatus(selectedOrder, nextStatus, {
                      admin_return_note: adminReturnNote,
                    })
                  }
                  className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Cập nhật trạng thái
                </button>
              )}
          </>
        }
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-4 space-y-1.5">
              <div>
                <span className="font-semibold text-stone-700">
                  Người nhận:
                </span>{" "}
                {selectedOrder.receiver_name ||
                  selectedOrder.user?.username ||
                  "Khách hàng"}{" "}
                ({selectedOrder.phone || selectedOrder.shipping_phone || "—"})
              </div>
              <div>
                <span className="font-semibold text-stone-700">
                  Địa chỉ giao hàng:
                </span>{" "}
                {selectedOrder.shipping_address ||
                  selectedOrder.address ||
                  "—"}
              </div>
              {selectedOrder.tracking_code && (
                <div>
                  <span className="font-semibold text-stone-700">
                    Vận chuyển:
                  </span>{" "}
                  {selectedOrder.shipping_provider} — Mã:{" "}
                  <strong className="font-mono">
                    {selectedOrder.tracking_code}
                  </strong>
                </div>
              )}
              <div>
                <span className="font-semibold text-stone-700">
                  Tổng thanh toán:
                </span>{" "}
                <strong className="text-[#9A5B13]">
                  {Number(selectedOrder.total_amount || 0).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  ₫
                </strong>
              </div>
            </div>

            {/* KHỐI XỬ LÝ YÊU CẦU HOÀN ĐƠN / ĐỔI TRẢ TỪ KHÁCH HÀNG */}
            {selectedOrder.status === "return_requested" && (
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-900">
                    Phiếu yêu cầu{" "}
                    {selectedOrder.return_type === "exchange"
                      ? "Đổi sách mới"
                      : "Hoàn đơn & Hoàn tiền"}
                  </span>
                  {selectedOrder.return_requested_at && (
                    <span className="text-[11px] text-orange-700">
                      {new Date(
                        selectedOrder.return_requested_at
                      ).toLocaleString("vi-VN")}
                    </span>
                  )}
                </div>

                {(() => {
                  const rawReason = String(selectedOrder.return_reason || "");
                  const match = rawReason.match(
                    /^\[Sách yêu cầu đổi mới:\s*(.+?)\]\s*—\s*(.*)$/s
                  );
                  if (match) {
                    return (
                      <div className="space-y-2">
                        <div className="text-xs text-orange-950 bg-amber-100/90 p-3 rounded-xl border border-orange-300">
                          <strong>Sách khách chọn đổi mới:</strong> {match[1]}
                        </div>
                        <div className="text-xs text-orange-950 bg-white/80 p-3 rounded-xl border border-orange-200">
                          <strong>Lý do chi tiết:</strong> {match[2]}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="text-xs text-orange-950 bg-white/80 p-3 rounded-xl border border-orange-200">
                      <strong>Lý do khách gửi:</strong> {rawReason}
                    </div>
                  );
                })()}

                {Array.isArray(selectedOrder.return_images) &&
                  selectedOrder.return_images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.return_images.map((img, i) => {
                        const src = resolveAssetUrl(img);
                        return (
                          <a
                            key={i}
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="w-16 h-16 rounded-lg overflow-hidden border border-orange-300 bg-white block"
                          >
                            <img
                              src={src}
                              alt={`Ảnh lỗi ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        );
                      })}
                    </div>
                  )}

                <div>
                  <label className="block text-[11px] font-bold uppercase text-orange-900 mb-1">
                    Ghi chú phản hồi gửi khách hàng
                  </label>
                  <textarea
                    rows={2}
                    value={adminReturnNote}
                    onChange={(e) => setAdminReturnNote(e.target.value)}
                    placeholder="Nhập hướng dẫn gửi trả sách / lý do từ chối..."
                    className="w-full bg-white border border-orange-300 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      requestChangeOrderStatus(selectedOrder, "completed", {
                        admin_return_note:
                          adminReturnNote ||
                          "Yêu cầu hoàn đơn chưa đủ điều kiện áp dụng.",
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-xs font-bold text-stone-700 cursor-pointer"
                  >
                    Từ chối hoàn đơn
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      requestChangeOrderStatus(selectedOrder, "returned", {
                        admin_return_note:
                          adminReturnNote ||
                          "BookHouse đã chấp nhận hoàn đơn và hoàn lại tồn kho.",
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Xác nhận hoàn đơn (Hoàn kho)
                  </button>
                </div>
              </div>
            )}

            {Array.isArray(orderItems) && orderItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Danh sách ấn phẩm ({orderItems.length})
                </div>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                  {orderItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-white flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="font-semibold text-stone-800">
                        {item.product_name ||
                          item.product?.name ||
                          `Sách #${item.product_id}`}{" "}
                        <span className="text-stone-500 font-normal">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="font-bold text-stone-900 whitespace-nowrap">
                        {Number(
                          (item.price || 0) * (item.quantity || 1)
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Trạng thái xử lý đơn hàng
              </label>
              {selectedOrder.status === "completed" ||
              selectedOrder.status === "returned" ||
              selectedOrder.status === "cancelled" ? (
                <div className="p-3 rounded-xl bg-stone-100 text-xs text-stone-600 italic">
                  Đơn hàng này đã ở trạng thái chốt (
                  {STATUS_META[selectedOrder.status]?.label}).
                </div>
              ) : (
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="processing">Chuẩn bị hàng</option>
                  <option value="shipping">
                    Đang giao (Yêu cầu nhập thông tin bàn giao)
                  </option>
                  <option value="completed">
                    Hoàn thành (Yêu cầu nhập thông tin bàn giao nếu đang chuẩn
                    bị)
                  </option>
                  {selectedOrder.status === "return_requested" && (
                    <option value="returned">
                      Đã hoàn đơn (Hoàn lại tồn kho)
                    </option>
                  )}
                  <option value="cancelled">Hủy đơn hàng</option>
                </select>
              )}
            </div>
          </div>
        )}
      </AdminModal>

      {/* MODAL THÔNG BÁO XÁC NHẬN CHUNG */}
      <AdminConfirmModal
        open={confirmState.open}
        variant={confirmState.variant}
        title={confirmState.title}
        message={confirmState.message}
        detailText={confirmState.detailText}
        detailsList={confirmState.detailsList}
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