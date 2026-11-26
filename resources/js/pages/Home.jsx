import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import HeroBanner from "../components/HeroBanner";
import BookSliderSection from "../components/BookSliderSection";
import LoginRequiredModal from "../components/LoginRequiredModal";
import ProductService from "../services/ProductService";

export default function Home() {
  const [latestBooks, setLatestBooks] = useState([]);
  const [bestsellerBooks, setBestsellerBooks] = useState([]);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
  const [categoriesWithBooks, setCategoriesWithBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cartToast, setCartToast] = useState({ type: "", text: "" });

  useEffect(() => {
    axios
      .get("/api/home")
      .then((res) => {
        const data = res.data?.data || {};
        const latest = Array.isArray(data.latest_books) ? data.latest_books : [];

        const allPool =
          latest.length > 0
            ? latest
            : (data.categories_with_books || []).flatMap((c) => c.books || []);

        const bestsellers =
          Array.isArray(data.bestseller_books) && data.bestseller_books.length > 0
            ? data.bestseller_books
            : [...allPool].sort(
                (a, b) => Number(b.sold_count || 0) - Number(a.sold_count || 0)
              );

        const topRated =
          Array.isArray(data.top_rated_books) && data.top_rated_books.length > 0
            ? data.top_rated_books
            : [...allPool].sort(
                (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
              );

        setLatestBooks(latest);
        setBestsellerBooks(bestsellers);
        setTopRatedBooks(topRated);
        setCategoriesWithBooks(data.categories_with_books || []);
      })
      .catch(() => {
        setError("Không thể tải dữ liệu sách từ hệ thống.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddToCart = async (book) => {
    if (!book) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setLoginModalOpen(true);
      return;
    }

    try {
      await ProductService.addToCart(book.id, 1);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      setCartToast({
        type: "success",
        text: `Đã thêm "${book.name || book.title}" vào giỏ hàng.`,
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        setLoginModalOpen(true);
        return;
      }
      setCartToast({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Không thể thêm vào giỏ hàng, vui lòng thử lại.",
      });
    } finally {
      setTimeout(() => setCartToast({ type: "", text: "" }), 3000);
    }
  };

  return (
    <MainLayout>
      {cartToast.text && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl text-xs font-semibold shadow-lg border ${
            cartToast.type === "success"
              ? "bg-emerald-900 text-white border-emerald-700"
              : "bg-red-800 text-white border-red-600"
          }`}
        >
          {cartToast.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-10 sm:space-y-14">
        {/* 1. Banner Quảng Cáo Sách & Trích Dẫn Hay (Admin quản lý) */}
        <HeroBanner />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3 border border-stone-200/80 animate-pulse space-y-3"
              >
                <div className="bg-stone-200 rounded-xl aspect-[3/4]" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
                <div className="h-4 bg-stone-200 rounded w-4/5" />
                <div className="h-8 bg-stone-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <>
            {/* 2. Slider Sách Mới Về (xét theo ngày thêm) */}
            <BookSliderSection
              id="section-newest"
              subtitle="Vừa cập bến kệ sách"
              title="Sách Mới Về"
              badgeText="Mới phát hành"
              books={latestBooks}
              viewAllHref="/products?sort=newest"
              onAddToCart={handleAddToCart}
            />

            {/* 3. Slider Sách Bán Chạy (dựa vào lần xuất hiện trong hóa đơn) */}
            <BookSliderSection
              id="section-bestseller"
              subtitle="Độc giả tin chọn"
              title="Sách Bán Chạy Nhất"
              badgeText="🔥 Hot"
              books={bestsellerBooks}
              viewAllHref="/products?sort=bestseller"
              onAddToCart={handleAddToCart}
            />

            {/* 4. Slider Top Đánh Giá (số sao trung bình cao nhất) */}
            <BookSliderSection
              id="section-top-rated"
              subtitle="Cộng đồng bình chọn"
              title="Top Sách Đánh Giá Cao"
              badgeText="★ Đánh giá cao"
              books={topRatedBooks}
              viewAllHref="/products?sort=rating"
              onAddToCart={handleAddToCart}
            />

            {/* 5. Các kệ sách theo từng danh mục */}
            {categoriesWithBooks.map((category) => (
              <BookSliderSection
                key={category.id}
                id={`category-${category.id}`}
                subtitle="Tủ sách chuyên đề"
                title={category.name}
                books={category.books || []}
                viewAllHref={`/products?category_id=${category.id}`}
                onAddToCart={handleAddToCart}
              />
            ))}
          </>
        )}
      </div>

      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </MainLayout>
  );
}