import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import AccountView from "../components/AccountView";
import ConfirmModal from "../components/ConfirmModal";
import {
  formatVietnamAddress,
  parseAddressParts,
} from "../components/VietnamAddressSelector";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function resolveAssetUrl(path) {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;
  if (
    /^https?:\/\//i.test(raw) ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }
  const clean = raw.replace(/^\/+/, "");
  if (clean.startsWith("public/")) return `/storage/${clean.slice(7)}`;
  if (clean.startsWith("storage/") || clean.startsWith("imgs/")) {
    return `/${clean}`;
  }
  return `/storage/${clean}`;
}

function getMemberTier(totalSpent) {
  if (totalSpent >= 5000000) {
    return {
      name: "Đại Sứ Tri Thức",
      icon: "👑",
      badgeClass: "bg-[#F5EDE2] border-[#E5D5BE] text-[#9A5B13]",
      hint: "Danh hiệu cao quý nhất tại BookHouse.",
      progressPercent: 100,
    };
  }
  if (totalSpent >= 2500000) {
    const pct = Math.min(100, Math.round((totalSpent / 5000000) * 100));
    return {
      name: "Học Giả",
      icon: "🏅",
      badgeClass: "bg-yellow-50 border-yellow-300 text-yellow-900",
      hint: `Mua thêm ${(5000000 - totalSpent).toLocaleString(
        "vi-VN"
      )}đ để đạt Đại Sứ Tri Thức`,
      progressPercent: pct,
    };
  }
  if (totalSpent >= 1000000) {
    const pct = Math.min(100, Math.round((totalSpent / 2500000) * 100));
    return {
      name: "Tri Thức",
      icon: "💠",
      badgeClass: "bg-sky-50 border-sky-200 text-sky-800",
      hint: `Mua thêm ${(2500000 - totalSpent).toLocaleString(
        "vi-VN"
      )}đ để lên hạng Học Giả`,
      progressPercent: pct,
    };
  }
  if (totalSpent >= 300000) {
    const pct = Math.min(100, Math.round((totalSpent / 1000000) * 100));
    return {
      name: "Người Đọc",
      icon: "📖",
      badgeClass: "bg-amber-50 border-amber-200 text-amber-900",
      hint: `Mua thêm ${(1000000 - totalSpent).toLocaleString(
        "vi-VN"
      )}đ để đạt Tri Thức`,
      progressPercent: pct,
    };
  }
  const pct = Math.max(
    15,
    Math.min(100, Math.round((totalSpent / 300000) * 100))
  );
  return {
    name: "Mầm Sách",
    icon: "🌱",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
    hint: `Mua thêm ${(300000 - totalSpent).toLocaleString(
      "vi-VN"
    )}đ để lên hạng Người Đọc`,
    progressPercent: pct,
  };
}

function normalizeOrder(raw) {
  const rawStatus = String(raw.status || "pending").toLowerCase();
  const deliveredAtStr =
    raw.delivered_at ||
    (rawStatus === "delivered" ? raw.updated_at : null) ||
    raw.completed_at;
  const deliveredMs = deliveredAtStr ? new Date(deliveredAtStr).getTime() : null;
  const elapsedMs = deliveredMs ? Date.now() - deliveredMs : 0;

  const isAutoCompleted =
    rawStatus === "delivered" && deliveredMs && elapsedMs >= THREE_DAYS_MS;

  let statusKey = rawStatus;
  if (rawStatus === "delivered") {
    statusKey = "completed";
  }

  const isCompleted = statusKey === "completed";
  const isDeliveredWaiting = rawStatus === "delivered" && !isAutoCompleted;

  const canReturn =
    (rawStatus === "delivered" || rawStatus === "completed") &&
    deliveredMs &&
    elapsedMs < THREE_DAYS_MS;

  const returnExpired =
    (rawStatus === "delivered" || rawStatus === "completed") &&
    deliveredMs &&
    elapsedMs >= THREE_DAYS_MS;

  let returnRemainingText = "";
  if (canReturn) {
    const remainMs = Math.max(0, THREE_DAYS_MS - elapsedMs);
    const remainDays = Math.floor(remainMs / (24 * 60 * 60 * 1000));
    const remainHours = Math.floor(
      (remainMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    returnRemainingText =
      remainDays > 0
        ? `Còn ${remainDays} ngày ${remainHours} giờ`
        : `Còn ${Math.max(1, remainHours)} giờ`;
  }

  const STATUS_UI = {
    pending: {
      label: "Chờ xác nhận",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
    },
    processing: {
      label: "Đang xử lý",
      badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
    },
    shipping: {
      label: "Đang giao",
      badge: "bg-sky-50 text-sky-800 border-sky-200",
    },
    delivered: {
      label: "Đã giao (Trong 3 ngày hỗ trợ đổi/hoàn)",
      badge: "bg-teal-50 text-teal-800 border-teal-300",
    },
    completed: {
      label: "Hoàn thành",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    return_requested: {
      label: "Yêu cầu hoàn đơn",
      badge: "bg-orange-50 text-orange-800 border-orange-300",
    },
    returned: {
      label: "Đã hoàn đơn",
      badge: "bg-purple-50 text-purple-800 border-purple-200",
    },
    cancelled: {
      label: "Đã hủy",
      badge: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const uiMeta = isDeliveredWaiting
    ? STATUS_UI.delivered
    : STATUS_UI[statusKey] || STATUS_UI.pending;

  const rawItems = raw.items || raw.order_items || raw.orderDetails || [];
  const items = (Array.isArray(rawItems) ? rawItems : []).map((it, idx) => {
    const p = it.product || {};
    const qty = Number(it.quantity || 1);
    const unitPrice = Number(it.price ?? p.price ?? 0);
    return {
      key: it.id || `${raw.id}-${idx}`,
      productId: it.product_id || p.id,
      name: it.product_name || p.name || `Ấn phẩm #${it.product_id || idx + 1}`,
      imageUrl: resolveAssetUrl(p.image_path || p.image || it.image),
      altImageUrl: resolveAssetUrl(p.thumbnail),
      quantity: qty,
      unitPrice,
      lineTotal: qty * unitPrice,
      existingReview: it.review || null,
      raw: it,
    };
  });

  const returnImages = Array.isArray(raw.return_images)
    ? raw.return_images.map(resolveAssetUrl).filter(Boolean)
    : [];

  return {
    id: raw.id,
    code: raw.order_code || `#MS${raw.id}`,
    rawStatus,
    statusKey,
    statusLabel: uiMeta.label,
    statusBadge: uiMeta.badge,
    isCompleted,
    isReturnRequested: statusKey === "return_requested",
    isReturned: statusKey === "returned",
    canCancel: rawStatus === "pending",
    canReturn,
    returnExpired,
    returnRemainingText,
    canReorder: ["completed", "cancelled", "returned"].includes(statusKey),
    createdAtLabel: raw.created_at
      ? new Date(raw.created_at).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "",
    completedAtLabel:
      raw.completed_at || isAutoCompleted
        ? new Date(
            raw.completed_at || deliveredMs + THREE_DAYS_MS
          ).toLocaleDateString("vi-VN")
        : "",
    totalAmount: Number(raw.total_amount || 0),
    discountAmount: Number(raw.discount_amount || 0),
    receiverName: raw.receiver_name || raw.shipping_name || "Độc giả",
    receiverPhone: raw.phone || raw.shipping_phone || "",
    shippingAddress: raw.shipping_address || raw.address || "—",
    shippingProvider: raw.shipping_provider || "",
    trackingCode: raw.tracking_code || "",
    paymentLabel:
      raw.payment_method === "banking"
        ? "Chuyển khoản ngân hàng"
        : raw.payment_method === "momo"
        ? "Ví MoMo"
        : raw.payment_method === "vnpay"
        ? "VNPay"
        : "Thanh toán khi nhận hàng (COD)",
    note: raw.note || "",
    returnType: raw.return_type || "refund",
    returnReason: raw.return_reason || "",
    returnRequestedAtLabel: raw.return_requested_at
      ? new Date(raw.return_requested_at).toLocaleString("vi-VN")
      : "",
    returnImages,
    adminReturnNote: raw.admin_return_note || "",
    items,
    raw,
  };
}

export default function Account() {
  const fileInputRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") || "profile";

  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Profile & Address
  const [profileForm, setProfileForm] = useState({ username: "", phone: "" });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [provinceCode, setProvinceCode] = useState("79");
  const [districtCode, setDistrictCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  // Password
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [detailLoadingId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [reorderingOrderId, setReorderingOrderId] = useState(null);

  // Modal Form Hoàn đơn / Đổi trả (trong vòng 3 ngày)
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnType, setReturnType] = useState("refund");
  const [exchangeSelections, setExchangeSelections] = useState({});
  const [returnReason, setReturnReason] = useState("");
  const [returnFiles, setReturnFiles] = useState([]);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");

  // Confirm Modal hủy đơn
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState(null);

  // Confirm Modal lưu thông tin & đổi mật khẩu
  const [confirmAction, setConfirmAction] = useState(null); // "profile" | "password" | null

  // Review Modal
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const res = await axios.get("/api/orders", { headers: getHeaders() });
      const rawList = res.data?.data ?? res.data?.orders ?? res.data ?? [];
      const normalized = (Array.isArray(rawList) ? rawList : []).map(
        normalizeOrder
      );
      setOrders(normalized);
    } catch (err) {
      setOrdersError(
        err.response?.data?.message || "Không thể tải danh sách đơn hàng."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      try {
        const profileRes = await axios.get("/api/profile", {
          headers: getHeaders(),
        });
        const u =
          profileRes.data?.user ||
          profileRes.data?.data ||
          profileRes.data ||
          {};
        setUser(u);
        setProfileForm({
          username: u.username || u.name || "",
          phone: u.phone || "",
        });
        if (u.address) {
          const parsed = parseAddressParts(u.address);
          setProvinceCode(parsed.provinceCode);
          setDistrictCode(parsed.districtCode);
          setWardName(parsed.wardName);
          setStreetAddress(parsed.street);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }
      } finally {
        setLoading(false);
      }

      await fetchOrders();
    };

    loadAll();
  }, []);

  const totalSpent = useMemo(
    () =>
      orders
        .filter((o) => o.isCompleted)
        .reduce((sum, o) => sum + o.totalAmount, 0),
    [orders]
  );

  const memberTier = useMemo(() => getMemberTier(totalSpent), [totalSpent]);

  const orderCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipping: 0,
      completed: 0,
      return_requested: 0,
      returned: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (Object.prototype.hasOwnProperty.call(counts, o.statusKey)) {
        counts[o.statusKey] += 1;
      }
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === "all") return orders;
    return orders.filter((o) => o.statusKey === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Mở Modal Form Hoàn đơn / Đổi trả
  const handleOpenReturnModal = (order) => {
    const orderItems = Array.isArray(order?.items) ? order.items : [];
    const initialSelections = {};
    orderItems.forEach((it, idx) => {
      const itemKey = String(it.key || it.productId || idx);
      initialSelections[itemKey] = {
        selected: orderItems.length === 1,
        quantity: 1,
      };
    });

    setReturnModalOrder(order);
    setReturnType("refund");
    setExchangeSelections(initialSelections);
    setReturnReason("");
    setReturnFiles([]);
    setReturnError("");
  };

  const handleToggleExchangeItem = (itemKey) => {
    setExchangeSelections((prev) => {
      const current = prev[itemKey] || { selected: false, quantity: 1 };
      return {
        ...prev,
        [itemKey]: {
          ...current,
          selected: !current.selected,
          quantity: Math.max(1, Number(current.quantity || 1)),
        },
      };
    });
  };

  const handleChangeExchangeQty = (itemKey, nextQty, maxQty) => {
    const safeQty = Math.min(
      Math.max(1, Number(nextQty || 1)),
      Math.max(1, maxQty)
    );
    setExchangeSelections((prev) => ({
      ...prev,
      [itemKey]: {
        selected: true,
        quantity: safeQty,
      },
    }));
  };

  const handleSubmitReturnForm = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    const orderItems = Array.isArray(returnModalOrder.items)
      ? returnModalOrder.items
      : [];

    let selectedExchangeBooks = [];
    if (returnType === "exchange") {
      selectedExchangeBooks = orderItems
        .map((it, idx) => {
          const itemKey = String(it.key || it.productId || idx);
          const sel = exchangeSelections[itemKey];
          if (!sel?.selected) return null;
          return {
            productId: it.productId,
            name: it.name,
            quantity: Math.min(
              Math.max(1, Number(sel.quantity || 1)),
              Math.max(1, Number(it.quantity || 1))
            ),
            purchasedQuantity: Number(it.quantity || 1),
          };
        })
        .filter(Boolean);

      if (selectedExchangeBooks.length === 0) {
        setReturnError(
          "Vui lòng tích chọn ít nhất 1 cuốn sách trong hóa đơn mà bạn muốn đổi mới."
        );
        return;
      }
    }

    if (returnReason.trim().length < 10) {
      setReturnError(
        "Vui lòng nhập lý do hoàn đơn / tình trạng sách tối thiểu 10 ký tự."
      );
      return;
    }

    const finalReason =
      returnType === "exchange" && selectedExchangeBooks.length > 0
        ? `[Sách yêu cầu đổi mới: ${selectedExchangeBooks
            .map((b) => `${b.name} (x${b.quantity})`)
            .join(", ")}] — ${returnReason.trim()}`
        : returnReason.trim();

    setReturnSubmitting(true);
    setReturnError("");
    try {
      const formData = new FormData();
      formData.append("return_type", returnType);
      formData.append("return_reason", finalReason);
      returnFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      const res = await axios.post(
        `/api/orders/${returnModalOrder.id}/return`,
        formData,
        {
          headers: {
            ...getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMsg({
        type: "success",
        text:
          res.data?.message ||
          "Đã gửi yêu cầu hoàn đơn thành công! Cửa hàng sẽ liên hệ với bạn.",
      });
      setReturnModalOrder(null);
      setReturnFiles([]);
      await fetchOrders();
      setOrderStatusFilter("return_requested");
    } catch (err) {
      setReturnError(
        err.response?.data?.message ||
          "Không thể gửi yêu cầu hoàn đơn. Vui lòng thử lại."
      );
    } finally {
      setReturnSubmitting(false);
    }
  };

  // Mở ConfirmModal khi bấm Lưu thay đổi hồ sơ
  const handleRequestSaveProfile = (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (!profileForm.username.trim()) {
      setMsg({ type: "error", text: "Vui lòng nhập họ và tên." });
      return;
    }
    setConfirmAction("profile");
  };

  // Thực thi gọi API lưu hồ sơ sau khi bấm Xác nhận trên Modal
  const handleConfirmSaveProfile = async () => {
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const addressToSave = isEditingAddress
        ? formatVietnamAddress({
            provinceCode,
            districtCode,
            wardName,
            streetAddress,
          })
        : user.address || "";

      const res = await axios.put(
        "/api/profile",
        {
          username: profileForm.username.trim(),
          name: profileForm.username.trim(),
          phone: profileForm.phone.trim(),
          address: addressToSave,
        },
        { headers: getHeaders() }
      );

      const updatedUser = res.data?.user || {
        ...user,
        username: profileForm.username.trim(),
        phone: profileForm.phone.trim(),
        address: addressToSave,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(
        new CustomEvent("user-updated", { detail: updatedUser })
      );
      setIsEditingAddress(false);
      setMsg({ type: "success", text: "Đã cập nhật thông tin tài khoản!" });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Cập nhật thông tin thất bại.",
      });
    } finally {
      setSaving(false);
      setConfirmAction(null);
    }
  };

  // Kiểm tra hợp lệ và mở ConfirmModal khi bấm Cập nhật mật khẩu
  const handleRequestChangePassword = (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (passwordForm.new_password === passwordForm.old_password) {
      setMsg({
        type: "error",
        text: "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
      });
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setMsg({
        type: "error",
        text: "Xác nhận mật khẩu mới không khớp.",
      });
      return;
    }

    setConfirmAction("password");
  };

  // Thực thi gọi API đổi mật khẩu sau khi bấm Xác nhận trên Modal
  const handleConfirmChangePassword = async () => {
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      await axios.put("/api/profile/change-password", passwordForm, {
        headers: getHeaders(),
      });
      setPasswordForm({
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      setMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Đổi mật khẩu thất bại.",
      });
    } finally {
      setSaving(false);
      setConfirmAction(null);
    }
  };

  // Hủy đơn hàng
  const handleConfirmCancelOrder = async () => {
    if (!cancelConfirmOrder) return;
    setCancellingOrderId(cancelConfirmOrder.id);
    try {
      await axios.post(
        `/api/orders/${cancelConfirmOrder.id}/cancel`,
        {},
        { headers: getHeaders() }
      );
      setCancelConfirmOrder(null);
      setMsg({ type: "success", text: "Đã hủy đơn hàng thành công." });
      await fetchOrders();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Không thể hủy đơn hàng này.",
      });
      setCancelConfirmOrder(null);
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Mua lại đơn hàng
  const handleReorderOrder = async (order) => {
    if (!order?.items?.length) return;
    setReorderingOrderId(order.id);
    try {
      for (const item of order.items) {
        if (item.productId) {
          await axios.post(
            "/api/cart/add",
            { product_id: item.productId, quantity: item.quantity },
            { headers: getHeaders() }
          );
        }
      }
      window.dispatchEvent(new Event("cart-updated"));
      window.location.href = "/cart";
    } catch {
      setMsg({ type: "error", text: "Không thể thêm lại sản phẩm vào giỏ." });
    } finally {
      setReorderingOrderId(null);
    }
  };

  // Đánh giá sản phẩm theo đơn hàng
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;
    setReviewSubmitting(true);
    setReviewError("");
    try {
      await axios.post(
        "/api/reviews",
        {
          product_id: reviewTarget.productId,
          order_id: reviewTarget.orderId,
          order_item_id: reviewTarget.orderItemId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        },
        { headers: getHeaders() }
      );
      setReviewTarget(null);
      setReviewComment("");
      setMsg({ type: "success", text: "Cảm ơn bạn đã gửi đánh giá ấn phẩm!" });
      await fetchOrders();
    } catch (err) {
      setReviewError(
        err.response?.data?.message || "Không thể gửi đánh giá lúc này."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const avatarSrc = resolveAssetUrl(user.avatar);
  const avatarInitial = (user.username || user.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const fd = new FormData();
          fd.append("avatar", file);
          try {
            const res = await axios.post("/api/profile/avatar", fd, {
              headers: {
                ...getHeaders(),
                "Content-Type": "multipart/form-data",
              },
            });
            const updated = res.data?.user || {
              ...user,
              avatar: res.data?.avatar,
            };
            setUser(updated);
            localStorage.setItem("user", JSON.stringify(updated));
            window.dispatchEvent(
              new CustomEvent("user-updated", { detail: updated })
            );
          } catch {
            setMsg({ type: "error", text: "Cập nhật ảnh đại diện thất bại." });
          }
        }}
      />

      {/* MODAL FORM HOÀN ĐƠN / ĐỔI TRẢ (TRONG VÒNG 3 NGÀY) */}
      {returnModalOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => !returnSubmitting && setReturnModalOrder(null)}
        >
          <div
            className="bg-white border border-stone-200 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700">
                  Hỗ trợ trong vòng 3 ngày &bull; Đơn {returnModalOrder.code}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] mt-0.5">
                  Phiếu Yêu Cầu Hoàn Đơn / Đổi Trả
                </h3>
              </div>
              <button
                type="button"
                disabled={returnSubmitting}
                onClick={() => setReturnModalOrder(null)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 flex items-center justify-center transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 leading-relaxed">
              Thời hạn hỗ trợ còn lại:{" "}
              <strong>{returnModalOrder.returnRemainingText}</strong>. Nếu quá 3
              ngày kể từ khi xác nhận đã giao mà không phát sinh yêu cầu, đơn
              hàng sẽ tự động chuyển sang trạng thái <strong>Hoàn thành</strong>.
            </div>

            {returnError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {returnError}
              </div>
            )}

            <form onSubmit={handleSubmitReturnForm} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Hình thức yêu cầu <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      returnType === "refund"
                        ? "bg-orange-50 border-orange-400 text-orange-950 font-bold"
                        : "bg-[#FAF8F5] border-stone-200 text-stone-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="return_type"
                      value="refund"
                      checked={returnType === "refund"}
                      onChange={() => setReturnType("refund")}
                      className="mr-2 accent-orange-600"
                    />
                    Hoàn đơn &amp; Hoàn tiền
                  </label>

                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      returnType === "exchange"
                        ? "bg-orange-50 border-orange-400 text-orange-950 font-bold"
                        : "bg-[#FAF8F5] border-stone-200 text-stone-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="return_type"
                      value="exchange"
                      checked={returnType === "exchange"}
                      onChange={() => setReturnType("exchange")}
                      className="mr-2 accent-orange-600"
                    />
                    Đổi cuốn sách mới (lỗi in / rách)
                  </label>
                </div>
              </div>

              {returnType === "exchange" && (
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-orange-200/90 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-orange-900">
                      Chọn sách trong hóa đơn muốn đổi{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-stone-500">
                      ({returnModalOrder.items?.length || 0} đầu sách)
                    </span>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                    {(returnModalOrder.items || []).map((item, idx) => {
                      const itemKey = String(
                        item.key || item.productId || idx
                      );
                      const selection = exchangeSelections[itemKey] || {
                        selected: false,
                        quantity: 1,
                      };
                      const maxQty = Math.max(1, Number(item.quantity || 1));

                      return (
                        <div
                          key={itemKey}
                          onClick={() => handleToggleExchangeItem(itemKey)}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 cursor-pointer ${
                            selection.selected
                              ? "bg-white border-orange-400 shadow-2xs"
                              : "bg-white/70 border-stone-200/80 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={Boolean(selection.selected)}
                              onChange={() => {}}
                              className="w-4 h-4 accent-orange-600 rounded shrink-0 cursor-pointer"
                            />

                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-9 h-12 object-cover rounded border border-stone-200 shrink-0 bg-stone-100"
                              />
                            ) : (
                              <div className="w-9 h-12 rounded border border-stone-200 bg-stone-100 flex items-center justify-center text-[9px] font-bold text-stone-400 shrink-0">
                                SÁCH
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="text-xs font-bold text-stone-900 line-clamp-1">
                                {item.name}
                              </div>
                              <div className="text-[11px] text-stone-500 mt-0.5">
                                Đã mua: <strong>{maxQty}</strong> cuốn &bull;{" "}
                                {Number(item.unitPrice || 0).toLocaleString(
                                  "vi-VN"
                                )}
                                đ
                              </div>
                            </div>
                          </div>

                          {selection.selected && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 shrink-0"
                            >
                              <span className="text-[10px] font-semibold text-stone-500">
                                Đổi:
                              </span>
                              <div className="inline-flex items-center border border-orange-300 rounded-lg bg-orange-50">
                                <button
                                  type="button"
                                  disabled={selection.quantity <= 1}
                                  onClick={() =>
                                    handleChangeExchangeQty(
                                      itemKey,
                                      selection.quantity - 1,
                                      maxQty
                                    )
                                  }
                                  className="w-6 h-6 text-xs font-bold text-orange-900 disabled:opacity-40 cursor-pointer"
                                >
                                  &minus;
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-orange-950">
                                  {selection.quantity}
                                </span>
                                <button
                                  type="button"
                                  disabled={selection.quantity >= maxQty}
                                  onClick={() =>
                                    handleChangeExchangeQty(
                                      itemKey,
                                      selection.quantity + 1,
                                      maxQty
                                    )
                                  }
                                  className="w-6 h-6 text-xs font-bold text-orange-900 disabled:opacity-40 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Lý do hoàn đơn / Mô tả tình trạng sách{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Ví dụ: Sách bị móp góc bìa, thiếu trang hoặc giao nhầm tựa sách..."
                  className="w-full bg-[#F5F2EE] border border-stone-200 focus:border-orange-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 focus:outline-none transition resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Hình ảnh chứng minh (Tối đa 4 ảnh)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []).slice(0, 4);
                    setReturnFiles(selected);
                  }}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-900 hover:file:bg-orange-200 cursor-pointer"
                />
                {returnFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {returnFiles.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] text-stone-700"
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  disabled={returnSubmitting}
                  onClick={() => setReturnModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {returnSubmitting
                    ? "Đang gửi yêu cầu..."
                    : returnType === "exchange"
                    ? "Gửi yêu cầu đổi sách"
                    : "Gửi yêu cầu hoàn đơn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL HỦY ĐƠN HÀNG */}
      <ConfirmModal
        open={Boolean(cancelConfirmOrder)}
        variant="danger"
        title="Xác nhận hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không? Thao tác này không thể hoàn tác."
        detailText={
          cancelConfirmOrder
            ? `Đơn hàng ${
                cancelConfirmOrder.order_code || `#MS${cancelConfirmOrder.id}`
              }`
            : ""
        }
        confirmText="Xác nhận hủy đơn"
        cancelText="Giữ lại đơn"
        loading={Boolean(cancellingOrderId)}
        onConfirm={handleConfirmCancelOrder}
        onCancel={() => !cancellingOrderId && setCancelConfirmOrder(null)}
      />

      {/* CONFIRM MODAL LƯU THÔNG TIN & ĐỔI MẬT KHẨU */}
      <ConfirmModal
        open={Boolean(confirmAction)}
        variant="primary"
        title={
          confirmAction === "password"
            ? "Xác nhận đổi mật khẩu"
            : "Xác nhận lưu thông tin cá nhân"
        }
        message={
          confirmAction === "password"
            ? "Bạn có chắc chắn muốn cập nhật mật khẩu mới cho tài khoản này không?"
            : "Bạn có chắc chắn muốn lưu các thay đổi cho thông tin hồ sơ cá nhân không?"
        }
        detailText={
          confirmAction === "profile"
            ? `${profileForm.username.trim()}${
                profileForm.phone.trim() ? ` • ${profileForm.phone.trim()}` : ""
              }`
            : user.email || ""
        }
        confirmText={
          confirmAction === "password"
            ? "Xác nhận đổi mật khẩu"
            : "Xác nhận lưu"
        }
        cancelText="Hủy bỏ"
        loading={saving}
        onConfirm={
          confirmAction === "password"
            ? handleConfirmChangePassword
            : handleConfirmSaveProfile
        }
        onCancel={() => !saving && setConfirmAction(null)}
      />

      <AccountView
        user={user}
        memberTier={memberTier}
        avatarSrc={avatarSrc}
        avatarInitial={avatarInitial}
        activeTab={activeTab}
        loading={loading}
        saving={saving}
        msg={msg}
        profileForm={profileForm}
        isEditingAddress={isEditingAddress}
        provinceCode={provinceCode}
        districtCode={districtCode}
        wardName={wardName}
        streetAddress={streetAddress}
        onTriggerAvatarPicker={() => fileInputRef.current?.click()}
        onSwitchTab={(tabId) => {
          setActiveTab(tabId);
          setMsg({ type: "", text: "" });
        }}
        onProfileFieldChange={(field, val) =>
          setProfileForm((prev) => ({ ...prev, [field]: val }))
        }
        onStartEditAddress={() => setIsEditingAddress(true)}
        onCancelEditAddress={() => setIsEditingAddress(false)}
        onProvinceChange={setProvinceCode}
        onDistrictChange={setDistrictCode}
        onWardChange={setWardName}
        onStreetChange={setStreetAddress}
        onRequestSaveProfile={handleRequestSaveProfile}
        passwordForm={passwordForm}
        onPasswordFieldChange={(field, val) =>
          setPasswordForm((prev) => ({ ...prev, [field]: val }))
        }
        onRequestChangePassword={handleRequestChangePassword}
        orders={orders}
        filteredOrders={filteredOrders}
        orderCounts={orderCounts}
        ordersLoading={ordersLoading}
        ordersError={ordersError}
        orderStatusFilter={orderStatusFilter}
        expandedOrderId={expandedOrderId}
        detailLoadingId={detailLoadingId}
        cancellingOrderId={cancellingOrderId}
        reorderingOrderId={reorderingOrderId}
        onRefreshOrders={fetchOrders}
        onFilterOrdersChange={setOrderStatusFilter}
        onToggleOrderDetail={(rawOrder) =>
          setExpandedOrderId((prev) =>
            prev === rawOrder.id ? null : rawOrder.id
          )
        }
        onRequestCancelOrder={(rawOrder) => setCancelConfirmOrder(rawOrder)}
        onReorderOrder={handleReorderOrder}
        onOpenReturnModal={handleOpenReturnModal}
        onOpenContactModal={() => {
          window.open("https://zalo.me", "_blank");
        }}
        reviewTarget={reviewTarget}
        reviewRating={reviewRating}
        hoverRating={hoverRating}
        reviewComment={reviewComment}
        reviewSubmitting={reviewSubmitting}
        reviewError={reviewError}
        onOpenReviewModal={(orderCode, rawItem, orderId) => {
          const p = rawItem.product || {};
          setReviewTarget({
            orderId: orderId || rawItem.order_id,
            orderItemId: rawItem.id,
            orderCode,
            productId: rawItem.product_id || p.id,
            productName: rawItem.product_name || p.name || "Ấn phẩm",
            productImage: resolveAssetUrl(p.image_path || p.image),
            productAltImage: resolveAssetUrl(p.thumbnail),
          });
          setReviewRating(5);
          setReviewComment("");
          setReviewError("");
        }}
        onCloseReviewModal={() => setReviewTarget(null)}
        onReviewRatingChange={setReviewRating}
        onHoverRatingChange={setHoverRating}
        onReviewCommentChange={setReviewComment}
        onSubmitReview={handleSubmitReview}
      />
    </>
  );
}