import React from "react";

export default function ProductCard({ book, onAddToCart }) {
    const cleanTitle = (book.title || book.name)?.normalize("NFC");

    return (
        <div className="bg-white rounded-2xl p-3 border border-stone-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <a href={`/products/${book.id}`} className="block group">
                <div className="bg-[#EAEAEA] rounded-xl p-4 flex items-center justify-center aspect-[4/4.4]">
                    <img
                        src={book.image}
                        alt={cleanTitle}
                        className="h-full object-contain shadow-md group-hover:scale-[1.02] transition"
                    />
                </div>

                <div className="pt-3">
                    <div className="flex justify-between text-[11px] font-bold text-[#9A5B13]">
                        <span className="uppercase truncate">
                            {book.category?.normalize("NFC")}
                        </span>
                    </div>

                    {/* Cho phép xuống 2 dòng + giữ chiều cao cố định 2 dòng để card không bị lệch */}
                    <h3
                        title={cleanTitle}
                        className="font-serif text-lg font-bold text-gray-900 mt-1 line-clamp-2 min-h-[3.5rem] group-hover:text-[#9A5B13] transition-colors"
                    >
                        {cleanTitle}
                    </h3>

                    <p className="text-xs text-gray-500 truncate mt-1">
                        {book.author?.normalize("NFC")}
                    </p>
                </div>
            </a>

            <div className="pt-3">
                <div className="text-lg font-bold text-gray-900">
                    {Number(book.price || 0).toLocaleString("vi-VN")} ₫
                </div>

                <button
                    type="button"
                    onClick={() => onAddToCart?.(book)}
                    className="mt-3 w-full bg-[#F5F3EF] hover:bg-[#EAE6DF] text-gray-800 font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4"
                    >
                        <path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2m7 18a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    );
}