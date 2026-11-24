export const MEMBER_TIERS = {
  "Mầm Sách": {
    label: "Mầm Sách",
    ringClass: "ring-2 ring-emerald-500 ring-offset-2 ring-offset-white",
    badgeBg: "bg-emerald-600 text-white",
    pillBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: "🌱",
    nextHint: "Đọc & mua thêm để lên hạng Người Đọc",
  },
  "Người Đọc": {
    label: "Người Đọc",
    ringClass: "ring-2 ring-amber-700 ring-offset-2 ring-offset-white",
    badgeBg: "bg-amber-700 text-white",
    pillBg: "bg-amber-50 text-amber-900 border-amber-200",
    icon: "📖",
    nextHint: "Tích lũy thêm đơn hàng để đạt Tri Thức",
  },
  "Tri Thức": {
    label: "Tri Thức",
    ringClass: "ring-2 ring-sky-600 ring-offset-2 ring-offset-white",
    badgeBg: "bg-sky-600 text-white",
    pillBg: "bg-sky-50 text-sky-800 border-sky-200",
    icon: "💠",
    nextHint: "Bạn đang ở nhóm độc giả tích cực",
  },
  "Học Giả": {
    label: "Học Giả",
    ringClass: "ring-2 ring-yellow-500 ring-offset-2 ring-offset-white shadow-sm shadow-yellow-500/30",
    badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950",
    pillBg: "bg-yellow-50 text-yellow-900 border-yellow-300",
    icon: "🏅",
    nextHint: "Ưu đãi đặc quyền dành cho Học Giả",
  },
  "Đại Sứ Tri Thức": {
    label: "Đại Sứ Tri Thức",
    ringClass: "ring-[2.5px] ring-[#9A5B13] ring-offset-2 ring-offset-white shadow-md shadow-[#9A5B13]/30",
    badgeBg: "bg-gradient-to-r from-[#9A5B13] via-amber-500 to-[#9A5B13] text-white",
    pillBg: "bg-[#F5EDE2] text-[#9A5B13] border-[#E5D5BE]",
    icon: "👑",
    nextHint: "Danh hiệu cao quý nhất tại BookHouse",
  },
};

export function resolveMemberTier(user) {
  if (!user) return MEMBER_TIERS["Mầm Sách"];
  const raw = String(user.member_tier || user.rank || user.tier || "").trim();
  if (raw === "Mần Sách" || raw === "Mầm Sách") return MEMBER_TIERS["Mầm Sách"];
  if (MEMBER_TIERS[raw]) return MEMBER_TIERS[raw];
  if (user.role === "admin") return MEMBER_TIERS["Đại Sứ Tri Thức"];
  return MEMBER_TIERS["Mầm Sách"];
}

export const ADMIN_BANNERS_STORAGE_KEY = "bookhouse_admin_banners_v1";

export const DEFAULT_HERO_BANNERS = [
  {
    id: 1,
    title: "Nghệ Thuật Quản Lý Tài Chính & Thịnh Vượng Bền Vững",
    quote:
      "“Một phần tiền bạn kiếm được là của bạn để giữ lại. Hãy bắt đầu làm cho túi tiền của bạn căng phồng ngay từ hôm nay.”",
    description:
      "Tuyển tập sách kinh điển về tư duy tài chính cá nhân giúp hàng triệu độc giả thay đổi cách nhìn nhận về giá trị lao động và tích lũy.",
    banner_image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80",
    book_id: 1,
    book_title: "Người Giàu Có Nhất Thành Babylon",
    book_author: "George S. Clason",
    book_image: "/imgs/babylon.jpg",
    badge_text: "Trích dẫn & Ấn phẩm tiêu điểm",
  },
  {
    id: 2,
    title: "Hành Trình Khám Phá Tri Thức & Chiều Sâu Tâm Hồn",
    quote:
      "“Mỗi cuốn sách hay là một cuộc trò chuyện thầm lặng với những bộ óc vĩ đại nhất của nhân loại qua nhiều thế kỷ.”",
    description:
      "Khám phá những đầu sách văn học và kỹ năng sống được cộng đồng độc giả BookHouse bình chọn cao nhất tháng này.",
    banner_image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80",
    book_id: 2,
    book_title: "Đắc Nhân Tâm (Ấn Bản Kỷ Niệm)",
    book_author: "Dale Carnegie",
    book_image: "/imgs/dacnhantam.jpg",
    badge_text: "Góc Đọc Sách Tuyển Chọn",
  },
  {
    id: 3,
    title: "Thế Giới Tuổi Thơ Diệu Kỳ & Trí Tưởng Tượng Vô Tận",
    quote:
      "“Dù đi qua bao nhiêu năm tháng trưởng thành, những trang truyện tuổi thơ vẫn luôn giữ nguyên phép màu sưởi ấm trái tim.”",
    description:
      "Bộ sưu tập truyện tranh và văn học thiếu nhi in giấy cao cấp, món quà ý nghĩa cho cả gia đình cùng đọc mỗi tối.",
    banner_image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80",
    book_id: 3,
    book_title: "Doraemon: Tàu Điện Ngầm Tặng Bố",
    book_author: "Fujiko F Fujio",
    book_image: "/imgs/doraemon.jpg",
    badge_text: "Tủ Sách Gia Đình & Thiếu Nhi",
  },
];

const SAMPLE_PUBLISHERS = [
  "NXB Trẻ",
  "NXB Kim Đồng",
  "NXB Văn Học",
  "NXB Thế Giới",
  "NXB Tổng Hợp TP.HCM",
  "NXB Nhã Nam",
];

const SAMPLE_YEARS = [2022, 2023, 2024, 2025, 2026];
const SAMPLE_PAGES = [216, 288, 320, 368, 412, 256];
const SAMPLE_DISCOUNTS = [15, 20, 0, 25, 10, 0];

/**
 * Bổ sung dữ liệu mẫu nhất quán theo ID sách cho các trường chưa có trong DB
 */
export function enrichBookWithSampleMeta(book = {}) {
  const seed = Number(book.id || 1);
  const currentPrice = Number(book.price || 0);

  const sampleDiscount = SAMPLE_DISCOUNTS[seed % SAMPLE_DISCOUNTS.length];
  const discountPercent =
    book.discount_percent !== undefined && book.discount_percent !== null
      ? Number(book.discount_percent)
      : book.original_price && Number(book.original_price) > currentPrice
      ? Math.round(
          ((Number(book.original_price) - currentPrice) /
            Number(book.original_price)) *
            100
        )
      : sampleDiscount;

  const originalPrice =
    book.original_price && Number(book.original_price) > currentPrice
      ? Number(book.original_price)
      : discountPercent > 0 && currentPrice > 0
      ? Math.round((currentPrice / (1 - discountPercent / 100)) / 1000) * 1000
      : currentPrice;

  const isNew =
    typeof book.is_new === "boolean"
      ? book.is_new
      : book.created_at
      ? Date.now() - new Date(book.created_at).getTime() <= 30 * 86400 * 1000
      : seed % 2 === 1;

  const soldCount =
    book.sold_count !== undefined && book.sold_count !== null
      ? Number(book.sold_count)
      : 45 + ((seed * 37) % 320);

  const isBestseller =
    typeof book.is_bestseller === "boolean"
      ? book.is_bestseller
      : soldCount >= 140;

  const rating =
    book.rating !== undefined && book.rating !== null
      ? Number(book.rating)
      : Number((4.6 + (seed % 5) * 0.1).toFixed(1));

  return {
    ...book,
    price: currentPrice,
    original_price: originalPrice,
    discount_percent: discountPercent,
    is_new: isNew,
    is_bestseller: isBestseller,
    sold_count: soldCount,
    rating: Math.min(5, rating),
    pages: Number(book.pages || SAMPLE_PAGES[seed % SAMPLE_PAGES.length]),
    publisher: book.publisher || SAMPLE_PUBLISHERS[seed % SAMPLE_PUBLISHERS.length],
    publish_year: Number(
      book.publish_year || SAMPLE_YEARS[seed % SAMPLE_YEARS.length]
    ),
  };
}