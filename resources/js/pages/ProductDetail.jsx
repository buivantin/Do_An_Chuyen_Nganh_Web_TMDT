import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ProductDetailView from "../components/ProductDetailView";
import LoginRequiredModal from "../components/LoginRequiredModal";
import ProductService from "../services/ProductService";
import { enrichBookWithSampleMeta } from "../data/homeMockData";

function resolveBookImageUrl(path) {
  if (!path) return "https://via.placeholder.com/300x400?text=BookHouse";
  const raw = String(path).trim();
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  const clean = raw.replace(/^\/+/, "");
  if (clean.startsWith("public/")) return `/storage/${clean.slice(7)}`;
  if (clean.startsWith("storage/") || clean.startsWith("imgs/")) {
    return `/${clean}`;
  }
  return `/storage/${clean}`;
}

/**
 * SMART COMPONENT: Tải dữ liệu chi tiết sách, bổ sung metadata NXB/Năm XB, xử lý giỏ hàng & đăng nhập
 */
export default function ProductDetail({ productId }) {
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartNotice, setCartNotice] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setQuantity(1);
    setDescExpanded(false);
    setZoomOpen(false);
    setCartNotice({ type: "", text: "" });

    ProductService.getById(productId)
      .then(async (detail) => {
        if (!active) return;
        const enrichedDetail = enrichBookWithSampleMeta(detail);
        setBook(enrichedDetail);

        if (enrichedDetail.category_id) {
          const res = await ProductService.search(
            "",
            enrichedDetail.category_id,
            "",
            "",
            "newest",
            1
          );
          if (!active) return;
          const sameCategory = (res.items || [])
            .filter((item) => Number(item.id) !== Number(enrichedDetail.id))
            .slice(0, 4)
            .map(enrichBookWithSampleMeta);
          setRelatedBooks(sameCategory);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.response?.status === 404
            ? "Sản phẩm không tồn tại hoặc đã bị ẩn."
            : "Không thể tải thông tin sách từ hệ thống."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  const handleAddToCart = async (
    targetBook = book,
    qty = quantity,
    { redirectToCart = false } = {}
  ) => {
    if (!targetBook) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoginModalOpen(true);
      return;
    }

    if (Number(targetBook.stock || 0) <= 0) return;

    setSubmitting(true);
    setCartNotice({ type: "", text: "" });

    try {
      await ProductService.addToCart(targetBook.id, qty);
      window.dispatchEvent(new CustomEvent("cart-updated"));

      if (redirectToCart) {
        window.location.href = "/cart";
        return;
      }

      setCartNotice({
        type: "success",
        text: `Đã thêm ${qty} cuốn "${targetBook.title}" vào giỏ hàng.`,
      });
    } catch (err) {
      setCartNotice({
        type: "error",
        text:
          err.response?.data?.message ||
          "Không thể thêm vào giỏ hàng, vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const {
    formattedPrice,
    formattedOriginalPrice,
    discountPercent,
    specRows,
    imageUrl,
  } = useMemo(() => {
    if (!book) {
      return {
        formattedPrice: "",
        formattedOriginalPrice: "",
        discountPercent: 0,
        specRows: [],
        imageUrl: "",
      };
    }

    const price = Number(book.price || 0);
    const originalPrice = Number(book.original_price || 0);
    const hasDiscount = originalPrice > price;
    const discount = hasDiscount
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const categoryName =
      typeof book.category === "object" ? book.category?.name : book.category;

    const rows = [
      {
        label: "Nhà xuất bản",
        value: book.publisher || "Đang cập nhật",
        href: book.publisher
          ? `/products?publisher=${encodeURIComponent(book.publisher)}`
          : null,
      },
      {
        label: "Năm xuất bản",
        value: book.publish_year || "Đang cập nhật",
      },
      {
        label: "Tác giả",
        value: book.author || "Đang cập nhật",
        href: book.author
          ? `/products?author=${encodeURIComponent(book.author)}`
          : null,
      },
      ...(book.translator
        ? [{ label: "Dịch giả", value: book.translator }]
        : []),
      {
        label: "Thể loại",
        value: categoryName || "Tổng hợp",
        href: book.category_id
          ? `/products?category_id=${book.category_id}`
          : null,
      },
      {
        label: "Số trang",
        value: book.pages ? `${book.pages} trang` : "Đang cập nhật",
      },
      {
        label: "Hình thức bìa",
        value: book.cover_type || "Bìa mềm",
      },
      {
        label: "Ngôn ngữ",
        value: book.language || "Tiếng Việt",
      },
      {
        label: "Mã ISBN",
        value: book.isbn || `978-604-${String(book.id || 1000).padStart(4, "0")}`,
      },
    ];

    return {
      formattedPrice: `${price.toLocaleString("vi-VN")} ₫`,
      formattedOriginalPrice: hasDiscount
        ? `${originalPrice.toLocaleString("vi-VN")} ₫`
        : "",
      discountPercent: discount,
      specRows: rows,
      imageUrl: resolveBookImageUrl(book.image || book.image_path),
    };
  }, [book]);

  const handleScrollToReviews = () => {
    const el = document.getElementById("product-reviews");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <MainLayout>
      <ProductDetailView
        book={book}
        relatedBooks={relatedBooks}
        quantity={quantity}
        loading={loading}
        error={error}
        cartNotice={cartNotice}
        submitting={submitting}
        descExpanded={descExpanded}
        zoomOpen={zoomOpen}
        imageUrl={imageUrl}
        formattedPrice={formattedPrice}
        formattedOriginalPrice={formattedOriginalPrice}
        discountPercent={discountPercent}
        specRows={specRows}
        onDecreaseQty={() => setQuantity((q) => Math.max(1, q - 1))}
        onIncreaseQty={() =>
          setQuantity((q) => Math.min(Number(book?.stock || 1), q + 1))
        }
        onAddToCart={() => handleAddToCart(book, quantity)}
        onBuyNow={() =>
          handleAddToCart(book, quantity, { redirectToCart: true })
        }
        onToggleDesc={() => setDescExpanded((v) => !v)}
        onToggleZoom={setZoomOpen}
        onScrollToReviews={handleScrollToReviews}
        onAddRelatedToCart={(selected) => handleAddToCart(selected, 1)}
      />

      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </MainLayout>
  );
}