import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import LoginRequiredModal from "../components/LoginRequiredModal";

const VIETNAM_ADDRESSES = [
  {
    code: "79",
    name: "TP. Hồ Chí Minh",
    districts: [
      {
        code: "760",
        name: "Quận 1",
        wards: [
          "Phường Bến Nghé",
          "Phường Bến Thành",
          "Phường Cầu Kho",
          "Phường Cầu Ông Lãnh",
          "Phường Cô Giang",
          "Phường Đa Kao",
          "Phường Nguyễn Cư Trinh",
          "Phường Nguyễn Thái Bình",
          "Phường Phạm Ngũ Lão",
          "Phường Tân Định",
        ],
      },
      {
        code: "770",
        name: "Quận 3",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 4",
          "Phường 5",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
          "Phường Võ Thị Sáu",
        ],
      },
      {
        code: "774",
        name: "Quận 5",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 4",
          "Phường 5",
          "Phường 7",
          "Phường 8",
          "Phường 9",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
        ],
      },
      {
        code: "776",
        name: "Quận 7",
        wards: [
          "Phường Bình Thuận",
          "Phường Phú Mỹ",
          "Phường Phú Thuận",
          "Phường Tân Hưng",
          "Phường Tân Kiểng",
          "Phường Tân Phong",
          "Phường Tân Phú",
          "Phường Tân Quy",
          "Phường Tân Thuận Đông",
          "Phường Tân Thuận Tây",
        ],
      },
      {
        code: "771",
        name: "Quận 10",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 4",
          "Phường 5",
          "Phường 6",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
          "Phường 15",
        ],
      },
      {
        code: "765",
        name: "Quận Bình Thạnh",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 5",
          "Phường 6",
          "Phường 7",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
          "Phường 17",
          "Phường 19",
          "Phường 21",
          "Phường 22",
          "Phường 24",
          "Phường 25",
          "Phường 26",
          "Phường 27",
          "Phường 28",
        ],
      },
      {
        code: "764",
        name: "Quận Gò Vấp",
        wards: [
          "Phường 1",
          "Phường 3",
          "Phường 4",
          "Phường 5",
          "Phường 6",
          "Phường 7",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
          "Phường 15",
          "Phường 16",
          "Phường 17",
        ],
      },
      {
        code: "766",
        name: "Quận Tân Bình",
        wards: [
          "Phường 1",
          "Phường 2",
          "Phường 3",
          "Phường 4",
          "Phường 5",
          "Phường 6",
          "Phường 7",
          "Phường 8",
          "Phường 9",
          "Phường 10",
          "Phường 11",
          "Phường 12",
          "Phường 13",
          "Phường 14",
          "Phường 15",
        ],
      },
      {
        code: "769",
        name: "TP. Thủ Đức",
        wards: [
          "Phường An Khánh",
          "Phường An Lợi Đông",
          "Phường An Phú",
          "Phường Bình Chiểu",
          "Phường Bình Thọ",
          "Phường Cát Lái",
          "Phường Hiệp Bình Chánh",
          "Phường Hiệp Bình Phước",
          "Phường Hiệp Phú",
          "Phường Linh Chiểu",
          "Phường Linh Đông",
          "Phường Linh Tây",
          "Phường Linh Trung",
          "Phường Linh Xuân",
          "Phường Long Bình",
          "Phường Long Thạnh Mỹ",
          "Phường Phước Bình",
          "Phường Phước Long A",
          "Phường Phước Long B",
          "Phường Tăng Nhơn Phú A",
          "Phường Tăng Nhơn Phú B",
          "Phường Thảo Điền",
          "Phường Thủ Thiêm",
          "Phường Trường Thọ",
        ],
      },
    ],
  },
  {
    code: "01",
    name: "Hà Nội",
    districts: [
      {
        code: "001",
        name: "Quận Ba Đình",
        wards: [
          "Phường Cống Vị",
          "Phường Điện Biên",
          "Phường Đội Cấn",
          "Phường Giảng Võ",
          "Phường Kim Mã",
          "Phường Liễu Giai",
          "Phường Ngọc Hà",
          "Phường Ngọc Khánh",
          "Phường Nguyễn Trung Trực",
          "Phường Phúc Xá",
          "Phường Quán Thánh",
          "Phường Thành Công",
          "Phường Trúc Bạch",
          "Phường Vĩnh Phúc",
        ],
      },
      {
        code: "002",
        name: "Quận Hoàn Kiếm",
        wards: [
          "Phường Chương Dương",
          "Phường Cửa Đông",
          "Phường Cửa Nam",
          "Phường Đồng Xuân",
          "Phường Hàng Bạc",
          "Phường Hàng Bài",
          "Phường Hàng Bồ",
          "Phường Hàng Bông",
          "Phường Hàng Buồm",
          "Phường Hàng Đào",
          "Phường Hàng Gai",
          "Phường Hàng Mã",
          "Phường Hàng Trống",
          "Phường Lý Thái Tổ",
          "Phường Phan Chu Trinh",
          "Phường Phúc Tân",
          "Phường Tràng Tiền",
          "Phường Trần Hưng Đạo",
        ],
      },
      {
        code: "005",
        name: "Quận Cầu Giấy",
        wards: [
          "Phường Dịch Vọng",
          "Phường Dịch Vọng Hậu",
          "Phường Mai Dịch",
          "Phường Nghĩa Đô",
          "Phường Nghĩa Tân",
          "Phường Quan Hoa",
          "Phường Trung Hòa",
          "Phường Yên Hòa",
        ],
      },
      {
        code: "006",
        name: "Quận Đống Đa",
        wards: [
          "Phường Cát Linh",
          "Phường Hàng Bột",
          "Phường Khâm Thiên",
          "Phường Khương Thượng",
          "Phường Kim Liên",
          "Phường Láng Hạ",
          "Phường Láng Thượng",
          "Phường Nam Đồng",
          "Phường Ngã Tư Sở",
          "Phường Ô Chợ Dừa",
          "Phường Phương Liên",
          "Phường Phương Mai",
          "Phường Quang Trung",
          "Phường Quốc Tử Giám",
          "Phường Thịnh Quang",
          "Phường Thổ Quan",
          "Phường Trung Liệt",
          "Phường Trung Phụng",
          "Phường Trung Tự",
          "Phường Văn Chương",
          "Phường Văn Miếu",
        ],
      },
      {
        code: "009",
        name: "Quận Thanh Xuân",
        wards: [
          "Phường Hạ Đình",
          "Phường Khương Đình",
          "Phường Khương Mai",
          "Phường Khương Trung",
          "Phường Kim Giang",
          "Phường Nhân Chính",
          "Phường Phương Liệt",
          "Phường Thanh Xuân Bắc",
          "Phường Thanh Xuân Nam",
          "Phường Thanh Xuân Trung",
          "Phường Thượng Đình",
        ],
      },
    ],
  },
  {
    code: "48",
    name: "Đà Nẵng",
    districts: [
      {
        code: "492",
        name: "Quận Hải Châu",
        wards: [
          "Phường Bình Hiên",
          "Phường Bình Thuận",
          "Phường Hải Châu I",
          "Phường Hải Châu II",
          "Phường Hòa Cường Bắc",
          "Phường Hòa Cường Nam",
          "Phường Hòa Thuận Đông",
          "Phường Hòa Thuận Tây",
          "Phường Nam Dương",
          "Phường Phước Ninh",
          "Phường Thạch Thang",
          "Phường Thanh Bình",
          "Phường Thuận Phước",
        ],
      },
      {
        code: "493",
        name: "Quận Sơn Trà",
        wards: [
          "Phường An Hải Bắc",
          "Phường An Hải Đông",
          "Phường An Hải Tây",
          "Phường Mân Thái",
          "Phường Nại Hiên Đông",
          "Phường Phước Mỹ",
          "Phường Thọ Quang",
        ],
      },
      {
        code: "490",
        name: "Quận Liên Chiểu",
        wards: [
          "Phường Hòa Hiệp Bắc",
          "Phường Hòa Hiệp Nam",
          "Phường Hòa Khánh Bắc",
          "Phường Hòa Khánh Nam",
          "Phường Hòa Minh",
        ],
      },
    ],
  },
  {
    code: "92",
    name: "Cần Thơ",
    districts: [
      {
        code: "916",
        name: "Quận Ninh Kiều",
        wards: [
          "Phường An Bình",
          "Phường An Cư",
          "Phường An Hòa",
          "Phường An Khánh",
          "Phường An Nghiệp",
          "Phường An Phú",
          "Phường Cái Khế",
          "Phường Hưng Lợi",
          "Phường Tân An",
          "Phường Thới Bình",
          "Phường Xuân Khánh",
        ],
      },
      {
        code: "918",
        name: "Quận Cái Răng",
        wards: [
          "Phường Ba Láng",
          "Phường Hưng Phú",
          "Phường Hưng Thạnh",
          "Phường Lê Bình",
          "Phường Phú Thứ",
          "Phường Tân Phú",
          "Phường Thường Thạnh",
        ],
      },
    ],
  },
  {
    code: "74",
    name: "Bình Dương",
    districts: [
      {
        code: "718",
        name: "TP. Thủ Dầu Một",
        wards: [
          "Phường Chánh Mỹ",
          "Phường Chánh Nghĩa",
          "Phường Định Hòa",
          "Phường Hiệp An",
          "Phường Hiệp Thành",
          "Phường Hòa Phú",
          "Phường Phú Cường",
          "Phường Phú Hòa",
          "Phường Phú Lợi",
          "Phường Phú Mỹ",
          "Phường Phú Tân",
          "Phường Phú Thọ",
          "Phường Tân An",
          "Phường Tương Bình Hiệp",
        ],
      },
      {
        code: "724",
        name: "TP. Dĩ An",
        wards: [
          "Phường An Bình",
          "Phường Bình An",
          "Phường Bình Thắng",
          "Phường Dĩ An",
          "Phường Đông Hòa",
          "Phường Tân Bình",
          "Phường Tân Đông Hiệp",
        ],
      },
    ],
  },
  {
    code: "75",
    name: "Đồng Nai",
    districts: [
      {
        code: "731",
        name: "TP. Biên Hòa",
        wards: [
          "Phường An Bình",
          "Phường Bình Đa",
          "Phường Bửu Hòa",
          "Phường Bửu Long",
          "Phường Hố Nai",
          "Phường Long Bình",
          "Phường Long Bình Tân",
          "Phường Quang Vinh",
          "Phường Quyết Thắng",
          "Phường Tam Hiệp",
          "Phường Tam Hòa",
          "Phường Tân Biên",
          "Phường Tân Hiệp",
          "Phường Tân Hòa",
          "Phường Tân Mai",
          "Phường Tân Phong",
          "Phường Tân Tiến",
          "Phường Tân Vạn",
          "Phường Thanh Bình",
          "Phường Thống Nhất",
          "Phường Trảng Dài",
          "Phường Trung Dũng",
        ],
      },
    ],
  },
];

const UI = {
  card: "bg-white border border-stone-200/80 rounded-2xl shadow-2xs",
  label: "block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5",
  input:
    "w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition",
  select:
    "w-full bg-white border border-stone-200/80 focus:border-[#9A5B13] disabled:bg-stone-100 disabled:text-stone-400 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 focus:outline-none transition cursor-pointer",
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

function normalizeAdminText(text = "") {
  const cleaned = String(text)
    .normalize("NFC")
    .toLowerCase()
    .replace(
      /^(thành phố|tp\.?|tỉnh|quận|q\.?|huyện|h\.?|thị xã|tx\.?|phường|p\.?|xã|x\.?|thị trấn|tt\.?)\s+/i,
      ""
    )
    .replace(/\b0+(\d+)\b/g, "$1")
    .trim();

  if (cleaned === "hcm" || cleaned === "tp hcm" || cleaned === "tphcm") {
    return "hồ chí minh";
  }
  return cleaned;
}

function parseAddressParts(rawAddress = "") {
  const raw = String(rawAddress || "").normalize("NFC").trim();
  if (!raw) {
    return { provinceCode: "", districtCode: "", wardName: "", street: "" };
  }

  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const lastPart = parts[parts.length - 1] || "";
  const matchedProvince = VIETNAM_ADDRESSES.find(
    (p) => normalizeAdminText(p.name) === normalizeAdminText(lastPart)
  );

  if (!matchedProvince) {
    return { provinceCode: "", districtCode: "", wardName: "", street: raw };
  }

  if (parts.length === 1) {
    return {
      provinceCode: matchedProvince.code,
      districtCode: "",
      wardName: "",
      street: "",
    };
  }

  const distPart = parts[parts.length - 2] || "";
  const matchedDistrict = matchedProvince.districts.find(
    (d) => normalizeAdminText(d.name) === normalizeAdminText(distPart)
  );

  if (!matchedDistrict) {
    return {
      provinceCode: matchedProvince.code,
      districtCode: "",
      wardName: "",
      street: parts.slice(0, parts.length - 1).join(", "),
    };
  }

  if (parts.length === 2) {
    return {
      provinceCode: matchedProvince.code,
      districtCode: matchedDistrict.code,
      wardName: "",
      street: "",
    };
  }

  const wardPart = parts[parts.length - 3] || "";
  const matchedWard = matchedDistrict.wards.find(
    (w) => normalizeAdminText(w) === normalizeAdminText(wardPart)
  );

  if (!matchedWard) {
    return {
      provinceCode: matchedProvince.code,
      districtCode: matchedDistrict.code,
      wardName: "",
      street: parts.slice(0, parts.length - 2).join(", "),
    };
  }

  return {
    provinceCode: matchedProvince.code,
    districtCode: matchedDistrict.code,
    wardName: matchedWard,
    street: parts.slice(0, parts.length - 3).join(", "),
  };
}

function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return path.startsWith("/") ? path : `/${path}`;
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
    order.products ||
    [];
  return Array.isArray(list) ? list : [];
}

export default function Account({ user: propUser = null, orders: propOrders = [] }) {
  const initialUser = useMemo(
    () => normalizeUser(propUser || getStoredUser()),
    [propUser]
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

  // State đơn hàng của user
  const [orders, setOrders] = useState(Array.isArray(propOrders) ? propOrders : []);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [provinceCode, setProvinceCode] = useState(initialAddr.provinceCode);
  const [districtCode, setDistrictCode] = useState(initialAddr.districtCode);
  const [wardName, setWardName] = useState(initialAddr.wardName);
  const [streetAddress, setStreetAddress] = useState(initialAddr.street);
  const [debouncedMapQuery, setDebouncedMapQuery] = useState(
    initialUser.address || "TP. Hồ Chí Minh, Việt Nam"
  );

  const [loading, setLoading] = useState(!propUser && !getStoredUser());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const fileInputRef = useRef(null);

  const syncUserState = useCallback((rawUser) => {
    const normalized = normalizeUser(rawUser);
    const parsedAddr = parseAddressParts(normalized.address);

    setUser(normalized);
    setProfileForm({
      username: normalized.username,
      phone: normalized.phone,
    });
    setProvinceCode(parsedAddr.provinceCode);
    setDistrictCode(parsedAddr.districtCode);
    setWardName(parsedAddr.wardName);
    setStreetAddress(parsedAddr.street);

    localStorage.setItem("user", JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("user-updated", { detail: normalized }));
  }, []);

  const fetchUserOrders = useCallback(async (signal) => {
    const token = localStorage.getItem("token");
    if (!token) return;

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
  }, []);

  useEffect(() => {
    if (!propUser) return;
    syncUserState(propUser);
    setLoading(false);
  }, [propUser, syncUserState]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      if (!propUser) setShowLoginModal(true);
      return;
    }

    const controller = new AbortController();

    if (!propUser) {
      axios
        .get("/api/profile", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          signal: controller.signal,
        })
        .then((res) => {
          const rawUser = res.data?.user || res.data?.data || res.data;
          syncUserState(rawUser);
          if (Array.isArray(res.data?.orders) && res.data.orders.length > 0) {
            setOrders(res.data.orders);
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

    if (!Array.isArray(propOrders) || propOrders.length === 0) {
      fetchUserOrders(controller.signal);
    }

    return () => controller.abort();
  }, [propUser, propOrders, syncUserState, fetchUserOrders]);

  const handleToggleOrderDetail = async (order) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(order.id);
    if (extractOrderItems(order).length > 0) return;

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
        setOrders((prev) =>
          prev.map((item) => (item.id === order.id ? { ...item, ...detail } : item))
        );
      }
    } catch {
      // Giữ nguyên dữ liệu hiện có nếu API chi tiết chưa trả về items
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

  const currentProvince = useMemo(
    () => VIETNAM_ADDRESSES.find((p) => p.code === provinceCode) || null,
    [provinceCode]
  );

  const availableDistricts = useMemo(
    () => currentProvince?.districts || [],
    [currentProvince]
  );

  const currentDistrict = useMemo(
    () => availableDistricts.find((d) => d.code === districtCode) || null,
    [availableDistricts, districtCode]
  );

  const availableWards = useMemo(
    () => currentDistrict?.wards || [],
    [currentDistrict]
  );

  const fullAddress = useMemo(() => {
    return [
      streetAddress.trim(),
      wardName,
      currentDistrict?.name || "",
      currentProvince?.name || "",
    ]
      .filter(Boolean)
      .join(", ");
  }, [streetAddress, wardName, currentDistrict, currentProvince]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMapQuery(fullAddress || "TP. Hồ Chí Minh, Việt Nam");
    }, 450);
    return () => clearTimeout(timer);
  }, [fullAddress]);

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
      syncUserState({ ...user, image_path: nextPath });
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

    setSaving(true);
    setMsg({ type: "", text: "" });

    const payload = {
      username: profileForm.username.trim(),
      name: profileForm.username.trim(),
      phone: profileForm.phone.trim(),
      address: fullAddress,
    };

    try {
      const res = await axios.put("/api/profile", payload, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      syncUserState({ ...user, ...payload });
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
    if (tabId === "orders" && orders.length === 0 && !ordersLoading) {
      fetchUserOrders();
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

  const mapZoom = streetAddress.trim() ? 16 : wardName ? 14 : currentDistrict ? 13 : 12;
  const encodedMapQuery = encodeURIComponent(
    debouncedMapQuery.includes("Việt Nam")
      ? debouncedMapQuery
      : `${debouncedMapQuery}, Việt Nam`
  );
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedMapQuery}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;

  return (
    <div className="bg-[#FAF8F5] min-h-[calc(100vh-200px)]">
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

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
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, username: e.target.value })
                          }
                          placeholder="Nhập họ và tên"
                          className={UI.input}
                        />
                      </div>

                      <div>
                        <label className={UI.label}>Số điện thoại</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          placeholder="Ví dụ: 0988 123 456"
                          className={UI.input}
                        />
                      </div>
                    </div>

                    {/* ĐỊA CHỈ NHẬN HÀNG: Tự động tách và điền sẵn vào 3 dropdown + ô số nhà */}
                    <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-stone-200/80 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A5B13]">
                          Địa chỉ nhận hàng mặc định
                        </h3>
                        {user.address && (
                          <span className="text-[11px] text-stone-500 truncate max-w-full sm:max-w-[65%]">
                            Đã lưu:{" "}
                            <strong className="text-stone-700">{user.address}</strong>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className={UI.label}>Tỉnh / Thành phố</label>
                          <select
                            value={provinceCode}
                            onChange={(e) => {
                              setProvinceCode(e.target.value);
                              setDistrictCode("");
                              setWardName("");
                            }}
                            className={UI.select}
                          >
                            <option value="">-- Chọn Tỉnh / Thành --</option>
                            {VIETNAM_ADDRESSES.map((p) => (
                              <option key={p.code} value={p.code}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={UI.label}>Quận / Huyện</label>
                          <select
                            value={districtCode}
                            disabled={!provinceCode}
                            onChange={(e) => {
                              setDistrictCode(e.target.value);
                              setWardName("");
                            }}
                            className={UI.select}
                          >
                            <option value="">-- Chọn Quận / Huyện --</option>
                            {availableDistricts.map((d) => (
                              <option key={d.code} value={d.code}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={UI.label}>Phường / Xã</label>
                          <select
                            value={wardName}
                            disabled={!districtCode}
                            onChange={(e) => setWardName(e.target.value)}
                            className={UI.select}
                          >
                            <option value="">-- Chọn Phường / Xã --</option>
                            {availableWards.map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={UI.label}>
                          Số nhà, tên đường (Địa chỉ cụ thể)
                        </label>
                        <input
                          type="text"
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="Ví dụ: 123 Nguyễn Văn Cừ"
                          className="w-full bg-white border border-stone-200/80 focus:border-[#9A5B13] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
                        />
                      </div>

                      {/* Bản đồ Google Maps xem trước */}
                      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden">
                        <div className="px-3.5 py-2.5 border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-[#9A5B13] shrink-0" />
                            <span className="text-[11px] text-stone-600 truncate">
                              Vị trí trên bản đồ:{" "}
                              <strong className="text-stone-900">
                                {fullAddress || "Chưa chọn địa chỉ"}
                              </strong>
                            </span>
                          </div>

                          <a
                            href={externalMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-[#9A5B13] hover:underline shrink-0"
                          >
                            Mở Google Maps
                          </a>
                        </div>

                        <div className="w-full h-56 sm:h-64 bg-stone-200/60">
                          <iframe
                            title="Bản đồ địa chỉ nhận hàng"
                            src={mapEmbedUrl}
                            className="w-full h-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      </div>
                    </div>

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
                      <input
                        type="password"
                        required
                        value={passwordForm.old_password}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, old_password: e.target.value })
                        }
                        placeholder="Nhập mật khẩu hiện tại"
                        className={UI.input}
                      />
                    </div>

                    <div>
                      <label className={UI.label}>
                        Mật khẩu mới (tối thiểu 8 ký tự){" "}
                        <span className="text-[#9A5B13]">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={passwordForm.new_password}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, new_password: e.target.value })
                        }
                        placeholder="Nhập mật khẩu mới"
                        className={UI.input}
                      />
                    </div>

                    <div>
                      <label className={UI.label}>
                        Xác nhận mật khẩu mới <span className="text-[#9A5B13]">*</span>
                      </label>
                      <input
                        type="password"
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
                        className={UI.input}
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
                        Theo dõi lịch sử đặt mua và trạng thái giao nhận ấn phẩm
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchUserOrders()}
                      disabled={ordersLoading}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 transition cursor-pointer disabled:opacity-50"
                    >
                      {ordersLoading ? "Đang tải..." : "Làm mới"}
                    </button>
                  </div>

                  {/* Thanh lọc trạng thái đơn hàng */}
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
                            {/* Hàng tiêu đề đơn hàng */}
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

                            {/* Xem trước danh sách sản phẩm trong đơn */}
                            {orderItems.length > 0 && (
                              <div className="space-y-2.5">
                                {(isExpanded
                                  ? orderItems
                                  : orderItems.slice(0, 2)
                                ).map((item, idx) => {
                                  const product = item.product || item;
                                  const itemName = (
                                    item.product_name ||
                                    product.name ||
                                    product.title ||
                                    "Ấn phẩm sách"
                                  ).normalize("NFC");
                                  const itemImg = resolveAssetUrl(
                                    item.image ||
                                      product.image ||
                                      product.image_path
                                  );
                                  const qty = Number(
                                    item.quantity || item.pivot?.quantity || 1
                                  );
                                  const unitPrice = Number(
                                    item.price ||
                                      item.pivot?.price ||
                                      product.price ||
                                      0
                                  );

                                  return (
                                    <div
                                      key={item.id || `${order.id}-${idx}`}
                                      className="flex items-center justify-between gap-3 bg-white border border-stone-200/70 rounded-xl p-2.5"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        {itemImg ? (
                                          <img
                                            src={itemImg}
                                            alt={itemName}
                                            className="w-10 h-14 object-contain rounded bg-stone-100 p-0.5 shrink-0"
                                          />
                                        ) : (
                                          <div className="w-10 h-14 rounded bg-stone-100 text-stone-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                            SÁCH
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <div className="font-serif text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                                            {itemName}
                                          </div>
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

                                      <div className="text-xs sm:text-sm font-bold text-stone-900 shrink-0">
                                        {(unitPrice * qty).toLocaleString("vi-VN")}{" "}
                                        ₫
                                      </div>
                                    </div>
                                  );
                                })}

                                {!isExpanded && orderItems.length > 2 && (
                                  <div className="text-[11px] text-stone-500 italic">
                                    Và {orderItems.length - 2} ấn phẩm khác...
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Chi tiết giao nhận khi bấm Xem chi tiết */}
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

                            {/* Nút hành động */}
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