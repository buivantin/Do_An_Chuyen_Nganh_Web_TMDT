import React, { useEffect, useRef } from "react";
import PasswordInput from "./PasswordInput";
import VietnamAddressSelector from "./VietnamAddressSelector";

const UI = {
  card: "bg-white border border-stone-200/80 rounded-2xl shadow-2xs",
  label:
    "block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5",
  input:
    "w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition",
  btnPrimary:
    "w-full sm:w-auto px-6 py-3 bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs",
};

export const ACCOUNT_TABS = [
  {
    id: "profile",
    mobileLabel: "Hồ sơ",
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
    mobileLabel: "Mật khẩu",
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
    mobileLabel: "Đơn hàng",
    label: "Đơn hàng của tôi",
    icon: (
      <>
        <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </>
    ),
  },
];

export const ORDER_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "processing", label: "Đang xử lý" },
  { id: "shipping", label: "Đang giao" },
  { id: "completed", label: "Hoàn thành" },
  { id: "return_requested", label: "Yêu cầu hoàn đơn" },
  { id: "returned", label: "Đã hoàn đơn" },
  { id: "cancelled", label: "Đã hủy" },
];

export const RATING_LABELS = {
  1: "Rất không hài lòng",
  2: "Chưa hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Tuyệt vời",
};

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

function ProductThumbnail({ src, altUrl, alt, className = "w-11 h-15" }) {
  return (
    <div className={`${className} relative shrink-0`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.retried && altUrl && altUrl !== img.src) {
              img.dataset.retried = "1";
              img.src = altUrl;
              return;
            }
            img.style.display = "none";
            if (img.nextElementSibling) {
              img.nextElementSibling.style.display = "flex";
            }
          }}
          className="w-full h-full object-contain rounded-lg bg-stone-100 p-0.5 border border-stone-200/70"
        />
      ) : null}

      <div
        style={{ display: src ? "none" : "flex" }}
        className="w-full h-full rounded-lg bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] flex-col items-center justify-center text-[9px] font-bold uppercase tracking-wider select-none"
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
    </div>
  );
}

function SavedAddressMapPreview({ address }) {
  const query = (address || "").trim() || "Hồ Chí Minh, Việt Nam";
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-stone-500">
        <span className="font-semibold text-stone-600">
          Vị trí giao hàng trên bản đồ
        </span>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            query
          )}`}
          target="_blank"
          rel="noreferrer"
          className="text-[#9A5B13] font-semibold hover:underline"
        >
          Mở bản đồ lớn &nearr;
        </a>
      </div>

      <div className="w-full h-48 sm:h-60 rounded-xl overflow-hidden border border-stone-200/80 bg-stone-100">
        <iframe
          title="Bản đồ địa chỉ nhận hàng mặc định"
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}

/**
 * DUMB COMPONENT: Toàn bộ giao diện trang Tài khoản (Responsive riêng Mobile & PC)
 */
export default function AccountView({
  user = {},
  memberTier = {
    name: "Mầm Sách",
    icon: "🌱",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
    hint: "",
    progressPercent: 15,
  },
  avatarSrc = null,
  avatarInitial = "U",
  activeTab = "profile",
  loading = false,
  saving = false,
  msg = { type: "", text: "" },

  // Hồ sơ & Địa chỉ
  profileForm = { username: "", phone: "" },
  isEditingAddress = false,
  provinceCode = "79",
  districtCode = "",
  wardName = "",
  streetAddress = "",
  onTriggerAvatarPicker,
  onSwitchTab,
  onProfileFieldChange,
  onStartEditAddress,
  onCancelEditAddress,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onStreetChange,
  onDatasetLoaded,
  onRequestSaveProfile,

  // Đổi mật khẩu
  passwordForm = {
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  },
  onPasswordFieldChange,
  onRequestChangePassword,

  // Đơn hàng
  orders = [],
  filteredOrders = [],
  orderCounts = {},
  ordersLoading = false,
  ordersError = "",
  orderStatusFilter = "all",
  expandedOrderId = null,
  detailLoadingId = null,
  cancellingOrderId = null,
  reorderingOrderId = null,
  onRefreshOrders,
  onFilterOrdersChange,
  onToggleOrderDetail,
  onRequestCancelOrder,
  onReorderOrder,
  onOpenReturnModal,
  onOpenContactModal,

  // Đánh giá
  reviewTarget = null,
  reviewRating = 5,
  hoverRating = 0,
  reviewComment = "",
  reviewSubmitting = false,
  reviewError = "",
  onOpenReviewModal,
  onCloseReviewModal,
  onReviewRatingChange,
  onHoverRatingChange,
  onReviewCommentChange,
  onSubmitReview,
}) {
  const addressEditorRef = useRef(null);

  // Chỉ ô Địa chỉ cụ thể cho phép nhập tay; các ô chọn Tỉnh/Quận/Phường chỉ dùng dropdown
  useEffect(() => {
    if (!isEditingAddress || !addressEditorRef.current) return;
    const inputs = addressEditorRef.current.querySelectorAll("input");
    inputs.forEach((inp, index) => {
      const isLastTextInput = index === inputs.length - 1;
      if (!isLastTextInput && inp.type !== "checkbox" && inp.type !== "radio") {
        inp.setAttribute("readonly", "true");
      }
    });
  }, [isEditingAddress, provinceCode, districtCode, wardName]);

  const displayRating = hoverRating || reviewRating;

  return (
    <div className="bg-[#FAF8F5] min-h-[calc(100vh-200px)]">
      {/* MODAL ĐÁNH GIÁ SẢN PHẨM */}
      {reviewTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => !reviewSubmitting && onCloseReviewModal?.()}
        >
          <div
            className="bg-white border border-stone-200 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-xl"
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
                onClick={onCloseReviewModal}
                className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition cursor-pointer"
                aria-label="Đóng"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center gap-3 bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-3">
              <ProductThumbnail
                src={reviewTarget.productImage}
                altUrl={reviewTarget.productAltImage}
                alt={reviewTarget.productName}
                className="w-11 h-15"
              />
              <div className="min-w-0">
                <div className="text-[11px] text-stone-500">
                  Sản phẩm đã mua
                </div>
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

            <form onSubmit={onSubmitReview} className="space-y-4">
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
                        onMouseEnter={() => onHoverRatingChange?.(star)}
                        onMouseLeave={() => onHoverRatingChange?.(0)}
                        onClick={() => onReviewRatingChange?.(star)}
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
                  onChange={(e) => onReviewCommentChange?.(e.target.value)}
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
                  onClick={onCloseReviewModal}
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <a href="/" className="hover:text-[#9A5B13] transition">
            Trang chủ
          </a>
          <span>&rsaquo;</span>
          <span className="text-[#9A5B13]">Tài khoản độc giả</span>
        </nav>

        {/* Tiêu đề trang (PC) */}
        <div className="hidden lg:block border-b border-stone-200/80 pb-5">
          <h1 className="font-serif text-4xl font-bold text-[#1A1A1A] tracking-tight">
            Tài Khoản Của Tôi
          </h1>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-stone-500">
            Đang tải thông tin tài khoản...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* HEADER GỌN + THANH TAB RIÊNG CHO MOBILE (< lg) */}
            <div className="lg:hidden space-y-3">
              <div className={`p-4 flex items-center gap-3.5 ${UI.card}`}>
                <button
                  type="button"
                  onClick={onTriggerAvatarPicker}
                  title="Nhấn để đổi ảnh đại diện"
                  className="relative shrink-0 rounded-full focus:outline-none cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E5D5BE] bg-[#FAF8F5]">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={user.username || "Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#141414] text-white flex items-center justify-center font-serif text-2xl font-bold">
                        {avatarInitial}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#141414] text-white flex items-center justify-center border-2 border-white shadow-2xs">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3 h-3"
                    >
                      <path d="M12 20h9" strokeLinecap="round" />
                      <path
                        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${memberTier.badgeClass}`}
                    >
                      <span>{memberTier.icon}</span>
                      <span>{memberTier.name}</span>
                    </span>
                  </div>

                  <h1 className="font-serif text-lg font-bold text-[#1A1A1A] truncate">
                    {user.username || "Thành viên BookHouse"}
                  </h1>
                  <p className="text-xs text-stone-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Thanh chuyển Tab ngang cho Mobile */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-1.5 grid grid-cols-3 gap-1 shadow-2xs">
                {ACCOUNT_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => onSwitchTab?.(tab.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-[#141414] text-white shadow-2xs"
                          : "text-stone-600 hover:bg-stone-100/80"
                      }`}
                    >
                      <span className="truncate">{tab.mobileLabel}</span>
                      {tab.id === "orders" && orders.length > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive
                              ? "bg-[#9A5B13] text-white"
                              : "bg-[#F5EDE2] text-[#9A5B13]"
                          }`}
                        >
                          {orders.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIDEBAR TRÁI RIÊNG CHO PC (lg+) */}
            <aside
              className={`hidden lg:block lg:col-span-4 xl:col-span-3 p-6 lg:sticky lg:top-28 space-y-5 ${UI.card}`}
            >
              <div className="flex flex-col items-center text-center border-b border-stone-100 pb-5">
                <button
                  type="button"
                  onClick={onTriggerAvatarPicker}
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

                {/* Hạng thành viên */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-2 ${memberTier.badgeClass}`}
                >
                  <span>{memberTier.icon}</span>
                  <span>{memberTier.name}</span>
                </span>

                <h2 className="font-serif text-lg font-bold text-[#1A1A1A] line-clamp-1 max-w-full">
                  {user.username || "Thành viên BookHouse"}
                </h2>
                <p className="text-xs text-stone-500 truncate max-w-full mt-0.5">
                  {user.email}
                </p>

                {memberTier.hint && (
                  <div className="w-full mt-3.5 pt-3 border-t border-stone-100 text-left space-y-1.5">
                    <div className="flex justify-between text-[10px] font-semibold text-stone-500">
                      <span>Hạng: {memberTier.name}</span>
                      <span>{memberTier.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#9A5B13] rounded-full transition-all"
                        style={{ width: `${memberTier.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 leading-snug">
                      {memberTier.hint}
                    </p>
                  </div>
                )}
              </div>

              <nav className="space-y-1.5">
                {ACCOUNT_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => onSwitchTab?.(tab.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
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
                  className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm ${
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
                <div className="space-y-5 sm:space-y-6">
                  <div className="border-b border-stone-100 pb-3.5 sm:pb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                      Hồ Sơ Cá Nhân
                    </h2>
                    <span
                      className={`lg:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${memberTier.badgeClass}`}
                    >
                      <span>{memberTier.icon}</span>
                      <span>Hạng {memberTier.name}</span>
                    </span>
                  </div>

                  <form
                    onSubmit={onRequestSaveProfile}
                    className="max-w-3xl space-y-5"
                  >
                    <div>
                      <label className={UI.label}>
                        Email đăng nhập (Không thể thay đổi)
                      </label>
                      <input
                        type="email"
                        value={user.email || ""}
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
                            onProfileFieldChange?.("username", e.target.value)
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
                            onProfileFieldChange?.("phone", e.target.value)
                          }
                          placeholder="Ví dụ: 0988 123 456"
                          className={UI.input}
                        />
                      </div>
                    </div>

                    {/* KHỐI ĐỊA CHỈ NHẬN HÀNG MẶC ĐỊNH */}
                    <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A5B13]">
                            Địa chỉ nhận hàng mặc định
                          </h3>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {isEditingAddress
                              ? "Chọn Tỉnh/Quận/Phường qua danh sách và nhập tay số nhà, tên đường"
                              : "Địa chỉ ưu tiên khi đặt ấn phẩm tại BookHouse"}
                          </p>
                        </div>

                        {!isEditingAddress ? (
                          <button
                            type="button"
                            onClick={onStartEditAddress}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F5EDE2] border border-[#E5D5BE] text-xs font-bold text-[#9A5B13] transition cursor-pointer shadow-2xs"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="w-3.5 h-3.5"
                            >
                              <path d="M12 20h9" strokeLinecap="round" />
                              <path
                                d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Thay đổi</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={onCancelEditAddress}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-600 transition cursor-pointer"
                          >
                            Hủy thay đổi
                          </button>
                        )}
                      </div>

                      {!isEditingAddress ? (
                        <div className="space-y-4">
                          <div className="bg-white border border-stone-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
                            <span className="text-[#9A5B13] mt-0.5 shrink-0">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="w-4 h-4"
                              >
                                <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" />
                                <circle cx="12" cy="11" r="2.2" />
                              </svg>
                            </span>
                            <div className="text-xs sm:text-sm font-medium text-stone-900 leading-relaxed">
                              {user.address || (
                                <span className="text-stone-400 italic">
                                  Chưa thiết lập địa chỉ nhận hàng mặc định. Nhấn{" "}
                                  <strong className="text-[#9A5B13]">
                                    Thay đổi
                                  </strong>{" "}
                                  để cập nhật.
                                </span>
                              )}
                            </div>
                          </div>

                          <SavedAddressMapPreview address={user.address} />
                        </div>
                      ) : (
                        <div ref={addressEditorRef} className="pt-1">
                          <VietnamAddressSelector
                            provinceCode={provinceCode}
                            onProvinceChange={onProvinceChange}
                            districtCode={districtCode}
                            onDistrictChange={onDistrictChange}
                            wardName={wardName}
                            onWardChange={onWardChange}
                            streetAddress={streetAddress}
                            onStreetChange={onStreetChange}
                            onDatasetLoaded={onDatasetLoaded}
                            streetRequired
                            mapLabel="Vị trí giao hàng:"
                            mapHeightClass="h-52 sm:h-64"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className={UI.btnPrimary}
                      >
                        {saving ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU */}
              {activeTab === "password" && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="border-b border-stone-100 pb-3.5 sm:pb-4">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                      Đổi Mật Khẩu
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Cập nhật mật khẩu định kỳ để bảo vệ tài khoản độc giả
                    </p>
                  </div>

                  <form
                    onSubmit={onRequestChangePassword}
                    className="max-w-xl space-y-4"
                  >
                    <div>
                      <label className={UI.label}>
                        Mật khẩu hiện tại{" "}
                        <span className="text-[#9A5B13]">*</span>
                      </label>
                      <PasswordInput
                        required
                        value={passwordForm.old_password}
                        onChange={(e) =>
                          onPasswordFieldChange?.(
                            "old_password",
                            e.target.value
                          )
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
                          onPasswordFieldChange?.(
                            "new_password",
                            e.target.value
                          )
                        }
                        placeholder="Nhập mật khẩu mới"
                        autoComplete="new-password"
                      />
                    </div>

                    <div>
                      <label className={UI.label}>
                        Xác nhận mật khẩu mới{" "}
                        <span className="text-[#9A5B13]">*</span>
                      </label>
                      <PasswordInput
                        required
                        minLength={8}
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) =>
                          onPasswordFieldChange?.(
                            "new_password_confirmation",
                            e.target.value
                          )
                        }
                        placeholder="Nhập lại mật khẩu mới"
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className={UI.btnPrimary}
                      >
                        {saving ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: ĐƠN HÀNG CỦA TÔI */}
              {activeTab === "orders" && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="border-b border-stone-100 pb-3.5 sm:pb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                        Đơn Hàng Của Tôi
                      </h2>
                      <p className="text-xs text-stone-500 mt-1">
                        Theo dõi lịch sử đặt mua, trạng thái giao nhận, hoàn
                        đơn/đổi trả và đánh giá ấn phẩm
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onRefreshOrders}
                      disabled={ordersLoading}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 transition cursor-pointer disabled:opacity-50"
                    >
                      {ordersLoading ? "Đang tải..." : "Làm mới"}
                    </button>
                  </div>

                  {/* Ô lọc trạng thái kèm số lượng đơn hàng thực tế */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {ORDER_FILTERS.map((filter) => {
                      const isSelected = orderStatusFilter === filter.id;
                      const count =
                        orderCounts?.[filter.id] ??
                        (filter.id === "all"
                          ? orders.length
                          : orders.filter((o) => o.statusKey === filter.id)
                              .length);

                      return (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => onFilterOrdersChange?.(filter.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer shrink-0 ${
                            isSelected
                              ? "bg-[#141414] text-white border-[#141414]"
                              : "bg-[#FAF8F5] text-stone-600 border-stone-200/80 hover:border-stone-300"
                          }`}
                        >
                          <span>{filter.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                              isSelected
                                ? "bg-[#9A5B13] text-white"
                                : "bg-stone-200/80 text-stone-700"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

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
                        const isExpanded = expandedOrderId === order.id;
                        const isReordering = reorderingOrderId === order.id;
                        const visibleItems =
                          isExpanded || order.isCompleted
                            ? order.items
                            : order.items.slice(0, 2);

                        return (
                          <article
                            key={order.id}
                            className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-3.5 sm:p-5 space-y-3.5"
                          >
                            {/* Header đơn hàng */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-200/70 pb-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs sm:text-sm font-bold text-[#9A5B13]">
                                    Đơn hàng {order.code}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${order.statusBadge}`}
                                  >
                                    {order.statusLabel}
                                  </span>
                                </div>
                                {order.createdAtLabel && (
                                  <div className="text-[11px] sm:text-xs text-stone-500 mt-1">
                                    Ngày đặt: {order.createdAtLabel}
                                    {order.completedAtLabel
                                      ? ` • Hoàn thành: ${order.completedAtLabel}`
                                      : ""}
                                  </div>
                                )}
                              </div>

                              <div className="flex sm:block items-baseline justify-between pt-1 sm:pt-0 border-t sm:border-t-0 border-dashed border-stone-200">
                                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold sm:block">
                                  Tổng thanh toán
                                </span>
                                <span className="text-base sm:text-lg font-bold text-stone-900">
                                  {order.totalAmount.toLocaleString("vi-VN")} ₫
                                </span>
                              </div>
                            </div>

                            {/* Danh sách sách trong đơn */}
                            {order.items.length > 0 ? (
                              <div className="space-y-2.5">
                                {visibleItems.map((item, idx) => (
                                  <div
                                    key={item.key || `${order.id}-${idx}`}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white border border-stone-200/70 rounded-xl p-2.5 sm:p-3"
                                  >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <ProductThumbnail
                                        src={item.imageUrl}
                                        altUrl={item.altImageUrl}
                                        alt={item.name}
                                        className="w-11 h-15"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <a
                                          href={
                                            item.productId
                                              ? `/products/${item.productId}`
                                              : undefined
                                          }
                                          className="font-serif text-xs sm:text-sm font-bold text-stone-900 hover:text-[#9A5B13] transition line-clamp-2 sm:line-clamp-1 block"
                                        >
                                          {item.name}
                                        </a>
                                        <div className="text-[11px] text-stone-500 mt-0.5">
                                          SL:{" "}
                                          <strong className="text-stone-800">
                                            {item.quantity}
                                          </strong>{" "}
                                          &bull;{" "}
                                          {item.unitPrice.toLocaleString(
                                            "vi-VN"
                                          )}{" "}
                                          ₫
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 shrink-0">
                                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                                        {item.lineTotal.toLocaleString("vi-VN")}{" "}
                                        ₫
                                      </div>

                                      {order.isCompleted &&
                                        item.productId &&
                                        (item.existingReview ? (
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5EDE2] border border-[#E5D5BE] text-[11px] font-bold text-[#9A5B13]">
                                            <StarIcon
                                              filled
                                              className="w-3.5 h-3.5 text-amber-500"
                                            />
                                            <span>
                                              Đã đánh giá (
                                              {item.existingReview.rating}★)
                                            </span>
                                          </span>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onOpenReviewModal?.(
                                                order.code,
                                                item.raw,
                                                order.id
                                              )
                                            }
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#E5D5BE] text-xs font-bold text-[#9A5B13] transition cursor-pointer"
                                          >
                                            <StarIcon
                                              filled={false}
                                              className="w-3.5 h-3.5"
                                            />
                                            <span>Đánh giá</span>
                                          </button>
                                        ))}
                                    </div>
                                  </div>
                                ))}

                                {!isExpanded &&
                                  !order.isCompleted &&
                                  order.items.length > 2 && (
                                    <div className="text-[11px] text-stone-500 italic">
                                      Và {order.items.length - 2} ấn phẩm
                                      khác...
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div className="text-xs text-stone-500 italic bg-white/70 border border-stone-200/60 rounded-xl px-3 py-2.5">
                                Nhấn &ldquo;Xem chi tiết&rdquo; để xem danh sách
                                ấn phẩm trong đơn hàng.
                              </div>
                            )}

                            {/* THÔNG BÁO TRẠNG THÁI HOÀN ĐƠN / ĐỔI TRẢ */}
                            {order.isReturnRequested && (
                              <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 space-y-2">
                                <div className="font-bold">
                                  Cửa hàng đã tiếp nhận yêu cầu{" "}
                                  {order.returnType === "exchange"
                                    ? "đổi sản phẩm"
                                    : "hoàn đơn / hoàn tiền"}{" "}
                                  và sẽ liên hệ với bạn!
                                </div>
                                {order.returnRequestedAtLabel && (
                                  <div className="text-[11px] text-orange-700">
                                    Thời gian gửi: {order.returnRequestedAtLabel}
                                  </div>
                                )}
                                <div>
                                  <span className="font-semibold">Lý do:</span>{" "}
                                  {order.returnReason}
                                </div>
                                {order.returnImages?.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {order.returnImages.map((imgUrl, i) => (
                                      <a
                                        key={i}
                                        href={imgUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-14 h-14 rounded-lg overflow-hidden border border-orange-300 bg-white block"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Ảnh chứng minh ${i + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {order.isReturned && (
                              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                                <div className="font-bold">
                                  Yêu cầu hoàn đơn / đổi trả đã được cửa hàng
                                  xác nhận.
                                </div>
                                {order.adminReturnNote && (
                                  <div>
                                    <span className="font-semibold">
                                      Phản hồi từ BookHouse:
                                    </span>{" "}
                                    {order.adminReturnNote}
                                  </div>
                                )}
                              </div>
                            )}

                            {order.isCompleted && order.adminReturnNote && (
                              <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-700">
                                <span className="font-bold text-stone-900">
                                  Phản hồi về yêu cầu hoàn đơn:
                                </span>{" "}
                                {order.adminReturnNote}
                              </div>
                            )}

                            {/* Chi tiết người nhận & địa chỉ */}
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
                                      {order.receiverName}{" "}
                                      {order.receiverPhone
                                        ? `(${order.receiverPhone})`
                                        : ""}
                                    </div>
                                    <div>
                                      <span className="font-semibold text-stone-800">
                                        Địa chỉ giao:
                                      </span>{" "}
                                      {order.shippingAddress}
                                    </div>
                                    {order.trackingCode && (
                                      <div>
                                        <span className="font-semibold text-stone-800">
                                          Vận chuyển:
                                        </span>{" "}
                                        {order.shippingProvider} &mdash; Mã:{" "}
                                        <strong className="font-mono text-stone-900">
                                          {order.trackingCode}
                                        </strong>
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-semibold text-stone-800">
                                        Thanh toán:
                                      </span>{" "}
                                      {order.paymentLabel}
                                    </div>
                                    {order.discountAmount > 0 && (
                                      <div className="text-emerald-700">
                                        <span className="font-semibold">
                                          Ưu đãi voucher:
                                        </span>{" "}
                                        -
                                        {order.discountAmount.toLocaleString(
                                          "vi-VN"
                                        )}{" "}
                                        ₫
                                      </div>
                                    )}
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

                            {/* Nút hành động: Liên hệ / Xem chi tiết / Hủy đơn / Hoàn đơn (3 ngày) / Mua lại */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                              <div className="text-[11px] text-stone-500">
                                {order.canReturn && (
                                  <span className="text-[#9A5B13] font-medium">
                                    Hỗ trợ hoàn đơn/đổi trả:{" "}
                                    {order.returnRemainingText}
                                  </span>
                                )}
                                {order.returnExpired && (
                                  <span>
                                    Đã hết thời hạn 3 ngày hoàn đơn / đổi trả
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => onOpenContactModal?.(order)}
                                  className="px-3.5 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#E5D5BE] text-xs font-semibold text-[#9A5B13] transition cursor-pointer"
                                >
                                  Liên hệ cửa hàng
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onToggleOrderDetail?.(order.raw)}
                                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-800 transition cursor-pointer"
                                >
                                  {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                                </button>

                                {order.canCancel && (
                                  <button
                                    type="button"
                                    disabled={cancellingOrderId === order.id}
                                    onClick={() =>
                                      onRequestCancelOrder?.(order.raw)
                                    }
                                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 transition cursor-pointer disabled:opacity-50"
                                  >
                                    {cancellingOrderId === order.id
                                      ? "Đang hủy..."
                                      : "Hủy đơn"}
                                  </button>
                                )}

                                {order.canReturn && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenReturnModal?.(order)}
                                    className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-300 text-xs font-bold text-orange-800 transition cursor-pointer"
                                  >
                                    Hoàn đơn / Đổi trả
                                  </button>
                                )}

                                {order.canReorder && (
                                  <button
                                    type="button"
                                    disabled={isReordering}
                                    onClick={() => onReorderOrder?.(order)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      className="w-3.5 h-3.5"
                                    >
                                      <path
                                        d="M3 12a9 9 0 1 0 3-6.7L3 8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                      <path
                                        d="M3 3v5h5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                    <span>
                                      {isReordering
                                        ? "Đang chuyển..."
                                        : "Mua lại"}
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
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
                        onClick={() => onFilterOrdersChange?.("all")}
                        className="text-xs font-bold text-[#9A5B13] hover:underline cursor-pointer"
                      >
                        Xem tất cả đơn hàng ({orders.length})
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
                        Khi bạn hoàn tất đặt sách, thông tin và trạng thái vận
                        chuyển đơn hàng sẽ hiển thị tại đây.
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