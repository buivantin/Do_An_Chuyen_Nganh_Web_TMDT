import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/ProductCard';
import ProductService from '../services/ProductService';

const PRICE_PRESETS = [
  { label: 'Dưới 100.000đ', min: '0', max: '100000' },
  { label: '100k - 250.000đ', min: '100000', max: '250000' },
  { label: '250k - 500.000đ', min: '250000', max: '500000' },
  { label: 'Trên 500.000đ', min: '500000', max: '' },
];

const PER_PAGE = 12;

export default function ProductList({
  products = null,
  categories: propCategories = null,
  onAddToCart,
}) {
  const isFromProp = Array.isArray(products);

  const readUrlParams = () => {
    const sp = new URLSearchParams(window.location.search);
    return {
      keyword: sp.get('keyword') || '',
      categoryId: sp.get('category_id') || '',
      minPrice: sp.get('min_price') || '',
      maxPrice: sp.get('max_price') || '',
      sort: sp.get('sort') || 'bestseller',
      page: Number(sp.get('page')) || 1,
    };
  };

  const [categories, setCategories] = useState(propCategories || []);
  const [filters, setFilters] = useState(readUrlParams);
  const [priceRange, setPriceRange] = useState({
    min: readUrlParams().minPrice,
    max: readUrlParams().maxPrice,
  });
  const [books, setBooks] = useState(isFromProp ? products.slice(0, PER_PAGE) : []);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: isFromProp ? Math.max(1, Math.ceil(products.length / PER_PAGE)) : 1,
    total: isFromProp ? products.length : 0,
  });
  const [loading, setLoading] = useState(!isFromProp);
  const [error, setError] = useState('');

  // Lấy danh mục từ DB nếu không truyền qua prop
  useEffect(() => {
    if (Array.isArray(propCategories) && propCategories.length > 0) {
      setCategories(propCategories);
      return;
    }

    ProductService.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [propCategories]);

  // Đồng bộ URL và lọc dữ liệu từ prop hoặc gọi API DB
  useEffect(() => {
    const sp = new URLSearchParams();
    if (filters.keyword) sp.set('keyword', filters.keyword);
    if (filters.categoryId) sp.set('category_id', filters.categoryId);
    if (filters.minPrice !== '') sp.set('min_price', filters.minPrice);
    if (filters.maxPrice !== '') sp.set('max_price', filters.maxPrice);
    if (filters.sort && filters.sort !== 'bestseller') sp.set('sort', filters.sort);
    if (filters.page > 1) sp.set('page', filters.page);

    const nextUrl = `${window.location.pathname}${sp.toString() ? `?${sp.toString()}` : ''}`;
    window.history.pushState({}, '', nextUrl);

    // Trường hợp 1: Nhận prop products lấy từ DB ở Home.jsx
    if (isFromProp) {
      let filtered = [...products];

      if (filters.keyword.trim()) {
        const kw = filters.keyword.trim().toLowerCase();
        filtered = filtered.filter(
          (b) =>
            (b.title || b.name || '').toLowerCase().includes(kw) ||
            (b.author || '').toLowerCase().includes(kw)
        );
      }

      if (filters.categoryId) {
        const selectedCat = categories.find((c) => String(c.id) === String(filters.categoryId));
        filtered = filtered.filter((b) => {
          const catName = typeof b.category === 'object' ? b.category?.name : b.category;
          return (
            String(b.category_id) === String(filters.categoryId) ||
            (selectedCat && (catName || '').toLowerCase() === selectedCat.name.toLowerCase())
          );
        });
      }

      if (filters.minPrice !== '') {
        filtered = filtered.filter((b) => Number(b.price) >= Number(filters.minPrice));
      }

      if (filters.maxPrice !== '') {
        filtered = filtered.filter((b) => Number(b.price) <= Number(filters.maxPrice));
      }

      if (filters.sort === 'price_asc') filtered.sort((a, b) => Number(a.price) - Number(b.price));
      if (filters.sort === 'price_desc') filtered.sort((a, b) => Number(b.price) - Number(a.price));
      if (filters.sort === 'newest') filtered.sort((a, b) => Number(b.id) - Number(a.id));

      const total = filtered.length;
      const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
      const safePage = Math.min(Math.max(1, filters.page), lastPage);
      const start = (safePage - 1) * PER_PAGE;

      setBooks(filtered.slice(start, start + PER_PAGE));
      setPagination({ currentPage: safePage, lastPage, total });
      setLoading(false);
      setError('');
      return;
    }

    // Trường hợp 2: Truy cập /products -> gọi API phân trang server từ DB
    let active = true;
    setLoading(true);
    setError('');

    ProductService.search(
      filters.keyword,
      filters.categoryId,
      filters.minPrice,
      filters.maxPrice,
      filters.sort,
      filters.page
    )
      .then((res) => {
        if (!active) return;
        setBooks(res.items);
        setPagination({
          currentPage: res.currentPage,
          lastPage: res.lastPage,
          total: res.total,
        });
      })
      .catch(() => {
        if (!active) return;
        setBooks([]);
        setError('Không thể tải dữ liệu sách từ hệ thống.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters, products, isFromProp, categories]);

  // Hỗ trợ nút Back / Forward của trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const next = readUrlParams();
      setFilters(next);
      setPriceRange({ min: next.minPrice, max: next.maxPrice });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const handleResetAll = () => {
    setPriceRange({ min: '', max: '' });
    setFilters({
      keyword: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      sort: 'bestseller',
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.lastPage || newPage === pagination.currentPage) return;
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.keyword) {
      chips.push({
        key: 'keyword',
        label: `Từ khóa: "${filters.keyword}"`,
        onRemove: () => updateFilter({ keyword: '' }),
      });
    }
    if (filters.categoryId) {
      const cat = categories.find((c) => String(c.id) === String(filters.categoryId));
      chips.push({
        key: 'category',
        label: cat ? cat.name : `Danh mục #${filters.categoryId}`,
        onRemove: () => updateFilter({ categoryId: '' }),
      });
    }
    if (filters.minPrice !== '' || filters.maxPrice !== '') {
      const minText = filters.minPrice ? `${Number(filters.minPrice).toLocaleString('vi-VN')}đ` : '0đ';
      const maxText = filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString('vi-VN')}đ` : 'Trở lên';
      chips.push({
        key: 'price',
        label: `${minText} - ${maxText}`,
        onRemove: () => {
          setPriceRange({ min: '', max: '' });
          updateFilter({ minPrice: '', maxPrice: '' });
        },
      });
    }
    return chips;
  }, [filters, categories]);

  const pageNumbers = useMemo(() => {
    const { currentPage, lastPage } = pagination;
    if (lastPage <= 6) {
      return Array.from({ length: lastPage }, (_, i) => i + 1);
    }
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(lastPage - 1, currentPage + 1); p++) {
      pages.push(p);
    }
    if (currentPage < lastPage - 2) pages.push('...');
    pages.push(lastPage);
    return pages;
  }, [pagination]);

  const formatPriceHeader = () => {
    const min = filters.minPrice ? `${Number(filters.minPrice).toLocaleString('vi-VN')}đ` : '0đ';
    const max = filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString('vi-VN')}đ` : '1.000.000đ+';
    return `${min} - ${max}`;
  };

  const handleAdd = onAddToCart || ((item) => alert(`Đã thêm "${item.title}" vào giỏ hàng!`));

  const content = (
    <div className="bg-[#FCFBF9] min-h-screen">
      {/* Thanh trạng thái & Sắp xếp */}
      <div className="border-b border-stone-200/80 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span className="w-2 h-2 rounded-full bg-[#9A5B13]" />
            <span>
              Hiển thị <strong className="text-stone-900">{books.length}</strong> trong số{' '}
              <strong className="text-stone-900">{pagination.total.toLocaleString('vi-VN')}</strong> cuốn sách
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-stone-500">Sắp xếp theo:</span>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter({ sort: e.target.value })}
              className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#9A5B13] cursor-pointer"
            >
              <option value="bestseller">Bán chạy nhất</option>
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Bộ lọc từ DB */}
        <aside className="lg:col-span-3 space-y-5">
          <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/80">
              <div className="flex items-center gap-2 font-serif font-bold text-base text-[#1A1A1A]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[#9A5B13]">
                  <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
                </svg>
                <span>Bộ lọc tìm kiếm</span>
              </div>
              <button
                type="button"
                onClick={handleResetAll}
                className="text-[11px] font-bold tracking-wider uppercase text-[#9A5B13] hover:underline cursor-pointer"
              >
                Thiết lập lại
              </button>
            </div>

            {/* 1. Danh mục từ DB */}
            <div className="py-4 border-b border-stone-200/80">
              <h3 className="text-xs font-bold text-stone-900 mb-3">Thể loại &amp; Đề tài</h3>
              {categories.length === 0 ? (
                <p className="text-xs text-stone-400">Chưa có danh mục.</p>
              ) : (
                <ul className="space-y-2.5">
                  {categories.map((cat) => {
                    const checked = String(filters.categoryId) === String(cat.id);
                    return (
                      <li key={cat.id}>
                        <button
                          type="button"
                          onClick={() => updateFilter({ categoryId: checked ? '' : String(cat.id) })}
                          className="w-full flex items-center justify-between text-left group cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                                checked
                                  ? 'bg-[#9A5B13] border-[#9A5B13] text-white'
                                  : 'bg-white border-stone-300 group-hover:border-[#9A5B13]'
                              }`}
                            >
                              {checked && (
                                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                </svg>
                              )}
                            </span>
                            <span
                              className={`text-xs transition ${
                                checked ? 'font-bold text-stone-900' : 'text-stone-600 group-hover:text-stone-900'
                              }`}
                            >
                              {cat.name}
                            </span>
                          </span>
                          {cat.products_count !== undefined && (
                            <span className="text-[11px] bg-white border border-stone-200/80 text-stone-500 px-1.5 py-0.5 rounded">
                              {cat.products_count}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* 2. Khoảng giá */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-stone-900">Khoảng giá (VNĐ)</h3>
                <span className="text-[11px] font-bold text-[#9A5B13]">{formatPriceHeader()}</span>
              </div>

              <input
                type="range"
                min="0"
                max="1000000"
                step="50000"
                value={priceRange.max || 1000000}
                onChange={(e) => {
                  const val = e.target.value === '1000000' ? '' : e.target.value;
                  setPriceRange((prev) => ({ ...prev, max: val }));
                  updateFilter({ maxPrice: val });
                }}
                className="w-full accent-[#9A5B13] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mb-3">
                <span>0đ</span>
                <span>500.000đ</span>
                <span>1.000.000đ</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {PRICE_PRESETS.map((preset) => {
                  const isSelected =
                    filters.minPrice === preset.min && filters.maxPrice === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setPriceRange({ min: preset.min, max: preset.max });
                        updateFilter({ minPrice: preset.min, maxPrice: preset.max });
                      }}
                      className={`px-2 py-2 rounded-lg text-[11px] font-medium text-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#F3E2D2] text-[#9A5B13] font-bold border border-[#9A5B13]/30'
                          : 'bg-white border border-stone-200/80 text-stone-600 hover:bg-[#F3EFEA]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateFilter({ minPrice: priceRange.min, maxPrice: priceRange.max });
                }}
                className="space-y-2"
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Từ (đ)"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#9A5B13]"
                  />
                  <span className="text-stone-400 text-xs">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Đến (đ)"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#9A5B13]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#141414] hover:bg-stone-800 text-white text-xs font-semibold py-2 rounded-lg transition cursor-pointer"
                >
                  Áp dụng khoảng giá
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Cột phải: Thẻ đang áp dụng + Lưới sản phẩm + Phân trang */}
        <section className="lg:col-span-9">
          {activeChips.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1">
                Đang áp dụng:
              </span>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 bg-white border border-stone-200 text-stone-700 text-xs px-3 py-1 rounded-full"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Xóa lọc ${chip.label}`}
                    className="text-stone-400 hover:text-stone-900 font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs font-semibold text-[#9A5B13] hover:underline ml-1 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-3 border border-stone-100 animate-pulse">
                  <div className="bg-stone-200 rounded-xl aspect-[4/4.4]" />
                  <div className="h-3 bg-stone-200 rounded w-1/2 mt-3" />
                  <div className="h-4 bg-stone-200 rounded w-3/4 mt-2" />
                  <div className="h-9 bg-stone-200 rounded-lg mt-4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          ) : books.length === 0 ? (
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-12 text-center">
              <p className="font-serif text-lg font-bold text-stone-800">
                Không tìm thấy sản phẩm nào phù hợp
              </p>
              <p className="text-xs text-stone-500 mt-1.5">
                Hãy thử từ khóa khác hoặc thiết lập lại bộ lọc tìm kiếm.
              </p>
              <button
                type="button"
                onClick={handleResetAll}
                className="mt-4 bg-[#141414] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Thiết lập lại bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {books.map((book) => (
                  <ProductCard key={book.id} book={book} onAddToCart={handleAdd} />
                ))}
              </div>

              {pagination.lastPage > 1 && (
                <div className="mt-8 pt-6 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-[#F3EFEA] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    &lt; Trang trước
                  </button>

                  <div className="flex items-center gap-1.5">
                    {pageNumbers.map((item, idx) =>
                      item === '...' ? (
                        <span key={`dots-${idx}`} className="px-2 text-xs text-stone-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handlePageChange(item)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                            pagination.currentPage === item
                              ? 'bg-[#141414] text-white'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-[#F3EFEA]'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={pagination.currentPage >= pagination.lastPage}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    Trang tiếp theo &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );

  return isFromProp ? content : <MainLayout>{content}</MainLayout>;
}