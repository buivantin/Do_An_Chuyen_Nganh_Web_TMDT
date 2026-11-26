import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import ProductDetailView from "../components/ProductDetailView";
import LoginRequiredModal from "../components/LoginRequiredModal";
import ProductService from "../services/ProductService";
import { resolveBookImageUrl } from "../components/ProductCard";

function extractProductIdFromUrl() {
  if (typeof window === "undefined") return null;
  const parts = window.location.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return last && !Number.isNaN(Number(last)) ? Number(last) : last || null;
}

export default function ProductDetail({ productId: propProductId = null }) {
  const productId = propProductId || extractProductIdFromUrl();

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

  // Tải chi tiết sản phẩm 100% từ DB qua /api/products/{id}
  useEffect(() => {
    if (!productId) {
      setError("Không xác định được mã sản phẩm.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    setQuantity(1);

    axios
      .get(`/api/products/${productId}`, {
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        if (!active) return;
        const raw = res.data?.data || res.data;
        if (!raw || !raw.id) {
          setError("Không tìm thấy thông tin sách trong hệ thống.");
          setBook(null);
          return;
        }

        const normalized = {
          ...raw,
          title: raw.name || raw.title || "Ấn phẩm đang cập nhật",
          name: raw.name || raw.title || "Ấn phẩm đang cập nhật",
          publish_year:
            raw.published_year ??
            raw.publish_year ??
            raw.publication_year ??
            raw.nam_xuat_ban ??
            "",
          pages: raw.page_count ?? raw.pages ?? null,
          rating: Number(raw.rating ?? raw.avg_rating ?? 0),
          reviews_count: Number(raw.reviews_count ?? 0),
          sold_count: Number(raw.sold_count ?? 0),
          stock: Number(raw.stock ?? 0),
          discount: Number(raw.discount ?? raw.discount_percent ?? 0),
        };

        setBook(normalized);

        // Lấy sách cùng danh mục từ DB
        const catId =
          normalized.category_id ||
          (typeof normalized.category === "object"
            ? normalized.category?.id
            : null);

        if (catId) {
          axios
            .get(`/api/products?category_id=${catId}&per_page=5`, {
              headers: { Accept: "application/json" },
            })
            .then((relRes) => {
              if (!active) return;
              const list = Array.isArray(relRes.data?.data)
                ? relRes.data.data
                : Array.isArray(relRes.data?.data?.data)
                ? relRes.data.data.data
                : [];
              setRelatedBooks(
                list
                  .filter((item) => String(item.id) !== String(normalized.id))
                  .slice(0, 4)
              );
            })
            .catch(() => {
              if (active) setRelatedBooks([]);
            });
        } else {
          setRelatedBooks([]);
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Không thể tải dữ liệu chi tiết sách từ hệ thống.");
        setBook(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  // Đồng bộ điểm sao & số lượng đánh giá thật từ ProductReviews lên phần đầu trang
  const handleReviewStatsLoaded = useCallback((stats) => {
    if (!stats) return;
    setBook((prev) =>
      prev
        ? {
            ...prev,
            rating: Number(stats.average_rating ?? 0),
            reviews_count: Number(stats.total_reviews ?? 0),
          }
        : prev
    );
  }, []);

  const handleDecreaseQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncreaseQty = () => {
    const maxStock = Number(book?.stock || 1);
    setQuantity((q) => Math.min(Math.max(1, maxStock), q + 1));
  };

  const handleAddToCart = async () => {
    if (!book || Number(book.stock || 0) <= 0 || submitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoginModalOpen(true);
      return;
    }

    setSubmitting(true);
    setCartNotice({ type: "", text: "" });
    try {
      await ProductService.addToCart(book.id, quantity);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      setCartNotice({
        type: "success",
        text: `Đã thêm ${quantity} cuốn "${book.name}" vào giỏ hàng.`,
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        setLoginModalOpen(true);
        return;
      }
      setCartNotice({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    if (!book || Number(book.stock || 0) <= 0 || submitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoginModalOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      await ProductService.addToCart(book.id, quantity);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      window.location.href = "/cart";
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        setLoginModalOpen(true);
        return;
      }
      setCartNotice({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Không thể thực hiện mua ngay, vui lòng thử lại.",
      });
      setSubmitting(false);
    }
  };

  const handleAddRelatedToCart = async (item) => {
    if (!item) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setLoginModalOpen(true);
      return;
    }
    try {
      await ProductService.addToCart(item.id, 1);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      setCartNotice({
        type: "success",
        text: `Đã thêm "${item.name || item.title}" vào giỏ hàng.`,
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        setLoginModalOpen(true);
        return;
      }
      setCartNotice({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng.",
      });
    }
  };

  const handleScrollToReviews = () => {
    const el = document.getElementById("product-reviews");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const {
    imageUrl,
    formattedPrice,
    formattedOriginalPrice,
    discountPercent,
    specRows,
  } = useMemo(() => {
    if (!book) {
      return {
        imageUrl: "",
        formattedPrice: "",
        formattedOriginalPrice: "",
        discountPercent: 0,
        specRows: [],
      };
    }

    const basePrice = Number(book.price || 0);
    const discount = Math.min(Math.max(Number(book.discount || 0), 0), 100);
    const finalPrice =
      discount > 0 ? Math.round(basePrice * (1 - discount / 100)) : basePrice;

    const categoryName =
      typeof book.category === "object" ? book.category?.name : book.category;

    const rows = [
      {
        label: "Tác giả",
        value: book.author || "Đang cập nhật",
        href: book.author
          ? `/products?author=${encodeURIComponent(book.author)}`
          : null,
      },
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
        label: "Thể loại",
        value: categoryName || "Đang cập nhật",
        href: book.category_id
          ? `/products?category_id=${book.category_id}`
          : null,
      },
      ...(book.pages
        ? [{ label: "Số trang", value: `${book.pages} trang` }]
        : []),
      ...(book.cover_type
        ? [{ label: "Hình thức bìa", value: book.cover_type }]
        : []),
      ...(book.isbn ? [{ label: "Mã ISBN", value: book.isbn }] : []),
    ];

    return {
      imageUrl: resolveBookImageUrl(book.image_path || book.image),
      formattedPrice: `${finalPrice.toLocaleString("vi-VN")}đ`,
      formattedOriginalPrice:
        discount > 0 ? `${basePrice.toLocaleString("vi-VN")}đ` : "",
      discountPercent: discount,
      specRows: rows,
    };
  }, [book]);

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
        onDecreaseQty={handleDecreaseQty}
        onIncreaseQty={handleIncreaseQty}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleDesc={() => setDescExpanded((v) => !v)}
        onToggleZoom={(val) =>
          setZoomOpen(typeof val === "boolean" ? val : !zoomOpen)
        }
        onScrollToReviews={handleScrollToReviews}
        onAddRelatedToCart={handleAddRelatedToCart}
        onReviewStatsLoaded={handleReviewStatsLoaded}
      />

      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </MainLayout>
  );
}