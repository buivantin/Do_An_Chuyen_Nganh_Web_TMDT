import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/ProductCard';
import ProductService from '../services/ProductService';

const CATEGORIES = [
  { id: '', name: 'Tất cả danh mục' },
  { id: '1', name: 'Văn học' },
  { id: '2', name: 'Kinh tế' },
  { id: '3', name: 'Kỹ năng sống' },
  { id: '4', name: 'CNTT & Lập trình' },
  { id: '5', name: 'Ngoại ngữ' },
];

const PRICE_PRESETS = [
  { label: 'Tất cả mức giá', min: '', max: '' },
  { label: 'Dưới 100.000 đ', min: '', max: '100000' },
  { label: '100.000 đ - 200.000 đ', min: '100000', max: '200000' },
  { label: 'Trên 200.000 đ', min: '200000', max: '' },
];

export default function ProductList() {
  // Đọc tham số khởi tạo từ URL
  const getInitialParams = () => {
    const sp = new URLSearchParams(window.location.search);
    return {
      keyword: sp.get('keyword') || '',
      categoryId: sp.get('category_id') || '',
      minPrice: sp.get('min_price') || '',
      maxPrice: sp.get('max_price') || '',
      sort: sp.get('sort') || 'newest',
      page: Number(sp.get('page')) || 1,
    };
  };

  const [filters, setFilters] = useState(getInitialParams);
  const [priceInput, setPriceInput] = useState({
    min: getInitialParams().minPrice,
    max: getInitialParams().maxPrice,
  });
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Đồng bộ tham số lên URL và gọi ProductService.search
  useEffect(() => {
    const sp = new URLSearchParams();
    if (filters.keyword) sp.set('keyword', filters.keyword);
    if (filters.categoryId) sp.set('category_id', filters.categoryId);
    if (filters.minPrice !== '') sp.set('min_price', filters.minPrice);
    if (filters.maxPrice !== '') sp.set('max_price', filters.maxPrice);
    if (filters.sort && filters.sort !== 'newest') sp.set('sort', filters.sort);
    if (filters.page > 1) sp.set('page', filters.page);

    const newUrl = `${window.location.pathname}${sp.toString() ? `?${sp.toString()}` : ''}`;
    window.history.pushState({}, '', newUrl);

    let isMounted = true;
    setLoading(true);

    ProductService.search(
      filters.keyword,
      filters.categoryId,
      filters.minPrice,
      filters.maxPrice,
      filters.sort,
      filters.page
    ).then((res) => {
      if (!isMounted) return;
      setBooks(res.items);
      setPagination({
        currentPage: res.currentPage,
        lastPage: res.lastPage,
        total: res.total,
      });
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Lắng nghe nút Back/Forward của trình duyệt
  useEffect(() => {
    const onPopState = () => {
      const next = getInitialParams();
      setFilters(next);
      setPriceInput({ min: next.minPrice, max: next.maxPrice });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const updateFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    updateFilter({ minPrice: priceInput.min, maxPrice: priceInput.max });
  };

  const handleResetFilters = () => {
    setPriceInput({ min: '', max: '' });
    setFilters({
      keyword: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.lastPage) return;
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tiêu đề & Thanh sắp xếp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">
              {filters.keyword ? `Kết quả tìm kiếm cho "${filters.keyword}"` : 'Danh mục sách'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Tìm thấy <span className="font-semibold text-stone-800">{pagination.total}</span> cuốn sách
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <label htmlFor="sort" className="text-xs font-semibold text-stone-600">
              Sắp xếp:
            </label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => updateFilter({ sort: e.target.value })}
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-[#9A5B13]"
            >
              <option value="newest">Mới nhất</option>
              <option value="bestseller">Bán chạy nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cột trái: Bộ lọc */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-5 space-y-6">
              {/* Lọc theo Danh mục */}
              <div>
                <h2 className="font-serif text-base font-bold text-[#1A1A1A] mb-3">Danh mục</h2>
                <ul className="space-y-1.5">
                  {CATEGORIES.map((cat) => {
                    const active = String(filters.categoryId) === String(cat.id);
                    return (
                      <li key={cat.id || 'all'}>
                        <button
                          type="button"
                          onClick={() => updateFilter({ categoryId: cat.id })}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm transition cursor-pointer ${
                            active
                              ? 'bg-[#141414] text-white font-semibold'
                              : 'text-stone-700 hover:bg-[#F3EFEA]'
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <hr className="border-stone-200/80" />

              {/* Lọc theo Khoảng giá */}
              <div>
                <h2 className="font-serif text-base font-bold text-[#1A1A1A] mb-3">Khoảng giá</h2>

                {/* Mức giá chọn nhanh */}
                <div className="space-y-1.5 mb-3">
                  {PRICE_PRESETS.map((preset) => {
                    const isSelected =
                      filters.minPrice === preset.min && filters.maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setPriceInput({ min: preset.min, max: preset.max });
                          updateFilter({ minPrice: preset.min, maxPrice: preset.max });
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#9A5B13]/15 text-[#9A5B13] font-bold'
                            : 'text-stone-600 hover:bg-[#F3EFEA]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Nhập khoảng giá tùy chỉnh */}
                <form onSubmit={handleApplyPrice} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Từ đ"
                      value={priceInput.min}
                      onChange={(e) => setPriceInput({ ...priceInput, min: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#9A5B13]"
                    />
                    <span className="text-stone-400">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Đến đ"
                      value={priceInput.max}
                      onChange={(e) => setPriceInput({ ...priceInput, max: e.target.value })}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#9A5B13]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#9A5B13] hover:bg-[#7F4A0E] text-white text-xs font-semibold py-2 rounded-lg transition cursor-pointer"
                  >
                    Áp dụng giá
                  </button>
                </form>
              </div>

              {/* Nút xóa toàn bộ bộ lọc */}
              {(filters.keyword || filters.categoryId || filters.minPrice || filters.maxPrice) && (
                <>
                  <hr className="border-stone-200/80" />
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full bg-[#F3EFEA] hover:bg-[#EAE3DA] text-stone-800 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </>
              )}
            </div>
          </aside>

          {/* Cột phải: Lưới sản phẩm & Phân trang */}
          <section className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-3 border border-stone-100 animate-pulse">
                    <div className="bg-stone-200 rounded-xl aspect-[4/4.4]" />
                    <div className="h-3 bg-stone-200 rounded w-1/2 mt-3" />
                    <div className="h-4 bg-stone-200 rounded w-3/4 mt-2" />
                    <div className="h-9 bg-stone-200 rounded-lg mt-4" />
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              /* Luồng ngoại lệ UC-G2 */
              <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-12 text-center">
                <p className="font-serif text-lg font-bold text-stone-800">
                  Không tìm thấy sản phẩm nào phù hợp
                </p>
                <p className="text-xs text-stone-500 mt-1.5">
                  Hãy thử thay đổi từ khóa hoặc nới rộng khoảng giá tìm kiếm.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 bg-[#141414] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {books.map((book) => (
                    <ProductCard
                      key={book.id}
                      book={book}
                      onAddToCart={(item) => alert(`Đã thêm "${item.title}" vào giỏ!`)}
                    />
                  ))}
                </div>

                {/* Thanh phân trang giữ nguyên tham số URL */}
                {pagination.lastPage > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={pagination.currentPage <= 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border border-stone-200 bg-white text-stone-700 hover:bg-[#F3EFEA] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>

                    {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                          pagination.currentPage === pageNum
                            ? 'bg-[#141414] text-white'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-[#F3EFEA]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={pagination.currentPage >= pagination.lastPage}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border border-stone-200 bg-white text-stone-700 hover:bg-[#F3EFEA] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}