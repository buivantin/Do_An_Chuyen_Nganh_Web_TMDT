import React from 'react';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sách bán chạy', href: '/best-sellers' },
  { label: 'Văn học', href: '/category/van-hoc' },
  { label: 'Kinh tế', href: '/category/kinh-te' },
  { label: 'Kỹ năng sống', href: '/category/ky-nang-song' },
  { label: 'Thiếu nhi', href: '/category/thieu-nhi' },
  { label: 'Khuyến mãi & Sự kiện', href: '/promotions' },
  { label: 'Blog đọc sách', href: '/blog' },
];

export default function Navbar() {
  return (
    <nav className="bg-[#FAF8F5] border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-6 lg:gap-8 py-3 text-sm font-medium text-stone-700 overflow-x-auto whitespace-nowrap">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="hover:text-[#9A5B13] transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}