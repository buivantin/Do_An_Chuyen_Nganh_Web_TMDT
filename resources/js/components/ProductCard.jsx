import React from 'react';

export default function ProductCard({ book, onAddToCart }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-stone-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div className="bg-[#EAEAEA] rounded-xl p-4 flex items-center justify-center aspect-[4/4.4]">
        <img src={book.image} alt={book.title} className="h-full object-contain shadow-md" />
      </div>

      <div className="pt-3">
        <div className="flex justify-between text-[11px] font-bold text-[#9A5B13]">
          <span className="uppercase truncate">{book.category}</span>
        </div>
        <h3 className="font-serif text-lg font-bold text-gray-900 mt-1 truncate">{book.title}</h3>
        <p className="text-xs text-gray-500 truncate">{book.author}</p>

        <div className="mt-3 text-lg font-bold text-gray-900">
          {book.price.toLocaleString('vi-VN')} đ
        </div>

        <button
          type="button"
          onClick={() => onAddToCart?.(book)}
          className="mt-3 w-full bg-[#F5F3EF] hover:bg-[#EAE6DF] text-gray-800 font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2m7 18a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}