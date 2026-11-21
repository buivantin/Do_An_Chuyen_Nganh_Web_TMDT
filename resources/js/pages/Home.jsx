import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import LoginRequiredModal from "../components/LoginRequiredModal";
import ProductService from "../services/ProductService";

function BookSectionSlider({ id, subtitle, title, books = [], viewAllHref, onRequireLogin }) {
    const limitedBooks = books.slice(0, 4);
    const [itemsPerSlide, setItemsPerSlide] = useState(() =>
        typeof window !== "undefined" && window.innerWidth >= 768 ? 2 : 1
    );
    const [currentSlide, setCurrentSlide] = useState(0);
    const [addingId, setAddingId] = useState(null);
    const [feedbackMap, setFeedbackMap] = useState({});

    useEffect(() => {
        const handleResize = () => {
            setItemsPerSlide(window.innerWidth >= 768 ? 2 : 1);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totalSlides = Math.max(1, Math.ceil(limitedBooks.length / itemsPerSlide));

    useEffect(() => {
        if (currentSlide >= totalSlides) {
            setCurrentSlide(0);
        }
    }, [currentSlide, totalSlides]);

    const visibleBooks = limitedBooks.slice(
        currentSlide * itemsPerSlide,
        currentSlide * itemsPerSlide + itemsPerSlide
    );

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentSlide((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
    };

    const setCardFeedback = (bookId, text) => {
        setFeedbackMap((prev) => ({ ...prev, [bookId]: text }));
        setTimeout(() => {
            setFeedbackMap((prev) => {
                const next = { ...prev };
                delete next[bookId];
                return next;
            });
        }, 2200);
    };

    const handleAddClick = async (item) => {
        const token = localStorage.getItem("token");
        if (!token) {
            onRequireLogin?.();
            return;
        }

        if (addingId === item.id) return;
        setAddingId(item.id);

        try {
            await ProductService.addToCart(item.id, 1);
            setCardFeedback(item.id, "Đã thêm vào giỏ!");
            window.dispatchEvent(new CustomEvent("cart-updated"));
        } catch (err) {
            const msg = err.response?.data?.message || "Số lượng vượt quá tồn kho";
            setCardFeedback(item.id, msg);
        } finally {
            setAddingId(null);
        }
    };

    return (
        <section id={id} className="space-y-4 sm:space-y-5 scroll-mt-6">
            {/* Tiêu đề mục + Điều hướng slide + Nút Xem tất cả */}
            <div className="flex flex-wrap items-end justify-between gap-2.5 border-b border-stone-200 pb-3">
                <div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#9A5B13]">
                        {subtitle}
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                        {title}
                    </h2>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                    {totalSlides > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handlePrev}
                                aria-label="Slide trước"
                                className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-[#F3EFEA] flex items-center justify-center transition cursor-pointer"
                            >
                                &lsaquo;
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                aria-label="Slide tiếp theo"
                                className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-[#F3EFEA] flex items-center justify-center transition cursor-pointer"
                            >
                                &rsaquo;
                            </button>
                        </div>
                    )}

                    <a
                        href={viewAllHref}
                        className="text-xs font-bold text-[#9A5B13] hover:underline whitespace-nowrap"
                    >
                        Xem tất cả &rarr;
                    </a>
                </div>
            </div>

            {/* Nội dung Slide */}
            {limitedBooks.length === 0 ? (
                <p className="text-sm text-stone-500">Chưa có sách trong mục này.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {visibleBooks.map((item) => {
                            const cleanTitle = (item.title || item.name || "").normalize("NFC");
                            const categoryName =
                                typeof item.category === "object" && item.category !== null
                                    ? item.category.name
                                    : item.category || "";
                            const isAdding = addingId === item.id;
                            const feedbackText = feedbackMap[item.id];

                            return (
                                <article
                                    key={item.id}
                                    className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200/80 shadow-sm hover:shadow-md transition flex gap-3 sm:gap-5 min-w-0"
                                >
                                    {/* Bên trái: Hình ảnh sách */}
                                    <a
                                        href={`/products/${item.id}`}
                                        className="w-24 sm:w-36 shrink-0 bg-[#EAEAEA] rounded-xl p-2.5 sm:p-3 flex items-center justify-center aspect-[3/4] group overflow-hidden"
                                    >
                                        <img
                                            src={item.image}
                                            alt={cleanTitle}
                                            className="h-full object-contain shadow-md group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </a>

                                    {/* Bên phải: Thông tin sách */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            {categoryName && (
                                                <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#9A5B13] truncate max-w-full">
                                                    {categoryName.normalize("NFC")}
                                                </span>
                                            )}

                                            <h3
                                                title={cleanTitle}
                                                className="font-serif text-base sm:text-xl font-bold text-gray-900 mt-1 line-clamp-2"
                                            >
                                                <a
                                                    href={`/products/${item.id}`}
                                                    className="hover:text-[#9A5B13] transition-colors"
                                                >
                                                    {cleanTitle}
                                                </a>
                                            </h3>

                                            <p className="text-xs text-stone-500 truncate mt-1">
                                                {item.author?.normalize("NFC") || "Đang cập nhật"}
                                            </p>

                                            {item.description && (
                                                <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 sm:mt-2 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-sm sm:text-lg font-bold text-gray-900">
                                                {Number(item.price || 0).toLocaleString("vi-VN")} ₫
                                            </span>

                                            <button
                                                type="button"
                                                disabled={isAdding}
                                                onClick={() => handleAddClick(item)}
                                                className="bg-[#F5F3EF] hover:bg-[#141414] text-stone-800 hover:text-white disabled:opacity-60 font-semibold text-xs px-3 sm:px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    className="w-3.5 h-3.5 shrink-0"
                                                >
                                                    <path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2m7 18a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
                                                </svg>
                                                <span>
                                                    {isAdding
                                                        ? "Đang thêm..."
                                                        : feedbackText || "Thêm vào giỏ"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Chấm chỉ báo vị trí slide */}
                    {totalSlides > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-1">
                            {Array.from({ length: totalSlides }).map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setCurrentSlide(idx)}
                                    aria-label={`Chuyển đến trang slide ${idx + 1}`}
                                    className={`h-2 rounded-full transition-all cursor-pointer ${
                                        currentSlide === idx
                                            ? "w-6 bg-[#9A5B13]"
                                            : "w-2 bg-stone-300 hover:bg-stone-400"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default function Home() {
    const [latestBooks, setLatestBooks] = useState([]);
    const [categoriesWithBooks, setCategoriesWithBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        axios
            .get("/api/home")
            .then((res) => {
                const data = res.data.data || {};
                setLatestBooks(data.latest_books || []);
                setCategoriesWithBooks(data.categories_with_books || []);
            })
            .catch(() => {
                setError("Không thể tải dữ liệu sách từ hệ thống.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <MainLayout>
            <LoginRequiredModal
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />

            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-10 sm:space-y-12">
                {loading ? (
                    <div className="py-16 text-center text-sm text-stone-500">
                        Đang tải dữ liệu sách...
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Khu vực 1: Slide Sách mới nhất (tối đa 4 cuốn) */}
                        <BookSectionSlider
                            subtitle="Mới phát hành"
                            title="Sách mới nhất"
                            books={latestBooks}
                            viewAllHref="/products?sort=newest"
                            onRequireLogin={() => setShowLoginModal(true)}
                        />

                        {/* Khu vực 2: Slide Sách theo từng danh mục (tối đa 4 cuốn/danh mục) */}
                        {categoriesWithBooks.map((category) => (
                            <BookSectionSlider
                                key={category.id}
                                id={`category-${category.id}`}
                                subtitle="Danh mục"
                                title={category.name}
                                books={category.books || []}
                                viewAllHref={`/products?category_id=${category.id}`}
                                onRequireLogin={() => setShowLoginModal(true)}
                            />
                        ))}
                    </>
                )}
            </div>
        </MainLayout>
    );
}