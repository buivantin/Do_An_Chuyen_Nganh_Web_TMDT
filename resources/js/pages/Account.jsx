import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import AccountView, { ACCOUNT_TABS } from "../components/AccountView";
import LoginRequiredModal from "../components/LoginRequiredModal";
import ConfirmModal from "../components/ConfirmModal";
import {
  formatVietnamAddress,
  parseAddressParts,
} from "../components/VietnamAddressSelector";

const PAYMENT_METHOD_LABELS = {
  cod: "Thanh toán khi nhận hàng (COD)",
  vnpay: "Thanh toán qua VNPay",
  momo: "Thanh toán qua Ví MoMo",
  banking: "Chuyển khoản ngân hàng",
};

const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Chờ xác nhận",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  processing: {
    label: "Đang xử lý",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  shipping: {
    label: "Đang giao hàng",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
  },
  completed: {
    label: "Hoàn thành",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    label: "Đã hủy",
    badge: "bg-stone-100 text-stone-600 border-stone-200",
  },
};

function normalizeOrderStatus(rawStatus) {
  const s = String(rawStatus ?? "pending").trim().toLowerCase();
  if (s === "0" || s === "pending" || s === "chờ xác nhận" || s === "cho xac nhan") {
    return "pending";
  }
  if (
    s === "1" ||
    s === "processing" ||
    s === "confirmed" ||
    s === "đang xử lý" ||
    s === "đã xác nhận"
  ) {
    return "processing";
  }
  if (
    s === "2" ||
    s === "shipping" ||
    s === "shipped" ||
    s === "delivering" ||
    s === "đang giao" ||
    s === "đang giao hàng"
  ) {
    return "shipping";
  }
  if (
    s === "3" ||
    s === "completed" ||
    s === "delivered" ||
    s === "success" ||
    s === "hoàn thành" ||
    s === "đã giao"
  ) {
    return "completed";
  }
  if (
    s === "4" ||
    s === "cancelled" ||
    s === "canceled" ||
    s === "đã hủy" ||
    s === "da huy"
  ) {
    return "cancelled";
  }
  return s || "pending";
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") {
    return { username: "", email: "", phone: "", address: "", image_path: null };
  }
  return {
    ...raw,
    username: raw.username || raw.name || "",
    email: raw.email || "",
    phone: raw.phone || "",
    address: raw.address || "",
    image_path: raw.image_path || raw.avatar || null,
  };
}

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
  if (clean.startsWith("public/")) {
    return `/storage/${clean.slice(7)}`;
  }
  if (
    clean.startsWith("storage/") ||
    clean.startsWith("images/") ||
    clean.startsWith("img/") ||
    clean.startsWith("uploads/") ||
    clean.startsWith("assets/")
  ) {
    return `/${clean}`;
  }
  if (clean.includes("/")) {
    return `/storage/${clean}`;
  }
  return `/${clean}`;
}

function getAlternateAssetUrl(currentUrl) {
  if (
    !currentUrl ||
    /^https?:\/\//i.test(currentUrl) ||
    currentUrl.startsWith("data:")
  ) {
    return null;
  }
  if (currentUrl.startsWith("/storage/")) {
    return `/${currentUrl.slice(9)}`;
  }
  if (currentUrl.startsWith("/")) {
    return `/storage${currentUrl}`;
  }
  return null;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractOrderItems(order) {
  if (!order || typeof order !== "object") return [];
  const list =
    order.items ||
    order.order_items ||
    order.orderItems ||
    order.order_details ||
    order.orderDetails ||
    order.details ||
    order.products ||
    order.lines ||
    [];
  return Array.isArray(list) ? list : [];
}

function extractItemProductInfo(item, productMap = {}) {
  const nested =
    (item && typeof item.product === "object" && item.product) ||
    (item && typeof item.book === "object" && item.book) ||
    (item && typeof item.item === "object" && item.item) ||
    {};

  const productId =
    item?.product_id ||
    item?.book_id ||
    nested.id ||
    (item?.pivot ? item.id : null);

  const cached = productId ? productMap[String(productId)] || {} : {};
  const merged = { ...cached, ...nested };

  const rawName =
    item?.product_name ||
    item?.book_name ||
    item?.book_title ||
    item?.name ||
    item?.title ||
    merged.name ||
    merged.title ||
    merged.book_name ||
    merged.ten_sach ||
    merged.ten_san_pham ||
    "";

  const firstGalleryImg = Array.isArray(merged.images)
    ? merged.images[0]?.url ||
      merged.images[0]?.image_path ||
      merged.images[0]?.path ||
      (typeof merged.images[0] === "string" ? merged.images[0] : "")
    : "";

  const rawImage =
    item?.image ||
    item?.image_url ||
    item?.image_path ||
    item?.product_image ||
    item?.thumbnail ||
    merged.image ||
    merged.image_path ||
    merged.image_url ||
    merged.thumbnail ||
    merged.cover ||
    merged.cover_image ||
    merged.anh ||
    firstGalleryImg ||
    "";

  const name = rawName
    ? String(rawName).normalize("NFC").trim()
    : productId
    ? `Ấn phẩm sách #${productId}`
    : "Ấn phẩm sách";

  const imageUrl = resolveAssetUrl(rawImage);

  return {
    productId,
    name,
    hasResolvedName: Boolean(String(rawName).trim()),
    imageUrl,
    altImageUrl: getAlternateAssetUrl(imageUrl),
    hasResolvedImage: Boolean(String(rawImage).trim()),
  };
}

/**
 * Thêm từng sản phẩm của đơn cũ vào giỏ hàng để chuyển sang /checkout
 */
async function addItemToCartApi(token, productId, quantity) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  const payload = {
    product_id: Number(productId),
    quantity: Math.max(1, Number(quantity || 1)),
  };

  try {
    return await axios.post("/api/cart", payload, { headers });
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 405) {
      try {
        return await axios.post("/api/cart/add", payload, { headers });
      } catch (err2) {
        if (err2.response?.status === 404 || err2.response?.status === 405) {
          return await axios.post("/api/cart/items", payload, { headers });
        }
        throw err2;
      }
    }
    throw err;
  }
}

/**
 * Tính hạng thành viên dựa trên số đơn hoàn thành / tổng chi tiêu
 */
function computeMemberTier(user, orders) {
  const completedOrders = (Array.isArray(orders) ? orders : []).filter(
    (o) => normalizeOrderStatus(o.status) === "completed"
  );
  const completedCount = completedOrders.length;
  const totalSpent = completedOrders.reduce(
    (sum, o) =>
      sum + Number(o.total_amount ?? o.total_price ?? o.total ?? 0),
    0
  );

  if (completedCount >= 7 || totalSpent >= 3000000) {
    return {
      name: "Tri Kỷ Thư Viện",
      icon: "🏛️",
      badgeClass: "bg-amber-50 border-amber-300 text-amber-900",
      hint: `Đã hoàn thành ${completedCount} đơn ấn phẩm tại BookHouse`,
      progressPercent: 100,
    };
  }

  if (completedCount >= 3 || totalSpent >= 1000000) {
    const pct = Math.min(95, Math.round((completedCount / 7) * 100));
    return {
      name: "Mọt Sách",
      icon: "📚",
      badgeClass: "bg-[#F5EDE2] border-[#E5D5BE] text-[#9A5B13]",
      hint: `Còn ${Math.max(1, 7 - completedCount)} đơn hoàn thành để lên Tri Kỷ Thư Viện`,
      progressPercent: Math.max(45, pct),
    };
  }

  if (completedCount >= 1 || totalSpent >= 300000) {
    const pct = Math.min(90, Math.round((completedCount / 3) * 100));
    return {
      name: "Người Đọc",
      icon: "📖",
      badgeClass: "bg-sky-50 border-sky-200 text-sky-800",
      hint: `Còn ${Math.max(1, 3 - completedCount)} đơn hoàn thành để lên hạng Mọt Sách`,
      progressPercent: Math.max(35, pct),
    };
  }

  return {
    name: "Mầm Sách",
    icon: "🌱",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
    hint: "Hoàn thành 1 đơn hàng để thăng hạng Người Đọc",
    progressPercent: 15,
  };
}

/**
 * SMART COMPONENT: Quản lý dữ liệu tài khoản, địa chỉ, đổi mật khẩu, đơn hàng & Mua lại
 */
export default function Account({
  user: propUser = null,
  orders: propOrders = null,
}) {
  const initialUser = useMemo(
    () => normalizeUser(propUser || getStoredUser()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const initialAddr = useMemo(
    () => parseAddressParts(initialUser.address),
    [initialUser.address]
  );

  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return ACCOUNT_TABS.some((t) => t.id === tab) ? tab : "profile";
  });

  const [user, setUser] = useState(initialUser);
  const [profileForm, setProfileForm] = useState({
    username: initialUser.username,
    phone: initialUser.phone,
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  // Địa chỉ nhận hàng mặc định
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [provinceCode, setProvinceCode] = useState(initialAddr.provinceCode);
  const [districtCode, setDistrictCode] = useState(initialAddr.districtCode);
  const [wardName, setWardName] = useState(initialAddr.wardName);
  const [streetAddress, setStreetAddress] = useState(initialAddr.street);

  // Đơn hàng & cache sản phẩm
  const [orders, setOrders] = useState(
    Array.isArray(propOrders) ? propOrders : []
  );
  const [productMap, setProductMap] = useState({});
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [reorderingOrderId, setReorderingOrderId] = useState(null);

  // Modal xác nhận chung (Lưu hồ sơ / Đổi mật khẩu / Hủy đơn)
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null,
    title: "",
    message: "",
    detailText: "",
    confirmText: "Xác nhận",
    variant: "warning",
    payload: null,
  });

  // Modal Đánh giá sản phẩm
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [loading, setLoading] = useState(!propUser && !getStoredUser());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fileInputRef = useRef(null);
  const isProfileDirtyRef = useRef(false);
  const isAddressDirtyRef = useRef(false);
  const savedAddressRef = useRef(initialUser.address || "");
  const syncedPropUserSigRef = useRef("");
  const hydratedOrderIdsRef = useRef(new Set());
  const fetchedProductIdsRef = useRef(new Set());
  const propUserRef = useRef(propUser);
  const propOrdersRef = useRef(propOrders);
  propUserRef.current = propUser;
  propOrdersRef.current = propOrders;

  const applyUserToState = useCallback(
    (rawUser, { forceReset = false, emitEvent = true } = {}) => {
      const normalized = normalizeUser(rawUser);
      savedAddressRef.current = normalized.address || "";
      setUser(normalized);

      if (forceReset || !isProfileDirtyRef.current) {
        setProfileForm({
          username: normalized.username,
          phone: normalized.phone,
        });
      }

      if (forceReset || !isAddressDirtyRef.current) {
        const parsedAddr = parseAddressParts(normalized.address);
        setProvinceCode(parsedAddr.provinceCode);
        setDistrictCode(parsedAddr.districtCode);
        setWardName(parsedAddr.wardName);
        setStreetAddress(parsedAddr.street);
      }

      localStorage.setItem("user", JSON.stringify(normalized));
      if (emitEvent) {
        window.dispatchEvent(
          new CustomEvent("user-updated", { detail: normalized })
        );
      }
    },
    []
  );

  const handleDatasetLoaded = useCallback((fullProvinces) => {
    if (isAddressDirtyRef.current || !savedAddressRef.current) return;
    const parsed = parseAddressParts(savedAddressRef.current, fullProvinces);
    setProvinceCode(parsed.provinceCode);
    setDistrictCode(parsed.districtCode);
    setWardName(parsed.wardName);
    setStreetAddress(parsed.street);
  }, []);

  const handleStartEditAddress = () => {
    const parsed = parseAddressParts(user.address);
    setProvinceCode(parsed.provinceCode);
    setDistrictCode(parsed.districtCode);
    setWardName(parsed.wardName);
    setStreetAddress(parsed.street);
    isAddressDirtyRef.current = false;
    setIsEditingAddress(true);
    setMsg({ type: "", text: "" });
  };

  const handleCancelEditAddress = () => {
    const parsed = parseAddressParts(user.address);
    setProvinceCode(parsed.provinceCode);
    setDistrictCode(parsed.districtCode);
    setWardName(parsed.wardName);
    setStreetAddress(parsed.street);
    isAddressDirtyRef.current = false;
    setIsEditingAddress(false);
    setMsg({ type: "", text: "" });
  };

  const hydrateMissingProducts = useCallback(async (orderList, token) => {
    const missingIds = new Set();
    for (const order of orderList) {
      for (const item of extractOrderItems(order)) {
        const info = extractItemProductInfo(item);
        if (
          info.productId &&
          (!info.hasResolvedName || !info.hasResolvedImage) &&
          !fetchedProductIdsRef.current.has(String(info.productId))
        ) {
          missingIds.add(String(info.productId));
        }
      }
    }

    if (missingIds.size === 0) return;

    const idsToFetch = Array.from(missingIds);
    idsToFetch.forEach((id) => fetchedProductIdsRef.current.add(id));

    const headers = token
      ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
      : { Accept: "application/json" };

    const results = await Promise.allSettled(
      idsToFetch.map(async (pid) => {
        try {
          const res = await axios.get(`/api/products/${pid}`, { headers });
          return [pid, res.data?.product || res.data?.data || res.data];
        } catch {
          const res = await axios.get(`/api/books/${pid}`, { headers });
          return [
            pid,
            res.data?.book || res.data?.product || res.data?.data || res.data,
          ];
        }
      })
    );

    const updates = {};
    for (const r of results) {
      if (r.status === "fulfilled" && r.value?.[1]) {
        updates[r.value[0]] = r.value[1];
      }
    }

    if (Object.keys(updates).length > 0) {
      setProductMap((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  const hydrateOrderDetails = useCallback(
    async (orderList, token) => {
      if (!token || !Array.isArray(orderList) || orderList.length === 0) return;

      const ordersNeedingItems = orderList.filter(
        (ord) =>
          ord?.id &&
          extractOrderItems(ord).length === 0 &&
          !hydratedOrderIdsRef.current.has(ord.id)
      );

      if (ordersNeedingItems.length === 0) {
        await hydrateMissingProducts(orderList, token);
        return;
      }

      ordersNeedingItems.forEach((ord) => hydratedOrderIdsRef.current.add(ord.id));

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const detailedMap = {};
      await Promise.allSettled(
        ordersNeedingItems.map(async (ord) => {
          const res = await axios.get(`/api/orders/${ord.id}`, { headers });
          const detail = res.data?.order || res.data?.data || res.data;
          if (detail && typeof detail === "object") {
            detailedMap[ord.id] = detail;
          }
        })
      );

      let mergedList = orderList;
      if (Object.keys(detailedMap).length > 0) {
        mergedList = orderList.map((ord) =>
          detailedMap[ord.id] ? { ...ord, ...detailedMap[ord.id] } : ord
        );
        setOrders(mergedList);
      }

      await hydrateMissingProducts(mergedList, token);
    },
    [hydrateMissingProducts]
  );

  const fetchUserOrders = useCallback(
    async (signal, { forceRehydrate = false } = {}) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (forceRehydrate) {
        hydratedOrderIdsRef.current.clear();
      }

      setOrdersLoading(true);
      setOrdersError("");
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      try {
        let res;
        try {
          res = await axios.get("/api/orders", { headers, signal });
        } catch (err) {
          if (err.response?.status === 404) {
            res = await axios.get("/api/user/orders", { headers, signal });
          } else {
            throw err;
          }
        }

        const raw = res.data?.orders ?? res.data?.data ?? res.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        setOrders(list);
        hydrateOrderDetails(list, token);
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setShowLoginModal(true);
        } else {
          setOrdersError(
            err.response?.data?.message || "Không thể tải danh sách đơn hàng."
          );
        }
      } finally {
        setOrdersLoading(false);
      }
    },
    [hydrateOrderDetails]
  );

  useEffect(() => {
    const onUserUpdated = (e) => {
      const nextUser = e.detail || getStoredUser();
      const token = localStorage.getItem("token");
      if (token && nextUser) {
        setShowLoginModal(false);
        applyUserToState(nextUser, { forceReset: false, emitEvent: false });
        if (orders.length === 0) {
          fetchUserOrders();
        }
      }
    };
    window.addEventListener("user-updated", onUserUpdated);
    return () => window.removeEventListener("user-updated", onUserUpdated);
  }, [applyUserToState, fetchUserOrders, orders.length]);

  useEffect(() => {
    if (!propUser) return;
    const sig = JSON.stringify({
      id: propUser.id,
      username: propUser.username || propUser.name,
      phone: propUser.phone,
      address: propUser.address,
      image_path: propUser.image_path || propUser.avatar,
    });
    if (syncedPropUserSigRef.current === sig) return;
    syncedPropUserSigRef.current = sig;

    applyUserToState(propUser, { forceReset: false });
    setLoading(false);
  }, [propUser, applyUserToState]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      if (!propUserRef.current) setShowLoginModal(true);
      return;
    }

    const controller = new AbortController();

    if (!propUserRef.current) {
      axios
        .get("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        })
        .then((res) => {
          const rawUser = res.data?.user || res.data?.data || res.data;
          applyUserToState(rawUser, { forceReset: false });
          if (Array.isArray(res.data?.orders) && res.data.orders.length > 0) {
            setOrders(res.data.orders);
            hydrateOrderDetails(res.data.orders, token);
          }
        })
        .catch((err) => {
          if (axios.isCancel(err)) return;
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setShowLoginModal(true);
          } else {
            setMsg({
              type: "error",
              text:
                err.response?.data?.message ||
                "Không thể kết nối đến máy chủ API.",
            });
          }
        })
        .finally(() => setLoading(false));
    }

    if (
      !Array.isArray(propOrdersRef.current) ||
      propOrdersRef.current.length === 0
    ) {
      fetchUserOrders(controller.signal);
    } else {
      hydrateOrderDetails(propOrdersRef.current, token);
    }

    return () => controller.abort();
  }, [applyUserToState, fetchUserOrders, hydrateOrderDetails]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return setShowLoginModal(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setSaving(true);
      setMsg({ type: "", text: "" });
      const res = await axios.post("/api/profile/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const nextPath =
        res.data?.image_path || res.data?.data?.image_path || user.image_path;
      const nextUser = { ...user, image_path: nextPath };
      setUser(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));
      window.dispatchEvent(
        new CustomEvent("user-updated", { detail: nextUser })
      );

      setMsg({
        type: "success",
        text: res.data?.message || "Cập nhật ảnh đại diện thành công!",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          "Lỗi tải ảnh đại diện. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const fullAddress = useMemo(
    () =>
      formatVietnamAddress({
        provinceCode,
        districtCode,
        wardName,
        streetAddress,
      }),
    [provinceCode, districtCode, wardName, streetAddress]
  );

  const handleRequestSaveProfile = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setShowLoginModal(true);

    if (!profileForm.username.trim()) {
      setMsg({ type: "error", text: "Vui lòng nhập họ và tên." });
      return;
    }

    let nextAddress = user.address || "";
    if (isEditingAddress) {
      if (!provinceCode || !streetAddress.trim()) {
        setMsg({
          type: "error",
          text: "Vui lòng chọn Tỉnh/Thành phố và nhập Địa chỉ cụ thể (số nhà, tên đường).",
        });
        return;
      }
      nextAddress = fullAddress;
    }

    setMsg({ type: "", text: "" });
    const payload = {
      username: profileForm.username.trim(),
      name: profileForm.username.trim(),
      phone: profileForm.phone.trim(),
      address: nextAddress,
    };

    setConfirmState({
      open: true,
      type: "profile",
      title: "Xác nhận lưu thông tin cá nhân",
      message:
        "Bạn có chắc chắn muốn cập nhật thông tin hồ sơ và địa chỉ nhận hàng mặc định không?",
      detailText: `${payload.username}${
        payload.phone ? ` • ${payload.phone}` : ""
      }${payload.address ? ` — ${payload.address}` : ""}`,
      confirmText: "Lưu thay đổi",
      variant: "warning",
      payload,
    });
  };

  const handleRequestChangePassword = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setShowLoginModal(true);

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setMsg({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    setMsg({ type: "", text: "" });
    setConfirmState({
      open: true,
      type: "password",
      title: "Xác nhận cập nhật mật khẩu",
      message:
        "Bạn có chắc chắn muốn thay đổi sang mật khẩu mới cho tài khoản này không?",
      detailText: `Tài khoản: ${user.email}`,
      confirmText: "Cập nhật mật khẩu",
      variant: "warning",
      payload: { ...passwordForm },
    });
  };

  const handleRequestCancelOrder = (order) => {
    const orderCode = order.order_code || order.code || `#MS${order.id}`;
    setConfirmState({
      open: true,
      type: "cancel_order",
      title: "Xác nhận hủy đơn hàng",
      message: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      detailText: `Đơn hàng ${orderCode}`,
      confirmText: "Xác nhận hủy đơn",
      variant: "danger",
      payload: order.id,
    });
  };

  const handleExecuteConfirmedAction = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setConfirmState((prev) => ({ ...prev, open: false }));
      return setShowLoginModal(true);
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    if (confirmState.type === "profile") {
      const payload = confirmState.payload;
      setSaving(true);
      setMsg({ type: "", text: "" });
      try {
        const res = await axios.put("/api/profile", payload, { headers });
        isProfileDirtyRef.current = false;
        isAddressDirtyRef.current = false;
        setIsEditingAddress(false);
        applyUserToState({ ...user, ...payload }, { forceReset: true });
        setMsg({
          type: "success",
          text: res.data?.message || "Cập nhật hồ sơ thành công!",
        });
      } catch (err) {
        const firstErr = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat()[0]
          : null;
        setMsg({
          type: "error",
          text:
            firstErr || err.response?.data?.message || "Có lỗi xảy ra khi lưu!",
        });
      } finally {
        setSaving(false);
        setConfirmState((prev) => ({ ...prev, open: false }));
      }
      return;
    }

    if (confirmState.type === "password") {
      const payload = confirmState.payload;
      setSaving(true);
      setMsg({ type: "", text: "" });
      try {
        const res = await axios.put("/api/profile/change-password", payload, {
          headers,
        });
        setMsg({
          type: "success",
          text: res.data?.message || "Đổi mật khẩu thành công!",
        });
        setPasswordForm({
          old_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      } catch (err) {
        const firstErr = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat()[0]
          : null;
        setMsg({
          type: "error",
          text:
            firstErr ||
            err.response?.data?.message ||
            "Mật khẩu hiện tại không đúng!",
        });
      } finally {
        setSaving(false);
        setConfirmState((prev) => ({ ...prev, open: false }));
      }
      return;
    }

    if (confirmState.type === "cancel_order") {
      const orderId = confirmState.payload;
      setCancellingOrderId(orderId);
      setMsg({ type: "", text: "" });
      try {
        let res;
        try {
          res = await axios.post(`/api/orders/${orderId}/cancel`, {}, { headers });
        } catch (err) {
          if (err.response?.status === 404 || err.response?.status === 405) {
            res = await axios.put(
              `/api/orders/${orderId}/cancel`,
              {},
              { headers }
            );
          } else {
            throw err;
          }
        }

        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" } : o
          )
        );
        setMsg({
          type: "success",
          text: res?.data?.message || "Đã hủy đơn hàng thành công!",
        });
      } catch (err) {
        setMsg({
          type: "error",
          text:
            err.response?.data?.message ||
            "Không thể hủy đơn hàng này. Vui lòng thử lại.",
        });
      } finally {
        setCancellingOrderId(null);
        setConfirmState((prev) => ({ ...prev, open: false }));
      }
    }
  };

  /**
   * Mua lại đơn hàng đã hoàn thành hoặc đã hủy:
   * Thêm lại đúng các sản phẩm & số lượng của đơn đó vào giỏ hàng rồi chuyển sang /checkout
   */
  const handleReorderOrder = async (normalizedOrder) => {
    const token = localStorage.getItem("token");
    if (!token) return setShowLoginModal(true);

    setReorderingOrderId(normalizedOrder.id);
    setMsg({ type: "", text: "" });

    try {
      let itemsToReorder = Array.isArray(normalizedOrder.items)
        ? normalizedOrder.items
        : [];

      // Nếu danh sách sản phẩm chưa được tải sẵn trong đơn, gọi API chi tiết đơn để lấy
      if (itemsToReorder.length === 0) {
        const detailRes = await axios.get(`/api/orders/${normalizedOrder.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const detail =
          detailRes.data?.order || detailRes.data?.data || detailRes.data;
        const rawItems = extractOrderItems(detail);
        itemsToReorder = rawItems.map((item) => {
          const info = extractItemProductInfo(item, productMap);
          return {
            productId: info.productId,
            name: info.name,
            quantity: Number(
              item.quantity ?? item.qty ?? item.pivot?.quantity ?? 1
            ),
          };
        });
      }

      const validItems = itemsToReorder.filter(
        (it) => it.productId && Number(it.quantity) > 0
      );

      if (validItems.length === 0) {
        setMsg({
          type: "error",
          text: "Không tìm thấy thông tin ấn phẩm hợp lệ trong đơn hàng này để mua lại.",
        });
        setReorderingOrderId(null);
        return;
      }

      let addedCount = 0;
      let lastErrorMessage = "";

      for (const item of validItems) {
        try {
          await addItemToCartApi(token, item.productId, item.quantity);
          addedCount += 1;
        } catch (err) {
          lastErrorMessage =
            err.response?.data?.message ||
            `Không thể thêm "${item.name}" vào giỏ hàng.`;
        }
      }

      if (addedCount === 0) {
        setMsg({
          type: "error",
          text:
            lastErrorMessage ||
            "Các ấn phẩm trong đơn hàng này hiện đã hết hàng hoặc ngừng kinh doanh.",
        });
        setReorderingOrderId(null);
        return;
      }

      window.dispatchEvent(new Event("cart-updated"));
      window.location.href = "/checkout";
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLoginModal(true);
      } else {
        setMsg({
          type: "error",
          text:
            err.response?.data?.message ||
            "Không thể thực hiện mua lại đơn hàng. Vui lòng thử lại.",
        });
      }
      setReorderingOrderId(null);
    }
  };

  const handleToggleOrderDetail = async (order) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(order.id);
    const token = localStorage.getItem("token");
    if (!token) return;

    setDetailLoadingId(order.id);
    try {
      const res = await axios.get(`/api/orders/${order.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const detail = res.data?.order || res.data?.data || res.data;
      if (detail && typeof detail === "object") {
        const mergedOrder = { ...order, ...detail };
        setOrders((prev) =>
          prev.map((item) => (item.id === order.id ? mergedOrder : item))
        );
        hydrateMissingProducts([mergedOrder], token);
      }
    } catch {
      // Giữ nguyên dữ liệu hiện có nếu API chi tiết lỗi
    } finally {
      setDetailLoadingId(null);
    }
  };

  const openReviewModal = (orderCode, item) => {
    const info = extractItemProductInfo(item, productMap);
    setReviewTarget({
      orderCode,
      productId: info.productId,
      productName: info.name,
      productImage: info.imageUrl,
      productAltImage: info.altImageUrl,
    });
    setReviewRating(5);
    setHoverRating(0);
    setReviewComment("");
    setReviewError("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget?.productId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setReviewTarget(null);
      return setShowLoginModal(true);
    }

    setReviewSubmitting(true);
    setReviewError("");

    try {
      const res = await axios.post(
        "/api/reviews",
        {
          product_id: reviewTarget.productId,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const savedReview = res.data?.review || {
        rating: reviewRating,
        comment: reviewComment.trim(),
      };

      setOrders((prevOrders) =>
        prevOrders.map((ord) => {
          const items = extractOrderItems(ord);
          if (items.length === 0) return ord;
          const updatedItems = items.map((it) => {
            const info = extractItemProductInfo(it, productMap);
            if (Number(info.productId) === Number(reviewTarget.productId)) {
              return { ...it, user_review: savedReview };
            }
            return it;
          });
          return { ...ord, items: updatedItems };
        })
      );

      setMsg({
        type: "success",
        text:
          res.data?.message ||
          `Đã gửi đánh giá ${reviewRating} sao cho "${reviewTarget.productName}"!`,
      });
      setReviewTarget(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setReviewTarget(null);
        setShowLoginModal(true);
      } else {
        const firstErr = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat()[0]
          : null;
        setReviewError(
          firstErr ||
            err.response?.data?.message ||
            "Không thể gửi đánh giá. Vui lòng thử lại."
        );
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setMsg({ type: "", text: "" });
    if (tabId === "orders") {
      if (orders.length === 0 && !ordersLoading) {
        fetchUserOrders();
      } else {
        const token = localStorage.getItem("token");
        if (token) hydrateOrderDetails(orders, token);
      }
    }
  };

  const normalizedOrders = useMemo(() => {
    return (Array.isArray(orders) ? orders : []).map((order) => {
      const statusKey = normalizeOrderStatus(order.status);
      const statusInfo = ORDER_STATUS_CONFIG[statusKey] || {
        label: order.status || "Đang xử lý",
        badge: "bg-stone-100 text-stone-700 border-stone-200",
      };

      const rawItems = extractOrderItems(order);
      const items = rawItems.map((item, idx) => {
        const info = extractItemProductInfo(item, productMap);
        const qty = Number(
          item.quantity ?? item.qty ?? item.pivot?.quantity ?? 1
        );
        const unitPrice = Number(
          item.price ??
            item.unit_price ??
            item.pivot?.price ??
            item.product?.price ??
            0
        );
        return {
          key: item.id || `${order.id}-${idx}`,
          raw: item,
          productId: info.productId,
          name: info.name,
          imageUrl: info.imageUrl,
          altImageUrl: info.altImageUrl,
          quantity: qty,
          unitPrice,
          lineTotal: unitPrice * qty,
          existingReview: item.user_review || item.review || null,
        };
      });

      const computedItemsTotal = items.reduce(
        (sum, it) => sum + it.lineTotal,
        0
      );
      const shippingFee = Number(order.shipping_fee ?? 0);
      const discountAmount = Number(order.discount_amount ?? 0);
      const rawTotal = Number(
        order.total_amount ??
          order.total_price ??
          order.grand_total ??
          order.total ??
          0
      );
      const totalAmount =
        rawTotal > 0
          ? rawTotal
          : Math.max(0, computedItemsTotal - discountAmount) + shippingFee;

      const paymentKey = String(order.payment_method || "cod").toLowerCase();

      return {
        id: order.id,
        raw: order,
        code: order.order_code || order.code || `#MS${order.id}`,
        statusKey,
        statusLabel: statusInfo.label,
        statusBadge: statusInfo.badge,
        isCompleted: statusKey === "completed",
        canCancel: statusKey === "pending",
        canReorder: statusKey === "completed" || statusKey === "cancelled",
        createdAtLabel: formatDateTime(order.created_at),
        totalAmount,
        discountAmount,
        items,
        receiverName:
          order.shipping_name ||
          order.receiver_name ||
          order.customer_name ||
          user.username,
        receiverPhone:
          order.shipping_phone || order.receiver_phone || order.phone || "",
        shippingAddress:
          order.shipping_address ||
          order.receiver_address ||
          order.address ||
          "Theo địa chỉ mặc định",
        paymentLabel:
          PAYMENT_METHOD_LABELS[paymentKey] ||
          order.payment_method ||
          "Thanh toán khi nhận hàng (COD)",
        note: order.note || order.notes || "",
      };
    });
  }, [orders, productMap, user.username]);

  // Tính số lượng đơn hàng theo từng trạng thái
  const orderCounts = useMemo(() => {
    const counts = {
      all: normalizedOrders.length,
      pending: 0,
      processing: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const ord of normalizedOrders) {
      if (Object.prototype.hasOwnProperty.call(counts, ord.statusKey)) {
        counts[ord.statusKey] += 1;
      }
    }
    return counts;
  }, [normalizedOrders]);

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === "all") return normalizedOrders;
    return normalizedOrders.filter((o) => o.statusKey === orderStatusFilter);
  }, [normalizedOrders, orderStatusFilter]);

  const memberTier = useMemo(
    () => computeMemberTier(user, orders),
    [user, orders]
  );

  const avatarSrc = resolveAssetUrl(user.image_path);
  const avatarInitial = (user.username || user.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const isConfirmLoading =
    saving ||
    (confirmState.type === "cancel_order" &&
      cancellingOrderId === confirmState.payload);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
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
        onSwitchTab={switchTab}
        onProfileFieldChange={(field, val) => {
          isProfileDirtyRef.current = true;
          setProfileForm((prev) => ({ ...prev, [field]: val }));
        }}
        onStartEditAddress={handleStartEditAddress}
        onCancelEditAddress={handleCancelEditAddress}
        onProvinceChange={(val) => {
          isAddressDirtyRef.current = true;
          setProvinceCode(val);
        }}
        onDistrictChange={(val) => {
          isAddressDirtyRef.current = true;
          setDistrictCode(val);
        }}
        onWardChange={(val) => {
          isAddressDirtyRef.current = true;
          setWardName(val);
        }}
        onStreetChange={(val) => {
          isAddressDirtyRef.current = true;
          setStreetAddress(val);
        }}
        onDatasetLoaded={handleDatasetLoaded}
        onRequestSaveProfile={handleRequestSaveProfile}
        passwordForm={passwordForm}
        onPasswordFieldChange={(field, val) =>
          setPasswordForm((prev) => ({ ...prev, [field]: val }))
        }
        onRequestChangePassword={handleRequestChangePassword}
        orders={normalizedOrders}
        filteredOrders={filteredOrders}
        orderCounts={orderCounts}
        ordersLoading={ordersLoading}
        ordersError={ordersError}
        orderStatusFilter={orderStatusFilter}
        expandedOrderId={expandedOrderId}
        detailLoadingId={detailLoadingId}
        cancellingOrderId={cancellingOrderId}
        reorderingOrderId={reorderingOrderId}
        onRefreshOrders={() =>
          fetchUserOrders(undefined, { forceRehydrate: true })
        }
        onFilterOrdersChange={setOrderStatusFilter}
        onToggleOrderDetail={handleToggleOrderDetail}
        onRequestCancelOrder={handleRequestCancelOrder}
        onReorderOrder={handleReorderOrder}
        reviewTarget={reviewTarget}
        reviewRating={reviewRating}
        hoverRating={hoverRating}
        reviewComment={reviewComment}
        reviewSubmitting={reviewSubmitting}
        reviewError={reviewError}
        onOpenReviewModal={openReviewModal}
        onCloseReviewModal={() => setReviewTarget(null)}
        onReviewRatingChange={setReviewRating}
        onHoverRatingChange={setHoverRating}
        onReviewCommentChange={setReviewComment}
        onSubmitReview={handleSubmitReview}
      />

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Modal xác nhận dùng chung khi Lưu hồ sơ / Đổi mật khẩu / Hủy đơn */}
      <ConfirmModal
        open={confirmState.open}
        variant={confirmState.variant}
        title={confirmState.title}
        message={confirmState.message}
        detailText={confirmState.detailText}
        confirmText={confirmState.confirmText}
        cancelText="Quay lại"
        loading={isConfirmLoading}
        onConfirm={handleExecuteConfirmedAction}
        onCancel={() =>
          !isConfirmLoading &&
          setConfirmState((prev) => ({ ...prev, open: false }))
        }
      />
    </>
  );
}