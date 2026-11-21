import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
    const [categories, setCategories] = useState([]);
    const pathname = window.location.pathname;
    const activeCategoryId = new URLSearchParams(window.location.search).get("category_id");

    useEffect(() => {
        axios
            .get("/api/categories")
            .then((res) => {
                const activeCategories = (res.data.data || []).filter(
                    (cat) => cat.status === "active",
                );
                setCategories(activeCategories);
            })
            .catch((err) => {
                console.error("Lỗi tải menu danh mục:", err);
            });
    }, []);

    return (
        <nav className="bg-[#FAF8F5] border-b border-stone-200/70">
            <div className="max-w-7xl mx-auto px-4">
                <ul className="flex items-center gap-6 lg:gap-8 py-3 text-sm font-medium text-stone-700 overflow-x-auto whitespace-nowrap">
                    <li>
                        <a
                            href="/"
                            className={`transition-colors ${
                                pathname === "/"
                                    ? "text-[#9A5B13] font-bold"
                                    : "hover:text-[#9A5B13]"
                            }`}
                        >
                            Trang chủ
                        </a>
                    </li>

                    <li>
                        <a
                            href="/products"
                            className={`transition-colors ${
                                pathname === "/products" && !activeCategoryId
                                    ? "text-[#9A5B13] font-bold"
                                    : "hover:text-[#9A5B13]"
                            }`}
                        >
                            Xem tất cả sách
                        </a>
                    </li>

                    {categories.map((cat) => {
                        const isActive =
                            pathname === "/products" &&
                            String(activeCategoryId) === String(cat.id);

                        return (
                            <li key={cat.id}>
                                <a
                                    href={`/products?category_id=${cat.id}`}
                                    className={`transition-colors ${
                                        isActive
                                            ? "text-[#9A5B13] font-bold"
                                            : "hover:text-[#9A5B13]"
                                    }`}
                                >
                                    {cat.name}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}