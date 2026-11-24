import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import UserManagement from "./UserManagement";
import CategoryManagement from "./CategoryManagement";
import OrderManagement from "./OrderManagement";
import ProductManagement from "./ProductManagement";
import VoucherManagement from "./VoucherManagement";
import BannerManagement from "./BannerManagement";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";

const NAV_GROUPS = [
  {
    groupLabel: "Tổng quan & Vận hành",
    items: [
      {
        key: "dashboard",
        path: "/admin",
        label: "Tổng quan",
        subtitle: "Thống kê doanh thu, đơn hàng và đánh giá sản phẩm",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-5 h-5">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        key: "orders",
        path: "/admin/orders",
        label: "Quản lý đơn hàng",
        subtitle: "Xác nhận đơn, chuẩn bị hàng và bàn giao vận chuyển",
        showPendingBadge: true,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-5 h-5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    groupLabel: "Sản phẩm & Khuyến mãi",
    items: [
      {
        key: "products",
        path: "/admin/products",
        label: "Quản lý sản phẩm",
        subtitle: "Quản lý đầu sách, tác giả, tồn kho và mức giảm giá",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-5 h-5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        key: "categories",
        path: "/admin/categories",
        label: "Quản lý danh mục",
        subtitle: "Phân loại thể loại sách và thứ tự hiển thị",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-5 h-5">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        key: "vouchers",
        path: "/admin/vouchers",
        label: "Quản lý voucher",
        subtitle: "Tạo mã giảm giá, điều kiện đơn tối thiểu và lượt sử dụng",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-5 h-5">
            <path
              d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9Z"
              strokeLinejoin="round"
            />
            <path d="M9 7v10M13.5 14.5l3-5" strokeLinecap="round" />
            <circle cx="13.5" cy="10" r="0.7" fill="currentColor" />
            <circle cx="16.5" cy="14" r="0.7" fill="currentColor" />
          </svg>
        ),
      },
      {
        key: "banners",
        path: "/admin/banners",
        label: "Quản lý banner",
        subtitle: "Quản lý slide quảng bá và trích dẫn nổi bật trang chủ",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-5 h-5">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path d="m21 15-5-5L5 20" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    groupLabel: "Tài khoản & Hệ thống",
    items: [
      {
        key: "users",
        path: "/admin/users",
        label: "Quản lý người dùng",
        subtitle: "Quản lý độc giả, phân quyền và cấp bậc thành viên",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-5 h-5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
];

const ALL_TABS = NAV_GROUPS.flatMap((group) => group.items);

function resolveTabFromLocation() {
  const cleanPath = window.location.pathname.replace(/\/+$/, "") || "/admin";
  const matchedByPath = ALL_TABS.find((t) => t.path === cleanPath);
  if (matchedByPath) return matchedByPath.key;

  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get("tab");
  if (tabParam && ALL_TABS.some((t) => t.key === tabParam)) {
    return tabParam;
  }
  return "dashboard";
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState(resolveTabFromLocation);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const activeMeta =
    ALL_TABS.find((item) => item.key === activeTab) || ALL_TABS[0];

  const fetchPendingOrdersCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("/api/admin/orders/pending-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (typeof res.data?.pending_count === "number") {
        setPendingOrdersCount(res.data.pending_count);
      }
    } catch {
      // Bỏ qua nếu API chưa phản hồi
    }
  };

  useEffect(() => {
    fetchPendingOrdersCount();
    const interval = setInterval(fetchPendingOrdersCount, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(resolveTabFromLocation());
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSelectTab = (item) => {
    setActiveTab(item.key);
    setMobileSidebarOpen(false);
    window.history.pushState({}, "", item.path);
  };

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          "/api/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch {
      // Tiếp tục xóa phiên cục bộ
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLogoutLoading(false);
      setLogoutModalOpen(false);
      window.location.href = "/";
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UserManagement />;
      case "categories":
        return <CategoryManagement />;
      case "orders":
        return <OrderManagement />;
      case "products":
        return <ProductManagement />;
      case "vouchers":
        return <VoucherManagement />;
      case "banners":
        return <BannerManagement />;
      default:
        return <Dashboard />;
    }
  };

  const SidebarContent = ({ isMobile = false }) => {
    const isCompact = !isMobile && sidebarCollapsed;

    return (
      <div className="flex flex-col h-full bg-white text-stone-700 border-r border-stone-200 select-none">
        {/* Header Sidebar: Thương hiệu MỌT SÁCH BOOKHOUSE */}
        <div
          className={`min-h-[72px] px-4 py-3.5 border-b border-stone-200 flex items-center ${
            isCompact ? "justify-center" : "justify-between"
          }`}
        >
          {!isCompact && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#9A5B13] text-white font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                B
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9A5B13] truncate">
                  MỌT SÁCH BOOKHOUSE
                </div>
                <div className="font-serif text-base font-bold text-[#1A1A1A] leading-tight truncate">
                  Trang quản trị Admin
                </div>
              </div>
            </div>
          )}

          {isMobile ? (
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Đóng thanh bên"
              className="p-2 rounded-xl text-stone-500 hover:text-[#1A1A1A] hover:bg-stone-100 transition cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              title={isCompact ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
              className="p-2 rounded-xl text-stone-500 hover:text-[#1A1A1A] hover:bg-stone-100 transition cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`w-4 h-4 transition-transform duration-200 ${
                  isCompact ? "rotate-180" : ""
                }`}
              >
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Danh sách các mục quản lý */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupLabel} className="space-y-1">
              {!isCompact && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  {group.groupLabel}
                </div>
              )}

              {group.items.map((item) => {
                const isActive = activeTab === item.key;
                const badgeCount = item.showPendingBadge ? pendingOrdersCount : 0;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectTab(item)}
                    title={isCompact ? item.label : undefined}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer ${
                      isCompact ? "justify-center" : "justify-between"
                    } ${
                      isActive
                        ? "bg-[#9A5B13] text-white font-semibold shadow-xs"
                        : "text-stone-600 hover:bg-[#FAF8F5] hover:text-[#1A1A1A]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`shrink-0 transition ${
                          isActive
                            ? "text-white"
                            : "text-stone-400 group-hover:text-[#9A5B13]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {!isCompact && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {badgeCount > 0 && !isCompact && (
                      <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                        {badgeCount}
                      </span>
                    )}

                    {badgeCount > 0 && isCompact && (
                      <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Sidebar: Hồ sơ Admin + Về trang chủ + Đăng xuất */}
        <div className="p-3 border-t border-stone-200 space-y-2">
          {!isCompact && (
            <div className="px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] font-bold text-xs flex items-center justify-center shrink-0">
                {(currentUser?.username || currentUser?.name || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#1A1A1A] truncate">
                  {currentUser?.username || currentUser?.name || "Quản trị viên"}
                </div>
                <div className="text-[11px] text-stone-500 truncate">
                  {currentUser?.email || "admin@bookhouse.vn"}
                </div>
              </div>
            </div>
          )}

          <a
            href="/"
            title="Về trang chủ"
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#141414] text-white hover:bg-stone-800 transition ${
              isCompact ? "justify-center" : ""
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-4 h-4 shrink-0">
              <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
            </svg>
            {!isCompact && <span>Về trang chủ</span>}
          </a>

          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            title="Đăng xuất"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer ${
              isCompact ? "justify-center" : ""
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-4 h-4 shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!isCompact && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex">
      {/* SIDEBAR BÊN TRÁI (DESKTOP) */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-screen transition-all duration-200 z-30 ${
          sidebarCollapsed ? "w-20" : "w-68"
        }`}
      >
        <SidebarContent isMobile={false} />
      </aside>

      {/* SIDEBAR NGĂN KÉO BÊN TRÁI (MOBILE / TABLET) */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/45 backdrop-blur-2xs flex"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent isMobile={true} />
          </div>
        </div>
      )}

      {/* KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Thanh tiêu đề trang hiện tại */}
        <header className="sticky top-0 z-20 min-h-[72px] bg-white/95 backdrop-blur-xs border-b border-stone-200 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Mở menu quản trị"
              className="lg:hidden p-2 rounded-xl border border-stone-200 bg-[#FAF8F5] text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400">
                <span>Mọt Sách BookHouse</span>
                <span>/</span>
                <span className="text-[#9A5B13]">{activeMeta.label}</span>
              </div>
              <h1 className="font-serif text-base sm:text-lg font-bold text-[#1A1A1A] truncate">
                {activeMeta.label}
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
            <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-stone-200 font-medium text-stone-600">
              {activeMeta.subtitle}
            </span>
          </div>
        </header>

        {/* Nội dung từng trang quản lý */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Modal xác nhận đăng xuất */}
      <AdminConfirmModal
        open={logoutModalOpen}
        variant="warning"
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị Mọt Sách BookHouse?"
        confirmText="Đăng xuất"
        cancelText="Ở lại"
        loading={logoutLoading}
        onConfirm={handleConfirmLogout}
        onCancel={() => !logoutLoading && setLogoutModalOpen(false)}
      />
    </div>
  );
}