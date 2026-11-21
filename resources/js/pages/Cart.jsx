import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import LoginRequiredModal from "../components/LoginRequiredModal";
import CheckoutStepper from "../components/CheckoutStepper";
import ProductService from "../services/ProductService";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const loadCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const cartItems = await ProductService.getCart();
      setItems(Array.isArray(cartItems) ? cartItems : []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLoginModal(true);
      } else {
        setErrorMsg(
          err.response?.data?.message || "Không thể tải dữ liệu giỏ hàng."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const totalBooks = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const handleUpdateQuantity = async (item, nextQty) => {
    if (nextQty < 1 || updatingId === item.id) return;
    if (item.stock > 0 && nextQty > item.stock) {
      setErrorMsg(`Sách "${item.name}" chỉ còn ${item.stock} cuốn trong kho.`);
      return;
    }

    setErrorMsg("");
    setUpdatingId(item.id);
    try {
      await ProductService.updateCartItem(item.id, nextQty);
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, quantity: nextQty } : row
        )
      );
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Không thể cập nhật số lượng sản phẩm."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item) => {
    if (updatingId === item.id) return;
    setErrorMsg("");
    setUpdatingId(item.id);
    try {
      await ProductService.removeCartItem(item.id);
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Không thể xóa sản phẩm khỏi giỏ hàng."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <MainLayout>
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb đồng bộ Checkout */}
        <nav className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <a href="/" className="hover:text-[#9A5B13] transition">
            Trang chủ
          </a>
          <span>&rsaquo;</span>
          <span className="text-[#9A5B13]">Giỏ ấn phẩm</span>
        </nav>

        {/* Tiêu đề & Thanh tiến trình 3 bước */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#9A5B13]">
              Quy trình hoàn tất bản đặt
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A1A1A] mt-1 tracking-tight">
              Giỏ Ấn Phẩm Của Bạn
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Hiện có {items.length} đầu sách ({totalBooks} cuốn) trong giỏ
            </p>
          </div>

          <CheckoutStepper
            currentStep={1}
            canProceedCheckout={items.length > 0}
          />
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-stone-500">
            Đang tải giỏ hàng...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#9A5B13]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-6 h-6"
              >
                <path d="M6 7h12l1 13H5L6 7Z" strokeLinejoin="round" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Hãy khám phá thêm các đầu sách hay và thêm vào giỏ nhé.
            </p>
            <div className="pt-2">
              <a
                href="/products"
                className="inline-block bg-[#141414] hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition"
              >
                Tiếp tục mua sắm
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-7 space-y-3.5">
              {items.map((item) => {
                const cleanName = (item.name || "").normalize("NFC");
                const isBusy = updatingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-stone-200/80 rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-center shadow-2xs"
                  >
                    <a
                      href={`/products/${item.product_id}`}
                      className="w-20 sm:w-24 aspect-[3/4] bg-[#EAEAEA] rounded-xl p-2 flex items-center justify-center shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={cleanName}
                        className="h-full object-contain shadow-sm"
                      />
                    </a>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <a
                        href={`/products/${item.product_id}`}
                        className="font-serif text-base sm:text-lg font-bold text-stone-900 hover:text-[#9A5B13] line-clamp-2 block"
                      >
                        {cleanName}
                      </a>
                      <p className="text-xs text-stone-500 truncate">
                        {item.author?.normalize("NFC")}
                      </p>
                      <div className="text-sm sm:text-base font-bold text-[#9A5B13]">
                        {Number(item.price || 0).toLocaleString("vi-VN")} ₫
                      </div>

                      {/* Cụm tăng/giảm số lượng & nút xóa */}
                      <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex items-center border border-stone-200 rounded-lg bg-[#FAF8F5]">
                          <button
                            type="button"
                            disabled={isBusy || item.quantity <= 1}
                            onClick={() =>
                              handleUpdateQuantity(item, item.quantity - 1)
                            }
                            className="w-7 h-7 sm:w-8 sm:h-8 text-sm font-bold text-stone-700 hover:bg-stone-200/60 disabled:opacity-40 rounded-l-lg cursor-pointer"
                          >
                            &minus;
                          </button>
                          <span className="px-3 text-xs sm:text-sm font-semibold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              handleUpdateQuantity(item, item.quantity + 1)
                            }
                            className="w-7 h-7 sm:w-8 sm:h-8 text-sm font-bold text-stone-700 hover:bg-stone-200/60 disabled:opacity-40 rounded-r-lg cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleRemove(item)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-40 cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tóm tắt đơn hàng đồng bộ Checkout */}
            <aside className="lg:col-span-5 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xs lg:sticky lg:top-6">
              <div className="border-b border-stone-100 pb-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9A5B13]">
                  Tuyển thư ký gửi
                </div>
                <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mt-0.5">
                  Tóm Tắt Đơn Hàng
                </h2>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính ấn phẩm ({totalBooks} cuốn)</span>
                  <span className="font-bold text-stone-900">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Phí vận chuyển tiêu chuẩn</span>
                  <span className="font-bold text-[#9A5B13]">Miễn phí (0đ)</span>
                </div>
              </div>

              <div className="bg-[#F3EFEA] border border-stone-200/70 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                    Tổng thanh toán
                    <br />
                    tạm tính
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    (Đã bao gồm thuế GTGT)
                  </div>
                </div>

                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight text-right">
                  {subtotal.toLocaleString("vi-VN")}
                  <span className="text-base sm:text-lg font-sans font-bold ml-0.5">
                    đ
                  </span>
                </div>
              </div>

              <a
                href="/checkout"
                className="w-full bg-[#141414] hover:bg-stone-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
              >
                <span>Tiến hành giao nhận &amp; thanh toán</span>
                <span>&rarr;</span>
              </a>
            </aside>
          </div>
        )}
      </div>
    </MainLayout>
  );
}