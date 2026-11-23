import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import LoginRequiredModal from "../components/LoginRequiredModal";
import PasswordInput from "../components/PasswordInput";
import VietnamAddressSelector, {
  formatVietnamAddress,
  parseAddressParts,
} from "../components/VietnamAddressSelector";

const UI = {
  card: "bg-white border border-stone-200/80 rounded-2xl shadow-2xs",
  label: "block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5",
  input:
    "w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition",
  btnPrimary:
    "w-full sm:w-auto px-6 py-3 bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs",
};

const TABS = [
  {
    id: "profile",
    label: "Thông tin cá nhân",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
  },
  {
    id: "password",
    label: "Đổi mật khẩu",
    icon: (
      <>
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
  },
  {
    id: "orders",
    label: "Đơn hàng của tôi",
    icon: (
      <>
        <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </>
    ),
  },
];

const RATING_LABELS = {
  1: "Rất không hài lòng",
  2: "Chưa hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Tuyệt vời",
};

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
  shipped: {
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

const ORDER_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

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
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) {
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
  // Mặc định Laravel Storage::disk('public') lưu dạng "products/abc.jpg" hoặc "avatars/xyz.png"
  if (clean.includes("/")) {
    return `/storage/${clean}`;
  }
  return `/${clean}`;
}

function getAlternateAssetUrl(currentUrl) {
  if (!currentUrl || /^https?:\/\//i.test(currentUrl) || currentUrl.startsWith("data:")) {
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

  return {
    productId,
    name,
    hasResolvedName: Boolean(String(rawName).trim()),
    imageUrl: resolveAssetUrl(rawImage),
    hasResolvedImage: Boolean(String(rawImage).trim()),
  };
}

function ProductThumbnail({ src, alt, className = "w-11 h-15" }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [triedAlt, setTriedAlt] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setTriedAlt(false);
  }, [src]);

  if (!currentSrc) {
    return (
      <div
        className={`${className} rounded-lg bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] flex flex-col items-center justify-center text-[9px] font-bold uppercase tracking-wider shrink-0 select-none`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-4 h-4 mb-0.5"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span>SÁCH</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (!triedAlt) {
          const altUrl = getAlternateAssetUrl(currentSrc);
          if (altUrl && altUrl !== currentSrc) {
            setTriedAlt(true);
            setCurrentSrc(altUrl);
            return;
          }
        }
        setCurrentSrc(null);
      }}
      className={`${className} object-contain rounded-lg bg-stone-100 p-0.5 border border-stone-200/70 shrink-0`}
    />
  );
}

function StarIcon({ filled, className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

export default function Account({ user: propUser = null, orders: propOrders = null }) {
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
    return TABS.some((t) => t.id === tab) ? tab : "profile";
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

  // State đơn hàng & cache thông tin sản phẩm
  const [orders, setOrders] = useState(Array.isArray(propOrders) ? propOrders : []);
  const [productMap, setProductMap] = useState({});
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // State Modal Đánh giá sản phẩm
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // State địa chỉ nhận hàng mặc định
  const [provinceCode, setProvinceCode] = useState(initialAddr.provinceCode);
  const [districtCode, setDistrictCode] = useState(initialAddr.districtCode);
  const [wardName, setWardName] = useState(initialAddr.wardName);
  const [streetAddress, setStreetAddress] = useState(initialAddr.street);

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

  const applyUserToState = useCallback((rawUser, { forceReset = false } = {}) => {
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
    window.dispatchEvent(new CustomEvent("user-updated", { detail: normalized }));
  }, []);

  // Chỉ tách lại địa chỉ DB sau khi dataset 63 tỉnh tải xong nếu người dùng CHƯA chỉnh sửa
  const handleDatasetLoaded = useCallback((fullProvinces) => {
    if (isAddressDirtyRef.current || !savedAddressRef.current) return;
    const parsed = parseAddressParts(savedAddressRef.current, fullProvinces);
    setProvinceCode(parsed.provinceCode);
    setDistrictCode(parsed.districtCode);
    setWardName(parsed.wardName);
    setStreetAddress(parsed.street);
  }, []);

  const handleProvinceChange = useCallback((val) => {
    isAddressDirtyRef.current = true;
    setProvinceCode(val);
  }, []);

  const handleDistrictChange = useCallback((val) => {
    isAddressDirtyRef.current = true;
    setDistrictCode(val);
  }, []);

  const handleWardChange = useCallback((val) => {
    isAddressDirtyRef.current = true;
    setWardName(val);
  }, []);

  const handleStreetChange = useCallback((val) => {
    isAddressDirtyRef.current = true;
    setStreetAddress(val);
  }, []);

  // Tự động bổ sung tên/ảnh sản phẩm cho các item chỉ có product_id
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
          return [pid, res.data?.book || res.data?.product || res.data?.data || res.data];
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

  // Tự động tải chi tiết đơn hàng nếu endpoint /api/orders chưa kèm danh sách items
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
      try {
        const res = await axios.get("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal,
        });

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

  // Chỉ đồng bộ propUser khi dữ liệu thực sự thay đổi và người dùng chưa chỉnh sửa
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

  // Tải thông tin profile & danh sách đơn hàng đúng 1 lần khi mount
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
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
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
              text: err.response?.data?.message || "Không thể kết nối đến máy chủ API.",
            });
          }
        })
        .finally(() => setLoading(false));
    }

    if (!Array.isArray(propOrdersRef.current) || propOrdersRef.current.length === 0) {
      fetchUserOrders(controller.signal);
    } else {
      hydrateOrderDetails(propOrdersRef.current, token);
    }

    return () => controller.abort();
  }, [applyUserToState, fetchUserOrders, hydrateOrderDetails]);

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

  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) return setShowLoginModal(true);

    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      return;
    }

    setCancellingOrderId(orderId);
    setMsg({ type: "", text: "" });
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    try {
      let res;
      try {
        res = await axios.post(`/api/orders/${orderId}/cancel`, {}, { headers });
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 405) {
          res = await axios.put(`/api/orders/${orderId}/cancel`, {}, { headers });
        } else {
          throw err;
        }
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
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
    }
  };

  const openReviewModal = (orderCode, item) => {
    const info = extractItemProductInfo(item, productMap);

    setReviewTarget({
      orderCode,
      productId: info.productId,
      productName: info.name,
      productImage: info.imageUrl,
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
      window.dispatchEvent(new CustomEvent("user-updated", { detail: nextUser }));

      setMsg({
        type: "success",
        text: res.data?.message || "Cập nhật ảnh đại diện thành công!",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Lỗi tải ảnh đại diện. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setShowLoginModal(true);

    const hasAnyAddressInput = Boolean(
      provinceCode || districtCode || wardName || streetAddress.trim()
    );
    if (hasAnyAddressInput && (!provinceCode || !streetAddress.trim())) {
      setMsg({
        type: "error",
        text: "Vui lòng chọn Tỉnh/Thành phố và nhập Địa chỉ cụ thể (số nhà, tên đường).",
      });
      return;
    }

    setSaving(true);
    setMsg({ type: "", text: "" });

    const payload = {
      username: profileForm.username.trim(),
      name: profileForm.username.trim(),
      phone: profileForm.phone.trim(),
      address: hasAnyAddressInput ? fullAddress : "",
    };

    try {
      const res = await axios.put("/api/profile", payload, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      isProfileDirtyRef.current = false;
      isAddressDirtyRef.current = false;
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
        text: firstErr || err.response?.data?.message || "Có lỗi xảy ra khi lưu!",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setShowLoginModal(true);

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      return setMsg({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
    }

    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await axios.put("/api/profile/change-password", passwordForm, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
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
        text: firstErr || err.response?.data?.message || "Mật khẩu cũ không đúng!",
      });
    } finally {
      setSaving(false);
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

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === "all") return orders;
    return orders.filter((o) => {
      const st = String(o.status || "pending").toLowerCase();
      if (orderStatusFilter === "shipping") {
        return st === "shipping" || st === "shipped";
      }
      return st === orderStatusFilter;
    });
  }, [orders, orderStatusFilter]);

  const avatarSrc = resolveAssetUrl(user.image_path);
  const avatarInitial = (user.username || user.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();
  const displayRating = hoverRating || reviewRating;

  return (
    <div className="bg-[#FAF8F5] min-h-[calc(100vh-200px)]">
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* MODAL ĐÁNH GIÁ SẢN PHẨM */}
      {reviewTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4"
          onClick={() => !reviewSubmitting && setReviewTarget(null)}
        >
          <div
            className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A5B13]">
                  Đánh giá ấn phẩm &bull; {reviewTarget.orderCode}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] mt-0.5">
                  Chia sẻ cảm nhận của bạn
                </h3>
              </div>
              <button
                type="button"
                disabled={reviewSubmitting}
                onClick={() => setReviewTarget(null)}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition cursor-pointer"
                aria-label="Đóng"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center gap-3 bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-3">
              <ProductThumbnail
                src={reviewTarget.productImage}
                alt={reviewTarget.productName}
                className="w-11 h-15"
              />
              <div className="min-w-0">
                <div className="text-[11px] text-stone-500">Sản phẩm đã mua</div>
                <div className="font-serif text-sm font-bold text-stone-900 line-clamp-2">
                  {reviewTarget.productName}
                </div>
              </div>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="text-center space-y-2 py-1">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Mức độ hài lòng của bạn
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(star)}
                        className={`p-1.5 rounded-lg transition transform hover:scale-110 cursor-pointer ${
                          isFilled ? "text-amber-500" : "text-stone-300"
                        }`}
                        title={`${star} sao`}
                      >
                        <StarIcon filled={isFilled} className="w-8 h-8" />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-semibold text-[#9A5B13]">
                  {displayRating} sao &mdash; {RATING_LABELS[displayRating]}
                </div>
              </div>

              <div>
                <label className={UI.label}>
                  Nhận xét chi tiết (Không bắt buộc)
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chất lượng giấy in, đóng gói, nội dung cuốn sách thế nào..."
                  className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition resize-none"
                />
                <div className="text-[11px] text-stone-400 text-right mt-1">
                  {reviewComment.length}/1000 ký tự
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={reviewSubmitting}
                  onClick={() => setReviewTarget(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <a href="/" className="hover:text-[#9A5B13] transition">
            Trang chủ
          </a>
          <span>&rsaquo;</span>
          <span className="text-[#9A5B13]">Tài khoản độc giả</span>
        </nav>

        {/* Tiêu đề trang */}
        <div className="border-b border-stone-200/80 pb-5">
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1A1A] mt-1 tracking-tight">
            Tài Khoản Của Tôi
          </h1>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-stone-500">
            Đang tải thông tin tài khoản...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* SIDEBAR TRÁI */}
            <aside
              className={`lg:col-span-4 xl:col-span-3 p-5 sm:p-6 lg:sticky lg:top-6 space-y-5 ${UI.card}`}
            >
              <div className="flex flex-col items-center text-center border-b border-stone-100 pb-5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Nhấn để đổi ảnh đại diện"
                  className="relative group cursor-pointer mb-3.5 rounded-full focus:outline-none"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#F5EDE2] shadow-xs bg-[#FAF8F5]">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={user.username || "Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#141414] text-white flex items-center justify-center font-serif text-3xl font-bold">
                        {avatarInitial}
                      </div>
                    )}
                  </div>
                  <span className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-bold uppercase tracking-wider">
                    Đổi ảnh
                  </span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#F5EDE2] border border-[#E5D5BE] text-[10px] font-bold uppercase tracking-wider text-[#9A5B13] mb-2">
                  Độc giả Thành viên
                </span>

                <h2 className="font-serif text-lg font-bold text-[#1A1A1A] line-clamp-1 max-w-full">
                  {user.username || "Thành viên BookHouse"}
                </h2>
                <p className="text-xs text-stone-500 truncate max-w-full mt-0.5">
                  {user.email}
                </p>
              </div>

              <nav className="space-y-1.5">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => switchTab(tab.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                        isActive
                          ? "bg-[#141414] text-white shadow-xs"
                          : "text-stone-600 hover:bg-[#FAF8F5] hover:text-stone-900"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="w-4 h-4 shrink-0"
                        >
                          {tab.icon}
                        </svg>
                        <span>{tab.label}</span>
                      </span>

                      {tab.id === "orders" && orders.length > 0 && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#F5EDE2] text-[#9A5B13]"
                          }`}
                        >
                          {orders.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* NỘI DUNG CHÍNH BÊN PHẢI */}
            <section
              className={`lg:col-span-8 xl:col-span-9 p-4 sm:p-6 lg:p-8 min-h-[420px] ${UI.card}`}
            >
              {msg.text && (
                <div
                  className={`mb-6 p-3.5 rounded-xl border text-xs sm:text-sm ${
                    msg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {/* TAB 1: HỒ SƠ CÁ NHÂN */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                      Hồ Sơ Cá Nhân
                    </h2>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="max-w-3xl space-y-5">
                    <div>
                      <label className={UI.label}>
                        Email đăng nhập (Không thể thay đổi)
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-stone-100 border border-stone-200/80 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={UI.label}>
                          Họ và tên <span className="text-[#9A5B13]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.username}
                          onChange={(e) => {
                            isProfileDirtyRef.current = true;
                            setProfileForm({ ...profileForm, username: e.target.value });
                          }}
                          placeholder="Nhập họ và tên"
                          className={UI.input}
                        />
                      </div>

                      <div>
                        <label className={UI.label}>Số điện thoại</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => {
                            isProfileDirtyRef.current = true;
                            setProfileForm({ ...profileForm, phone: e.target.value });
                          }}
                          placeholder="Ví dụ: 0988 123 456"
                          className={UI.input}
                        />
                      </div>
                    </div>

                    <VietnamAddressSelector
                      provinceCode={provinceCode}
                      onProvinceChange={handleProvinceChange}
                      districtCode={districtCode}
                      onDistrictChange={handleDistrictChange}
                      wardName={wardName}
                      onWardChange={handleWardChange}
                      streetAddress={streetAddress}
                      onStreetChange={handleStreetChange}
                      onDatasetLoaded={handleDatasetLoaded}
                      mapLabel="Vị trí trên bản đồ:"
                      mapHeightClass="h-56 sm:h-64"
                      header={
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A5B13]">
                            Địa chỉ nhận hàng mặc định
                          </h3>
                          {user.address && (
                            <span className="text-[11px] text-stone-500 truncate max-w-full sm:max-w-[65%]">
                              Đã lưu:{" "}
                              <strong className="text-stone-700">
                                {user.address}
                              </strong>
                            </span>
                          )}
                        </div>
                      }
                    />

                    <div className="pt-1">
                      <button type="submit" disabled={saving} className={UI.btnPrimary}>
                        {saving ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU */}
              {activeTab === "password" && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                      Đổi Mật Khẩu
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Cập nhật mật khẩu định kỳ để bảo vệ tài khoản độc giả
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="max-w-xl space-y-4">
                    <div>
                      <label className={UI.label}>
                        Mật khẩu hiện tại <span className="text-[#9A5B13]">*</span>
                      </label>
                      <PasswordInput
                        required
                        value={passwordForm.old_password}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, old_password: e.target.value })
                        }
                        placeholder="Nhập mật khẩu hiện tại"
                        autoComplete="current-password"
                      />
                    </div>

                    <div>
                      <label className={UI.label}>
                        Mật khẩu mới (tối thiểu 8 ký tự){" "}
                        <span className="text-[#9A5B13]">*</span>
                      </label>
                      <PasswordInput
                        required
                        minLength={8}
                        value={passwordForm.new_password}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, new_password: e.target.value })
                        }
                        placeholder="Nhập mật khẩu mới"
                        autoComplete="new-password"
                      />
                    </div>

                    <div>
                      <label className={UI.label}>
                        Xác nhận mật khẩu mới <span className="text-[#9A5B13]">*</span>
                      </label>
                      <PasswordInput
                        required
                        minLength={8}
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            new_password_confirmation: e.target.value,
                          })
                        }
                        placeholder="Nhập lại mật khẩu mới"
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="pt-2">
                      <button type="submit" disabled={saving} className={UI.btnPrimary}>
                        {saving ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: ĐƠN HÀNG CỦA TÔI */}
              {activeTab === "orders" && (
                <div className="space-y-5">
                  <div className="border-b border-stone-100 pb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                        Đơn Hàng Của Tôi
                      </h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Theo dõi lịch sử đặt mua, trạng thái giao nhận và đánh giá ấn phẩm
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchUserOrders(undefined, { forceRehydrate: true })}
                      disabled={ordersLoading}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 transition cursor-pointer disabled:opacity-50"
                    >
                      {ordersLoading ? "Đang tải..." : "Làm mới"}
                    </button>
                  </div>

                  {orders.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {ORDER_FILTERS.map((filter) => {
                        const isSelected = orderStatusFilter === filter.id;
                        const count =
                          filter.id === "all"
                            ? orders.length
                            : orders.filter((o) => {
                                const st = String(o.status || "pending").toLowerCase();
                                if (filter.id === "shipping") {
                                  return st === "shipping" || st === "shipped";
                                }
                                return st === filter.id;
                              }).length;

                        return (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() => setOrderStatusFilter(filter.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              isSelected
                                ? "bg-[#141414] text-white border-[#141414]"
                                : "bg-[#FAF8F5] text-stone-600 border-stone-200/80 hover:border-stone-300"
                            }`}
                          >
                            {filter.label} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {ordersError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
                      {ordersError}
                    </div>
                  )}

                  {ordersLoading ? (
                    <div className="py-14 text-center text-sm text-stone-500">
                      Đang tải danh sách đơn hàng của bạn...
                    </div>
                  ) : filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => {
                        const statusKey = String(
                          order.status || "pending"
                        ).toLowerCase();
                        const statusInfo = ORDER_STATUS_CONFIG[statusKey] || {
                          label: order.status || "Đang xử lý",
                          badge: "bg-stone-100 text-stone-700 border-stone-200",
                        };
                        const orderCode =
                          order.order_code || order.code || `#MS${order.id}`;
                        const orderItems = extractOrderItems(order);
                        const isExpanded = expandedOrderId === order.id;
                        const isCompleted = statusKey === "completed";
                        const paymentKey = String(
                          order.payment_method || "cod"
                        ).toLowerCase();
                        const paymentLabel =
                          PAYMENT_METHOD_LABELS[paymentKey] ||
                          order.payment_method ||
                          "Thanh toán khi nhận hàng (COD)";

                        return (
                          <div
                            key={order.id}
                            className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200/70 pb-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs sm:text-sm font-bold text-[#9A5B13]">
                                    Đơn hàng {orderCode}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.badge}`}
                                  >
                                    {statusInfo.label}
                                  </span>
                                </div>
                                <div className="text-xs text-stone-500 mt-1">
                                  Ngày đặt: {formatDateTime(order.created_at)}
                                </div>
                              </div>

                              <div className="text-left sm:text-right">
                                <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                                  Tổng thanh toán
                                </div>
                                <div className="text-base sm:text-lg font-bold text-stone-900">
                                  {Number(order.total_amount || 0).toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  ₫
                                </div>
                              </div>
                            </div>

                            {orderItems.length > 0 ? (
                              <div className="space-y-2.5">
                                {(isExpanded || isCompleted
                                  ? orderItems
                                  : orderItems.slice(0, 2)
                                ).map((item, idx) => {
                                  const info = extractItemProductInfo(item, productMap);
                                  const qty = Number(
                                    item.quantity || item.pivot?.quantity || 1
                                  );
                                  const unitPrice = Number(
                                    item.price ||
                                      item.pivot?.price ||
                                      item.product?.price ||
                                      0
                                  );
                                  const existingReview = item.user_review;

                                  return (
                                    <div
                                      key={item.id || `${order.id}-${idx}`}
                                      className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-white border border-stone-200/70 rounded-xl p-2.5 sm:p-3"
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <ProductThumbnail
                                          src={info.imageUrl}
                                          alt={info.name}
                                          className="w-11 h-15"
                                        />
                                        <div className="min-w-0">
                                          <a
                                            href={
                                              info.productId
                                                ? `/products/${info.productId}`
                                                : undefined
                                            }
                                            className="font-serif text-xs sm:text-sm font-bold text-stone-900 hover:text-[#9A5B13] transition line-clamp-1"
                                          >
                                            {info.name}
                                          </a>
                                          <div className="text-[11px] text-stone-500 mt-0.5">
                                            Số lượng:{" "}
                                            <strong className="text-stone-800">
                                              {qty}
                                            </strong>{" "}
                                            &bull;{" "}
                                            {unitPrice.toLocaleString("vi-VN")} ₫
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 ml-auto shrink-0">
                                        <div className="text-xs sm:text-sm font-bold text-stone-900">
                                          {(unitPrice * qty).toLocaleString("vi-VN")}{" "}
                                          ₫
                                        </div>

                                        {isCompleted && info.productId && (
                                          existingReview ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F5EDE2] border border-[#E5D5BE] text-[11px] font-bold text-[#9A5B13]">
                                              <StarIcon
                                                filled
                                                className="w-3.5 h-3.5 text-amber-500"
                                              />
                                              <span>
                                                Đã đánh giá ({existingReview.rating}★)
                                              </span>
                                            </span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openReviewModal(orderCode, item)
                                              }
                                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#E5D5BE] text-xs font-bold text-[#9A5B13] transition cursor-pointer"
                                            >
                                              <StarIcon
                                                filled={false}
                                                className="w-3.5 h-3.5"
                                              />
                                              <span>Đánh giá</span>
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                {!isExpanded &&
                                  !isCompleted &&
                                  orderItems.length > 2 && (
                                    <div className="text-[11px] text-stone-500 italic">
                                      Và {orderItems.length - 2} ấn phẩm khác...
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div className="text-xs text-stone-500 italic bg-white/70 border border-stone-200/60 rounded-xl px-3 py-2.5">
                                Nhấn &ldquo;Xem chi tiết&rdquo; để xem danh sách ấn phẩm trong đơn hàng.
                              </div>
                            )}

                            {isExpanded && (
                              <div className="bg-white border border-stone-200/80 rounded-xl p-3.5 text-xs space-y-1.5 text-stone-600">
                                {detailLoadingId === order.id ? (
                                  <div className="text-stone-500">
                                    Đang tải chi tiết đơn hàng...
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <span className="font-semibold text-stone-800">
                                        Người nhận:
                                      </span>{" "}
                                      {order.shipping_name ||
                                        order.receiver_name ||
                                        user.username}{" "}
                                      {order.shipping_phone ||
                                      order.receiver_phone ||
                                      order.phone
                                        ? `(${
                                            order.shipping_phone ||
                                            order.receiver_phone ||
                                            order.phone
                                          })`
                                        : ""}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-stone-800">
                                        Địa chỉ giao:
                                      </span>{" "}
                                      {order.shipping_address ||
                                        order.receiver_address ||
                                        order.address ||
                                        "Theo địa chỉ mặc định"}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-stone-800">
                                        Thanh toán:
                                      </span>{" "}
                                      {paymentLabel}
                                    </div>
                                    {order.note && (
                                      <div>
                                        <span className="font-semibold text-stone-800">
                                          Ghi chú:
                                        </span>{" "}
                                        {order.note}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleToggleOrderDetail(order)}
                                className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-800 transition cursor-pointer"
                              >
                                {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                              </button>

                              {statusKey === "pending" && (
                                <button
                                  type="button"
                                  disabled={cancellingOrderId === order.id}
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 transition cursor-pointer disabled:opacity-50"
                                >
                                  {cancellingOrderId === order.id
                                    ? "Đang hủy..."
                                    : "Hủy đơn"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-8 text-center space-y-2">
                      <p className="text-sm font-semibold text-stone-800">
                        Không có đơn hàng nào ở trạng thái này
                      </p>
                      <button
                        type="button"
                        onClick={() => setOrderStatusFilter("all")}
                        className="text-xs font-bold text-[#9A5B13] hover:underline cursor-pointer"
                      >
                        Xem tất cả đơn hàng
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-8 sm:p-12 text-center space-y-3.5">
                      <div className="w-12 h-12 mx-auto rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#9A5B13]">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="w-6 h-6"
                        >
                          <path
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                        Chưa có đơn hàng nào
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                        Khi bạn hoàn tất đặt sách, thông tin và trạng thái vận chuyển đơn hàng sẽ hiển thị tại đây.
                      </p>
                      <div className="pt-1">
                        <a
                          href="/products"
                          className="inline-block px-6 py-2.5 bg-[#141414] hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition"
                        >
                          Tiếp tục mua sắm
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}