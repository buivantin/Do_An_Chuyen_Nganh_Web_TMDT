import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/ProductCard';
import ProductService from '../services/ProductService';

export default function ProductDetail({ productId }) {
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartNotice, setCartNotice] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setQuantity(1);
    setCartNotice({ type: '', text: '' });

    ProductService.getById(productId)
      .then(async (detail) => {
        if (!active) return;
        setBook(detail);

        if (detail.category_id) {
          const res = await ProductService.search('', detail.category_id, '', '', 'newest', 1);
          if (!active) return;
          const sameCategory = res.items
            .filter((item) => Number(item.id) !== Number(detail.id))
            .slice(0, 4);
          setRelatedBooks(sameCategory);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.response?.status === 404
            ? 'Sản phẩm không tồn tại hoặc đã bị ẩn.'
            : 'Không thể tải thông tin sách từ hệ thống.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  const handleAddToCart = async (targetBook = book, qty = quantity) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartNotice({
        type: 'warning',
        text: 'Vui lòng đăng nhập tài khoản để thêm sách vào giỏ hàng.',
      });
      return;
    }

    if (targetBook.stock <= 0) return;

    setSubmitting(true);
    setCartNotice({ type: '', text: '' });

    try {
      await ProductService.addToCart(targetBook.id, qty);
      
      // SỬA LỖI 2: Phát sự kiện để Header tự động cập nhật số lượng giỏ hàng
      window.dispatchEvent(new CustomEvent("cart-updated"));

      setCartNotice({
        type: 'success',
        text: `Đã thêm ${qty} cuốn "${targetBook.title}" vào giỏ hàng.`,
      });
    } catch (err) {
      setCartNotice({
        type: 'error',
        text: err.response?.data?.message || 'Không thể thêm vào giỏ hàng, vui lòng thử lại.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

  // SỬA LỖI 1: Hàm xử lý đường dẫn ảnh (Ghép domain backend nếu là đường dẫn tương đối)
  const resolveImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300x400?text=No+Image';
    if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
    return path.startsWith("/") ? `http://127.0.0.1:8000${path}` : `http://127.0.0.1:8000/${path}`;
  };

  return (
    <MainLayout>
      <div className="bg-[#FCFBF9] min-h-screen">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-stone-500">
            Đang tải thông tin sách...
          </div>
        ) : error || !book ? (
          <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-10">
              <p className="font-serif text-xl font-bold text-stone-800">{error}</p>
              <a
                href="/products"
                className="inline-block mt-4 bg-[#141414] text-white text-xs font-semibold px-5 py-2.5 rounded-xl"
              >
                Quay lại danh sách sách
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="bg-[#FAF8F5] border-b border-stone-200/70">
              <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-stone-500 flex flex-wrap items-center gap-2">
                <a href="/" className="hover:text-[#9A5B13]">Trang chủ</a>
                <span>&rsaquo;</span>
                <a href={`/products?category_id=${book.category_id}`} className="hover:text-[#9A5B13]">
                  {book.category}
                </a>
                <span>&rsaquo;</span>
                <span className="text-stone-800 font-medium truncate">{book.title}</span>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
              {/* Khối chi tiết chính: Ảnh trái - Thông tin phải */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Cột trái: Ảnh bìa */}
                <div className="lg:col-span-5 bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-6 sm:p-10 flex items-center justify-center aspect-[4/4.4]">
                  <img
                    src={resolveImageUrl(book.image)}
                    alt={book.title}
                    className="max-h-full object-contain rounded-lg shadow-md"
                  />
                </div>

                {/* Cột phải: Thông tin & Mua hàng */}
                <div className="lg:col-span-7 space-y-5">
                  <span className="inline-block bg-[#EFECE6] text-[#9A5B13] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md">
                    {book.category}
                  </span>

                  <div>
                    <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1A1A] leading-snug">
                      {book.title}
                    </h1>
                    <p className="text-sm text-stone-600 mt-2">
                      Tác giả: <strong className="text-stone-900">{book.author}</strong>
                    </p>
                  </div>

                  {/* Box Giá & Tình trạng kho */}
                  <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                        Giá bán
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-[#9A5B13] mt-0.5">
                        {formatPrice(book.price)}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
                        Tình trạng kho
                      </div>
                      {book.stock > 0 ? (
                        <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center sm:justify-end gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span>Còn {book.stock} cuốn trong kho</span>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-red-600 mt-1 flex items-center sm:justify-end gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600" />
                          <span>Tạm hết hàng</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bộ chọn số lượng & Nút Thêm vào giỏ */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="inline-flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        disabled={book.stock <= 0 || quantity <= 1}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-11 text-stone-700 hover:bg-stone-100 disabled:opacity-40 font-bold cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-stone-900">
                        {book.stock > 0 ? quantity : 0}
                      </span>
                      <button
                        type="button"
                        disabled={book.stock <= 0 || quantity >= book.stock}
                        onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                        className="w-10 h-11 text-stone-700 hover:bg-stone-100 disabled:opacity-40 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={book.stock <= 0 || submitting}
                      onClick={() => handleAddToCart(book, quantity)}
                      className="flex-1 min-w-[200px] h-11 bg-[#141414] hover:bg-stone-800 disabled:bg-stone-300 text-white text-sm font-semibold px-6 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2m7 18a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
                      </svg>
                      <span>{submitting ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</span>
                    </button>
                  </div>

                  {/* Thông báo phản hồi giỏ hàng */}
                  {cartNotice.text && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium border ${
                        cartNotice.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : cartNotice.type === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {cartNotice.text}
                    </div>
                  )}

                  {/* Cam kết dịch vụ */}
                  <div className="pt-4 border-t border-stone-200/80 grid grid-cols-3 gap-3 text-[11px] text-stone-600">
                    <div>✓ Sách bản quyền 100%</div>
                    <div>✓ Đổi trả trong 15 ngày</div>
                    <div>✓ Kiểm tra trước nhận hàng</div>
                  </div>
                </div>
              </div>

              {/* Mô tả nội dung sách */}
              <section className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-6 sm:p-8">
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A] pb-3 border-b border-stone-200/80">
                  Giới thiệu tác phẩm
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-stone-700 whitespace-pre-line">
                  {book.description || 'Đang cập nhật nội dung mô tả cho tác phẩm này.'}
                </p>
              </section>

              {/* Sách cùng danh mục (4 cuốn) */}
              {relatedBooks.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-end justify-between border-b border-stone-200 pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#9A5B13]">
                        Gợi ý dành cho bạn
                      </span>
                      <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-0.5">
                        Sách cùng danh mục
                      </h2>
                    </div>
                    <a
                      href={`/products?category_id=${book.category_id}`}
                      className="text-xs font-semibold text-[#9A5B13] hover:underline"
                    >
                      Xem tất cả &rarr;
                    </a>
                  </div>

                  <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedBooks.map((item) => (
                      <ProductCard
                        key={item.id}
                        book={item}
                        onAddToCart={(selected) => handleAddToCart(selected, 1)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}