import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
    const [categories, setCategories] = useState([]);

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
                            className="hover:text-[#9A5B13] transition-colors"
                        >
                            Trang chủ
                        </a>
                    </li>

                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <a
                                href={`/#category-${cat.id}`}
                                className="hover:text-[#9A5B13] transition-colors"
                            >
                                {cat.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
