import React, { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import CartView from "../components/CartView";
import LoginRequiredModal from "../components/LoginRequiredModal";
import ConfirmModal from "../components/ConfirmModal";
import ProductService from "../services/ProductService";
import { enrichBookWithSampleMeta } from "../data/homeMockData";

function resolveProductImage(item) {
  const raw =
    item?.image ||
    item?.image_path ||
    item?.image_url ||
    item?.thumbnail ||
    item?.product?.image ||
    item?.product?.image_path ||
    item?.product?.thumbnail ||
    "";

  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const clean = trimmed.replace(/^\/+/, "");
  if (clean.startsWith("public/")) {
    return `/storage/${clean.slice(7)}`;
  }
  if (
    clean.startsWith("storage/") ||
    clean.startsWith("images/") ||
    clean.startsWith("img/") ||
    clean.startsWith("uploads/") ||
    clean.startsWith("assets/")
  ) {
    return `/${clean}`;
  }

  return `/storage/${clean}`;
}

function getFallbackImageUrl(url) {
  if (!url || /^https?:\/\//i.test(url) || url.startsWith("data:")) return null;
  if (url.startsWith("/storage/")) return `/${url.slice(9)}`;
  if (url.startsWith("/")) return `/storage${url}`;
  return null;
}

/**
 * SMART COMPONENT: Tải dữ liệu giỏ hàng, đồng bộ real-time nhiều tab/trình duyệt, chặn số lượng âm
 */
export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [noticeMsg, setNoticeMsg] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);

  const loadCart = useCallback(async (silent = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setShowLoginModal(true);
      return;
    }

    if (!silent) {
      setLoading(true);
      setErrorMsg("");
    }
    try {
      const cartItems = await ProductService.getCart();
      setItems(Array.isArray(cartItems) ? cartItems : []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLoginModal(true);
      } else if (!silent) {
        setErrorMsg(
          err.response?.data?.message || "Không thể tải dữ liệu giỏ hàng."
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCart(false);

    // 1. Tự động tải lại giỏ hàng khi người dùng đăng nhập qua AuthModal
    const handleUserUpdated = () => {
      if (localStorage.getItem("token")) {
        setShowLoginModal(false);
        loadCart(false);
      }
    };

    // 2. Đồng bộ danh sách trong trang /cart ngay khi tab khác hoặc Header cập nhật giỏ
    const handleCartUpdated = () => {
      loadCart(true);
    };

    const handleStorageChange = (e) => {
      if (e.key === "bookhouse_cart_sync") {
        loadCart(true);
      }
    };

    // 3. Đồng bộ ngay khi chuyển từ trình duyệt/cửa sổ khác quay lại tab Giỏ hàng
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && localStorage.getItem("token")) {
        loadCart(true);
      }
    };

    // 4. Đồng bộ định kỳ mỗi 8 giây cho trường hợp mở 2 trình duyệt khác nhau (Chrome & Edge)
    const syncInterval = setInterval(() => {
      if (document.visibilityState === "visible" && localStorage.getItem("token")) {
        loadCart(true);
      }
    }, 8000);

    window.addEventListener("user-updated", handleUserUpdated);
    window.addEventListener("cart-updated", handleCartUpdated);
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("user-updated", handleUserUpdated);
      window.removeEventListener("cart-updated", handleCartUpdated);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadCart]);

  // Chuẩn hóa & bổ sung đầy đủ thông tin sách cho từng dòng sản phẩm trong giỏ
  const enrichedItems = useMemo(() => {
    return items.map((item) => {
      const productObj = item.product || {};
      const productId = item.product_id || productObj.id || item.id;
      const cleanTitle = (
        item.name ||
        item.title ||
        productObj.title ||
        productObj.name ||
        "Ấn phẩm BookHouse"
      ).normalize("NFC");
      const cleanAuthor = (
        item.author ||
        productObj.author ||
        "Đang cập nhật"
      ).normalize("NFC");

      const enrichedBook = enrichBookWithSampleMeta({
        ...productObj,
        ...item,
        id: productId,
        title: cleanTitle,
        author: cleanAuthor,
      });

      const categoryName =
        typeof enrichedBook.category === "object"
          ? enrichedBook.category?.name
          : enrichedBook.category;

      const resolvedImage = resolveProductImage(item);

      return {
        ...item,
        productId,
        title: cleanTitle,
        author: cleanAuthor,
        publisher: enrichedBook.publisher || "Đang cập nhật",
        publishYear: enrichedBook.publish_year || "",
        coverType: enrichedBook.cover_type || "Bìa mềm",
        pages: enrichedBook.pages || "",
        rating: Number(enrichedBook.rating || 0),
        categoryId: enrichedBook.category_id || "",
        categoryName: categoryName || "",
        originalPrice: Number(enrichedBook.original_price || 0),
        stock: Number(item.stock ?? productObj.stock ?? enrichedBook.stock ?? 0),
        quantity: Math.max(1, Number(item.quantity || 1)),
        resolvedImage,
        fallbackImage: getFallbackImageUrl(resolvedImage),
      };
    });
  }, [items]);

  const totalBooks = useMemo(
    () =>
      enrichedItems.reduce((sum, item) => sum + Math.max(1, Number(item.quantity || 0)), 0),
    [enrichedItems]
  );

  const subtotal = useMemo(
    () =>
      enrichedItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Math.max(1, Number(item.quantity || 0)),
        0
      ),
    [enrichedItems]
  );

  const handleUpdateQuantity = async (item, nextQty) => {
    const safeQty = parseInt(nextQty, 10);
    // Chặn tuyệt đối số lượng âm hoặc <= 0 kể cả khi người dùng mở F12 sửa DOM/HTML
    if (!Number.isFinite(safeQty) || safeQty < 1 || updatingId === item.id) {
      if (Number.isFinite(safeQty) && safeQty < 1) {
        setErrorMsg("Số lượng sản phẩm tối thiểu là 1 cuốn.");
      }
      return;
    }

    if (item.stock > 0 && safeQty > item.stock) {
      setErrorMsg(
        `Sách "${item.title}" chỉ còn ${item.stock} cuốn trong kho.`
      );
      return;
    }

    setErrorMsg("");
    setNoticeMsg("");
    setUpdatingId(item.id);
    try {
      await ProductService.updateCartItem(item.id, safeQty);
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, quantity: safeQty } : row
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

  const handleConfirmRemove = async () => {
    if (!removingItem || updatingId === removingItem.id) return;
    const target = removingItem;

    setErrorMsg("");
    setNoticeMsg("");
    setUpdatingId(target.id);
    try {
      await ProductService.removeCartItem(target.id);
      setItems((prev) => prev.filter((row) => row.id !== target.id));
      window.dispatchEvent(new CustomEvent("cart-updated"));
      setNoticeMsg(`Đã xóa "${target.title}" khỏi giỏ hàng.`);
      setRemovingItem(null);
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
      <CartView
        items={enrichedItems}
        totalBooks={totalBooks}
        subtotal={subtotal}
        loading={loading}
        updatingId={updatingId}
        errorMsg={errorMsg}
        noticeMsg={noticeMsg}
        onUpdateQuantity={handleUpdateQuantity}
        onRequestRemove={(item) => setRemovingItem(item)}
      />

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Popup xác nhận dùng chung khi bấm xóa sản phẩm khỏi giỏ */}
      <ConfirmModal
        open={Boolean(removingItem)}
        variant="danger"
        title="Xóa sản phẩm khỏi giỏ hàng"
        message="Bạn có chắc chắn muốn xóa cuốn sách này khỏi giỏ ấn phẩm không?"
        detailText={
          removingItem
            ? `${removingItem.title} (${removingItem.quantity} cuốn)`
            : ""
        }
        confirmText="Xóa khỏi giỏ"
        cancelText="Giữ lại"
        loading={Boolean(removingItem && updatingId === removingItem.id)}
        onConfirm={handleConfirmRemove}
        onCancel={() => !updatingId && setRemovingItem(null)}
      />
    </MainLayout>
  );
}