import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

function StarIcon({ filled, className = "w-4 h-4" }) {
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

function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ProductReviews({ productId, onStatsLoaded }) {
  const [stats, setStats] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [selectedStar, setSelectedStar] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchReviews = useCallback(
    async (page = 1, star = 0) => {
      if (!productId) return;
      setLoading(true);
      setErrorMsg("");

      try {
        const params = { page };
        if (star >= 1 && star <= 5) {
          params.rating = star;
        }

        const res = await axios.get(`/api/products/${productId}/reviews`, {
          params,
          headers: { Accept: "application/json" },
        });

        const payload = res.data || {};
        const pageData = payload.reviews || {};
        const list = Array.isArray(pageData.data)
          ? pageData.data
          : Array.isArray(payload.reviews)
          ? payload.reviews
          : Array.isArray(payload.data)
          ? payload.data
          : [];

        const rawStats = payload.stats || {};
        const totalReviews = Number(
          rawStats.total_reviews ?? payload.total_reviews ?? list.length
        );
        const avgRating = Number(
          rawStats.average_rating ?? payload.average_rating ?? 0
        );
        const counts = rawStats.rating_counts ||
          payload.rating_counts ||
          payload.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        const nextStats = {
          average_rating: avgRating,
          total_reviews: totalReviews,
          rating_counts: {
            5: Number(counts[5] || 0),
            4: Number(counts[4] || 0),
            3: Number(counts[3] || 0),
            2: Number(counts[2] || 0),
            1: Number(counts[1] || 0),
          },
        };

        setStats(nextStats);
        setReviews(list);
        setPagination({
          current_page: Number(pageData.current_page || 1),
          last_page: Number(pageData.last_page || 1),
        });

        if (typeof onStatsLoaded === "function") {
          onStatsLoaded(nextStats);
        }
      } catch (err) {
        setErrorMsg(
          err.response?.data?.message || "Không thể tải đánh giá sản phẩm."
        );
      } finally {
        setLoading(false);
      }
    },
    [productId, onStatsLoaded]
  );

  useEffect(() => {
    fetchReviews(1, selectedStar);
  }, [fetchReviews, selectedStar]);

  const handleFilterStar = (star) => {
    setSelectedStar(star);
  };

  return (
    <section
      id="product-reviews"
      className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-7 space-y-6 shadow-2xs"
    >
      {/* Tiêu đề khối */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A5B13]">
            Cảm nhận độc giả
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] mt-0.5">
            Đánh Giá Từ Khách Hàng Đã Mua
          </h2>
        </div>

        <a
          href="/account?tab=orders"
          className="text-xs font-semibold text-[#9A5B13] hover:underline"
        >
          Viết đánh giá trong Đơn hàng của tôi &rarr;
        </a>
      </div>

      {/* Khung tổng hợp điểm số & phân bổ sao */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 sm:p-5">
        {/* Điểm trung bình bên trái */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center md:border-r md:border-stone-200/80 md:pr-4">
          <div className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
            {Number(stats.average_rating || 0).toFixed(1)}
            <span className="text-lg font-sans font-semibold text-stone-400">
              /5
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-500 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                filled={star <= Math.round(Number(stats.average_rating || 0))}
                className="w-5 h-5"
              />
            ))}
          </div>

          <div className="text-xs text-stone-500">
            Dựa trên{" "}
            <strong className="text-stone-800">{stats.total_reviews}</strong>{" "}
            đánh giá xác thực
          </div>
        </div>

        {/* Thanh phân bổ 5 sao -> 1 sao + nút lọc */}
        <div className="md:col-span-8 space-y-3">
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = Number(stats.rating_counts?.[star] || 0);
              const percent =
                stats.total_reviews > 0
                  ? Math.round((count / stats.total_reviews) * 100)
                  : 0;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    handleFilterStar(selectedStar === star ? 0 : star)
                  }
                  className="w-full flex items-center gap-3 text-xs group cursor-pointer"
                >
                  <span className="w-12 text-left font-semibold text-stone-700 group-hover:text-[#9A5B13] flex items-center gap-1 shrink-0">
                    <span>{star}</span>
                    <StarIcon filled className="w-3.5 h-3.5 text-amber-500" />
                  </span>

                  <div className="flex-1 h-2 bg-stone-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-stone-500 shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Các nút lọc nhanh */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleFilterStar(0)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                selectedStar === 0
                  ? "bg-[#141414] text-white border-[#141414]"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
              }`}
            >
              Tất cả ({stats.total_reviews})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleFilterStar(star)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  selectedStar === star
                    ? "bg-[#141414] text-white border-[#141414]"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                }`}
              >
                {star} sao ({stats.rating_counts?.[star] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách bình luận */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-xs sm:text-sm text-stone-500">
          Đang tải nhận xét từ độc giả...
        </div>
      ) : reviews.length > 0 ? (
        <div className="divide-y divide-stone-100">
          {reviews.map((rev) => {
            const reviewerName = (
              rev.user?.username ||
              rev.user?.name ||
              rev.user_name ||
              "Độc giả BookHouse"
            ).normalize("NFC");
            const avatar = resolveAssetUrl(
              rev.user?.image_path || rev.user?.avatar
            );
            const initial = reviewerName.trim().charAt(0).toUpperCase();

            return (
              <article
                key={rev.id}
                className="py-4 first:pt-1 last:pb-1 flex items-start gap-3.5"
              >
                {/* Avatar người đánh giá */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={reviewerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>

                {/* Nội dung đánh giá */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        {reviewerName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
                        &#10003; Đã mua hàng
                      </span>
                    </div>

                    <time className="text-[11px] text-stone-400">
                      {formatDate(rev.created_at)}
                    </time>
                  </div>

                  {/* Số sao */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        filled={star <= Number(rev.rating || 0)}
                        className="w-4 h-4"
                      />
                    ))}
                  </div>

                  {/* Lời bình luận */}
                  {rev.comment ? (
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line pt-0.5">
                      {rev.comment.normalize("NFC")}
                    </p>
                  ) : (
                    <p className="text-xs italic text-stone-400">
                      Độc giả đã chấm {rev.rating} sao cho ấn phẩm này.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center space-y-2 bg-[#FAF8F5] rounded-2xl border border-stone-200/70">
          <p className="font-serif text-base font-bold text-stone-800">
            {selectedStar > 0
              ? `Chưa có đánh giá ${selectedStar} sao nào`
              : "Chưa có đánh giá nào cho ấn phẩm này"}
          </p>
          <p className="text-xs text-stone-500">
            Đánh giá sẽ hiển thị tại đây sau khi khách hàng hoàn thành đơn hàng
            và nhận xét trong mục Tài khoản.
          </p>
        </div>
      )}

      {/* Phân trang */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={pagination.current_page <= 1}
            onClick={() =>
              fetchReviews(pagination.current_page - 1, selectedStar)
            }
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
          >
            &lsaquo; Trước
          </button>
          <span className="text-xs text-stone-500 px-2">
            Trang {pagination.current_page} / {pagination.last_page}
          </span>
          <button
            type="button"
            disabled={pagination.current_page >= pagination.last_page}
            onClick={() =>
              fetchReviews(pagination.current_page + 1, selectedStar)
            }
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
          >
            Sau &rsaquo;
          </button>
        </div>
      )}
    </section>
  );
}