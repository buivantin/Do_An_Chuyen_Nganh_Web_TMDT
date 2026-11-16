import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import ProductCard from "../components/ProductCard";

export default function Home() {
    const [latestBooks, setLatestBooks] = useState([]);
    const [categoriesWithBooks, setCategoriesWithBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    const handleAddToCart = (book) => {
        alert(`Đã thêm "${book.title}" vào giỏ!`);
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
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
                        {/* Khu vực 1: 8 sách mới nhất */}
                        <section className="space-y-4">
                            <div className="flex items-end justify-between border-b border-stone-200 pb-3">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#9A5B13]">
                                        Mới phát hành
                                    </span>
                                    <h2 className="font-serif text-2xl font-bold text-gray-900 mt-0.5">
                                        Sách mới nhất
                                    </h2>
                                </div>
                                <span className="text-xs text-stone-500">
                                    {latestBooks.length} đầu sách
                                </span>
                            </div>

                            {latestBooks.length === 0 ? (
                                <p className="text-sm text-stone-500">
                                    Chưa có sách mới.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {latestBooks.map((item) => (
                                        <ProductCard
                                            key={item.id}
                                            book={item}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Khu vực 2: Sách theo từng danh mục */}
                        {categoriesWithBooks.map((category) => (
                            <section
                                key={category.id}
                                id={`category-${category.id}`}
                                className="space-y-4 scroll-mt-6"
                            >
                                <div className="flex items-end justify-between border-b border-stone-200 pb-3">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-[#9A5B13]">
                                            Danh mục
                                        </span>
                                        <h2 className="font-serif text-2xl font-bold text-gray-900 mt-0.5">
                                            {category.name}
                                        </h2>
                                    </div>
                                    <span className="text-xs text-stone-500">
                                        {category.books?.length || 0} đầu sách
                                    </span>
                                </div>

                                {!category.books ||
                                category.books.length === 0 ? (
                                    <p className="text-sm text-stone-500">
                                        Chưa có sách trong danh mục này.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {category.books.map((item) => (
                                            <ProductCard
                                                key={item.id}
                                                book={item}
                                                onAddToCart={handleAddToCart}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
