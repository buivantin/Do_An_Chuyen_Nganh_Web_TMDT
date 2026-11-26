import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Footer() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios
            .get("/api/categories", {
                headers: { Accept: "application/json" },
            })
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : res.data.data || [];
                const activeCategories = list.filter(
                    (cat) => !cat.status || cat.status === "active"
                );
                setCategories(activeCategories);
            })
            .catch(() => {
                setCategories([]);
            });
    }, []);

    return (
        <footer className="bg-[#FAF8F5] border-t border-stone-200/80 text-stone-700 mt-12">
            {/* Khu vực 4 cột chính */}
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                {/* Cột 1: Thông tin thương hiệu */}
                <div>
                    <a href="/" className="inline-flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded bg-[#141414] text-white flex items-center justify-center shrink-0">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="w-4 h-4"
                            >
                                <path
                                    d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5v-13Z"
                                    strokeLinejoin="round"
                                />
                                <path d="M8 7h8M8 11h6" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span className="font-serif text-lg font-bold tracking-tight text-[#1A1A1A]">
                            Mọt Sách BookHouse
                        </span>
                    </a>

                    <p className="mt-3.5 text-xs leading-relaxed text-stone-600">
                        Không gian lưu giữ và tuyển lựa những tác phẩm văn chương
                        kinh điển, ấn bản giới hạn và sách nghệ thuật thẩm mỹ cao.
                    </p>

                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A5B13]">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4 shrink-0"
                        >
                            <path
                                d="M12 3 4 6.5v5.2c0 5 3.4 9.6 8 10.8 4.6-1.2 8-5.8 8-10.8V6.5L12 3Z"
                                strokeLinejoin="round"
                            />
                            <path
                                d="m9 12 2 2 4-4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span>Chuẩn xác từng bản in</span>
                    </div>
                </div>

                {/* Cột 2: Khám phá tác phẩm (Danh mục lấy từ DB) */}
                <div>
                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-3.5">
                        Khám phá tác phẩm
                    </h3>
                    {categories.length === 0 ? (
                        <ul className="space-y-2.5 text-xs text-stone-600">
                            <li>
                                <a
                                    href="/products"
                                    className="hover:text-[#9A5B13] transition-colors"
                                >
                                    Tất cả đầu sách
                                </a>
                            </li>
                        </ul>
                    ) : (
                        <ul className="space-y-2.5 text-xs text-stone-600">
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <a
                                        href={`/products?category_id=${cat.id}`}
                                        className="hover:text-[#9A5B13] transition-colors"
                                    >
                                        {cat.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Cột 3: Chăm sóc độc giả */}
                <div>
                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-3.5">
                        Chăm sóc độc giả
                    </h3>
                    <ul className="space-y-2.5 text-xs text-stone-600">
                        <li>
                            <a
                                href="#return-policy"
                                className="hover:text-[#9A5B13] transition-colors"
                            >
                                Chính sách đổi trả &amp; Bảo hành bìa
                            </a>
                        </li>
                        <li>
                            <a
                                href="#packaging"
                                className="hover:text-[#9A5B13] transition-colors"
                            >
                                Quy cách bọc gáy &amp; Đóng gói
                            </a>
                        </li>
                        <li>
                            <a
                                href="#curator"
                                className="hover:text-[#9A5B13] transition-colors"
                            >
                                Liên hệ giám tuyển sách
                            </a>
                        </li>
                        <li>
                            <a
                                href="#faq"
                                className="hover:text-[#9A5B13] transition-colors"
                            >
                                Câu hỏi thường gặp
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Cột 4: Liên hệ & Thanh toán */}
                <div>
                    <h3 className="text-sm font-bold text-[#1A1A1A] mb-3.5">
                        Liên hệ &amp; Thanh toán
                    </h3>
                    <div className="space-y-2 text-xs text-stone-600">
                        <p>130 Đ. Số 65, Khu định cư Tân Quy Đông, Tân Hưng, Hồ Chí Minh</p>
                        <p>
                            Hotline: <span className="font-semibold text-stone-800">1900 6886</span>{" "}{" "}
                            <a
                                href="mailto:thuquan@motsachbookhouse.vn"
                                className="hover:text-[#9A5B13] transition-colors"
                            >
                                thuquan@motsachbookhouse.vn
                            </a>    
                        </p>
                    </div>

                    <div className="mt-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                            Đối tác thanh toán an toàn
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {["VNPAY", "MOMO", "VISA / MASTER", "COD"].map((method) => (
                                <span
                                    key={method}
                                    className="bg-[#EFECE6] text-stone-700 text-[10px] font-bold px-2.5 py-1 rounded"
                                >
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Thanh bản quyền dưới cùng */}
            <div className="border-t border-stone-200/80 bg-[#F3EFEA]/70">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
                    <p>
                        © 2026 Mọt Sách BookHouse. Toàn bộ bản quyền ấn bản và hình ảnh
                        được bảo hộ.
                    </p>
                    <div className="flex items-center gap-5 font-semibold text-stone-600">
                        <a
                            href="#terms"
                            className="hover:text-[#9A5B13] transition-colors"
                        >
                            Điều khoản dịch vụ
                        </a>
                        <a
                            href="#privacy"
                            className="hover:text-[#9A5B13] transition-colors"
                        >
                            Bảo mật thông tin độc giả
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}