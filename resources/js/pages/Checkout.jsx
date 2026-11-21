import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import ProductService from '../services/ProductService';

export default function Checkout() {
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  const [form, setForm] = useState({
    customer_name: storedUser?.name || '',
    customer_phone: storedUser?.phone || '',
    shipping_address: storedUser?.address || '',
  });

  const formatPrice = (val) => `${Number(val || 0).toLocaleString('vi-VN')} ₫`;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    ProductService.getCart()
      .then((cartItems) => {
        // Tiền điều kiện UC-C2: Giỏ hàng phải có ít nhất 1 sản phẩm
        if (cartItems.length === 0) {
          window.location.href = '/cart';
          return;
        }
        setItems(cartItems);
      })
      .catch(() => {
        setErrorMsg('Không thể tải thông tin giỏ hàng để đặt hàng.');
      })
      .finally(() => setLoading(false));
  }, []);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.shipping_address.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên, Số điện thoại và Địa chỉ nhận hàng.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ProductService.createOrder(form);
      setCreatedOrder(res.data || { id: '' });
      setItems([]);
    } catch (err) {
      // Ngoại lệ UC-C2: Backend Rollback và trả lỗi "Sản phẩm X không đủ số lượng"
      setErrorMsg(
        err.response?.data?.message || 'Đặt hàng thất bại, vui lòng kiểm tra lại giỏ hàng.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-[#FCFBF9] min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-[#FAF8F5] border-b border-stone-200/70">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 text-xs text-stone-500 flex items-center gap-2">
            <a href="/" className="hover:text-[#9A5B13]">Trang chủ</a>
            <span>&rsaquo;</span>
            <a href="/cart" className="hover:text-[#9A5B13]">Giỏ hàng</a>
            <span>&rsaquo;</span>
            <span className="text-[#9A5B13] font-semibold">Đặt hàng (COD)</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {loading ? (
            <div className="py-16 text-center text-sm text-stone-500">
              Đang chuẩn bị thông tin đơn hàng...
            </div>
          ) : createdOrder ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-10 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xl flex items-center justify-center mx-auto">
                ✓
              </div>
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                Đặt hàng thành công!
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Đơn hàng {createdOrder.id ? <strong>#{createdOrder.id}</strong> : ''} của bạn đã được tạo ở trạng thái{' '}
                <strong>Chờ xử lý (pending)</strong> và thanh toán khi nhận hàng (COD).
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="/products"
                  className="bg-[#141414] hover:bg-stone-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Tiếp tục mua sắm
                </a>
                <a
                  href="/"
                  className="bg-[#FAF8F5] border border-stone-200 text-stone-800 text-xs font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Về trang chủ
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Cột trái: Form nhập Tên, SĐT, Địa chỉ nhận hàng */}
              <div className="lg:col-span-7 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] border-b border-stone-100 pb-3">
                  Thông Tin Nhận Hàng
                </h1>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Tên người nhận <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.customer_name}
                      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                      placeholder="Nhập họ và tên người nhận"
                      className="w-full min-w-0 bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#9A5B13]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Số điện thoại <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.customer_phone}
                      onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                      placeholder="Nhập số điện thoại liên hệ"
                      className="w-full min-w-0 bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#9A5B13]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Địa chỉ nhận hàng <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={form.shipping_address}
                      onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className="w-full min-w-0 bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#9A5B13]"
                    />
                  </div>

                  <div className="pt-2">
                    <div className="text-xs font-bold text-stone-700 mb-1.5">
                      Phương thức thanh toán
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#9A5B13] flex items-center justify-between text-xs font-semibold text-stone-900">
                      <span>Thanh toán tiền mặt khi nhận hàng (COD)</span>
                      <span className="text-[#9A5B13] font-bold">Mặc định</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: Tóm tắt sản phẩm từ cart_items & nút Đặt hàng */}
              <aside className="lg:col-span-5 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-stone-100 pb-3">
                  Đơn Hàng Của Bạn ({items.length})
                </h2>

                <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 truncate">{item.name}</div>
                        <div className="text-stone-500 mt-0.5">
                          {formatPrice(item.price)} &times; {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-stone-900 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-baseline justify-between">
                  <span className="text-xs font-bold uppercase text-stone-900">Tổng thanh toán</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#9A5B13]">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full bg-[#141414] hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs sm:text-sm font-semibold py-3.5 px-4 rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang xử lý đơn hàng...' : 'Đặt hàng'}
                </button>
              </aside>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}