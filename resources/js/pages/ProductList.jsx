import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import ProductListView from "../components/ProductListView";
import LoginRequiredModal from "../components/LoginRequiredModal";
import ProductService from "../services/ProductService";

const PER_PAGE = 12;

function readUrlParams() {
  const sp = new URLSearchParams(window.location.search);

  const rawCat = sp.get("category_id") || "";
  const categoryIds = rawCat
    ? rawCat
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const authorsFromRepeated = sp.getAll("author").filter(Boolean);
  const authorsFromCsv = (sp.get("authors") || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const authors = Array.from(
    new Set([...authorsFromRepeated, ...authorsFromCsv])
  );

  const pubsFromRepeated = sp.getAll("publisher").filter(Boolean);
  const pubsFromCsv = (sp.get("publishers") || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const publishers = Array.from(
    new Set([...pubsFromRepeated, ...pubsFromCsv])
  );

  return {
    keyword: sp.get("keyword") || "",
    categoryIds,
    authors,
    publishers,
    minRating: sp.get("min_rating") || "",
    minYear: sp.get("min_year") || "",
    maxYear: sp.get("max_year") || "",
    minPrice: sp.get("min_price") || "",
    maxPrice: sp.get("max_price") || "",
    sort: sp.get("sort") || "bestseller",
    page: Math.max(1, Number(sp.get("page")) || 1),
  };
}

/**
 * SMART COMPONENT: Phân trang & lọc trực tiếp qua Server API (tối ưu cho hàng nghìn đầu sách)
 */
export default function ProductList({
  products = null,
  categories: propCategories = null,
  onAddToCart,
}) {
  const isFromProp = Array.isArray(products);

  const [categories, setCategories] = useState(propCategories || []);
  const [books, setBooks] = useState(() => (isFromProp ? products : []));
  const [pagination, setPagination] = useState(() => ({
    currentPage: 1,
    lastPage: 1,
    total: isFromProp ? products.length : 0,
  }));

  const [authorOptions, setAuthorOptions] = useState([]);
  const [publisherOptions, setPublisherOptions] = useState([]);

  const [filters, setFilters] = useState(readUrlParams);
  const [priceRange, setPriceRange] = useState(() => {
    const init = readUrlParams();
    return { min: init.minPrice, max: init.maxPrice };
  });
  const [yearRange, setYearRange] = useState(() => {
    const init = readUrlParams();
    return { min: init.minYear, max: init.maxYear };
  });
  const [authorSearch, setAuthorSearch] = useState("");
  const [publisherSearch, setPublisherSearch] = useState("");
  const [openSections, setOpenSections] = useState({
    categories: true,
    rating: true,
    authors: true,
    publishers: true,
    publishYear: true,
    price: true,
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(!isFromProp);
  const [error, setError] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cartToast, setCartToast] = useState({ type: "", text: "" });

  // State & Ref đo vị trí fixed của thanh sắp xếp ngay dưới Navbar
  const sortBarRef = useRef(null);
  const [sortBarMetrics, setSortBarMetrics] = useState({
    top: 0,
    spacerHeight: 52,
    sidebarStickyTop: 168,
  });

  useEffect(() => {
    const headerEl =
      document.getElementById("bookhouse-header") ||
      document.querySelector("header");
    const navEl = document.querySelector("nav");

    const syncSortBarPosition = () => {
      let top = 0;
      if (navEl) {
        top = Math.max(0, Math.round(navEl.getBoundingClientRect().bottom));
      } else if (headerEl) {
        top = Math.max(0, Math.round(headerEl.getBoundingClientRect().bottom));
      }

      const barHeight = sortBarRef.current
        ? Math.round(sortBarRef.current.getBoundingClientRect().height)
        : 52;

      setSortBarMetrics({
        top,
        spacerHeight: barHeight,
        sidebarStickyTop: top + barHeight + 16,
      });
    };

    syncSortBarPosition();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncSortBarPosition)
        : null;
    if (observer) {
      if (headerEl) observer.observe(headerEl);
      if (navEl) observer.observe(navEl);
      if (sortBarRef.current) observer.observe(sortBarRef.current);
    }
    window.addEventListener("resize", syncSortBarPosition);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncSortBarPosition);
    };
  }, []);

  // Khóa cuộn trang nền khi mở Drawer bộ lọc trên Mobile
  useEffect(() => {
    if (!mobileFilterOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileFilterOpen]);

  // Lấy danh mục từ DB
  useEffect(() => {
    if (Array.isArray(propCategories) && propCategories.length > 0) {
      setCategories(propCategories);
      return;
    }

    ProductService.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [propCategories]);

  // Lấy danh sách Tác giả & Nhà xuất bản cho Sidebar từ endpoint nhẹ riêng biệt
  useEffect(() => {
    if (isFromProp) {
      const authorMap = new Map();
      const pubMap = new Map();
      products.forEach((b) => {
        const a = String(b.author || "").trim();
        if (a && a.toLowerCase() !== "đang cập nhật") {
          authorMap.set(a, (authorMap.get(a) || 0) + 1);
        }
        const p = String(b.publisher || "").trim();
        if (p) pubMap.set(p, (pubMap.get(p) || 0) + 1);
      });
      setAuthorOptions(
        Array.from(authorMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name, "vi"))
      );
      setPublisherOptions(
        Array.from(pubMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name, "vi"))
      );
      return;
    }

    let active = true;
    axios
      .get("/api/products/filter-options", {
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        if (!active) return;
        const authors = (res.data?.authors || []).sort((a, b) =>
          String(a.name).localeCompare(String(b.name), "vi")
        );
        const publishers = (res.data?.publishers || []).sort((a, b) =>
          String(a.name).localeCompare(String(b.name), "vi")
        );
        setAuthorOptions(authors);
        setPublisherOptions(publishers);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [isFromProp, products]);

  // Tải đúng 12 cuốn sách của trang hiện tại theo điều kiện lọc từ API
  useEffect(() => {
    if (isFromProp) {
      const total = products.length;
      const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
      const currentPage = Math.min(Math.max(1, filters.page), lastPage);
      const start = (currentPage - 1) * PER_PAGE;
      setBooks(products.slice(start, start + PER_PAGE));
      setPagination({ currentPage, lastPage, total });
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("page", String(filters.page));
    params.set("per_page", String(PER_PAGE));

    if (filters.keyword.trim()) {
      params.set("search", filters.keyword.trim());
    }
    if (filters.categoryIds.length > 0) {
      params.set("category_id", filters.categoryIds.join(","));
    }
    filters.authors.forEach((a) => params.append("author[]", a));
    filters.publishers.forEach((p) => params.append("publisher[]", p));

    if (filters.minRating !== "") {
      params.set("min_rating", String(filters.minRating));
    }
    if (filters.minYear !== "") {
      params.set("min_year", String(filters.minYear));
    }
    if (filters.maxYear !== "") {
      params.set("max_year", String(filters.maxYear));
    }
    if (filters.minPrice !== "") {
      params.set("min_price", String(filters.minPrice));
    }
    if (filters.maxPrice !== "") {
      params.set("max_price", String(filters.maxPrice));
    }
    if (filters.sort) {
      params.set("sort", filters.sort);
    }

    axios
      .get(`/api/products?${params.toString()}`, {
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        if (!active) return;
        const payload = res.data || {};
        const rawList = Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.data?.data)
          ? payload.data.data
          : [];

        const meta = payload.meta || payload;
        const total = Number(meta.total ?? rawList.length);
        const lastPage = Math.max(
          1,
          Number(meta.last_page ?? Math.ceil(total / PER_PAGE))
        );
        const currentPage = Math.min(
          Math.max(1, Number(meta.current_page ?? filters.page)),
          lastPage
        );

        setBooks(rawList);
        setPagination({ currentPage, lastPage, total });
      })
      .catch(() => {
        if (!active) return;
        setBooks([]);
        setPagination({ currentPage: 1, lastPage: 1, total: 0 });
        setError("Không thể tải dữ liệu sách từ hệ thống.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isFromProp, products, filters]);

  // Đồng bộ URL trình duyệt
  useEffect(() => {
    const sp = new URLSearchParams();
    if (filters.keyword) sp.set("keyword", filters.keyword);
    if (filters.categoryIds.length > 0) {
      sp.set("category_id", filters.categoryIds.join(","));
    }
    filters.authors.forEach((a) => sp.append("author", a));
    filters.publishers.forEach((p) => sp.append("publisher", p));
    if (filters.minRating) sp.set("min_rating", filters.minRating);
    if (filters.minYear !== "") sp.set("min_year", filters.minYear);
    if (filters.maxYear !== "") sp.set("max_year", filters.maxYear);
    if (filters.minPrice !== "") sp.set("min_price", filters.minPrice);
    if (filters.maxPrice !== "") sp.set("max_price", filters.maxPrice);
    if (filters.sort && filters.sort !== "bestseller") {
      sp.set("sort", filters.sort);
    }
    if (filters.page > 1) sp.set("page", filters.page);

    const nextUrl = `${window.location.pathname}${
      sp.toString() ? `?${sp.toString()}` : ""
    }`;
    window.history.pushState({}, "", nextUrl);
  }, [filters]);

  // Nút Back/Forward trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const next = readUrlParams();
      setFilters(next);
      setPriceRange({ min: next.minPrice, max: next.maxPrice });
      setYearRange({ min: next.minYear, max: next.maxYear });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const filteredAuthors = useMemo(() => {
    const q = authorSearch.trim().toLowerCase();
    if (!q) return authorOptions;
    return authorOptions.filter((a) => a.name.toLowerCase().includes(q));
  }, [authorOptions, authorSearch]);

  const filteredPublishers = useMemo(() => {
    const q = publisherSearch.trim().toLowerCase();
    if (!q) return publisherOptions;
    return publisherOptions.filter((p) => p.name.toLowerCase().includes(q));
  }, [publisherOptions, publisherSearch]);

  const updateFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const handleToggleCategory = (catId) => {
    setFilters((prev) => {
      const exists = prev.categoryIds.includes(catId);
      const next = exists
        ? prev.categoryIds.filter((id) => id !== catId)
        : [...prev.categoryIds, catId];
      return { ...prev, categoryIds: next, page: 1 };
    });
  };

  const handleToggleAuthor = (authorName) => {
    setFilters((prev) => {
      const exists = prev.authors.includes(authorName);
      const next = exists
        ? prev.authors.filter((a) => a !== authorName)
        : [...prev.authors, authorName];
      return { ...prev, authors: next, page: 1 };
    });
  };

  const handleTogglePublisher = (pubName) => {
    setFilters((prev) => {
      const exists = prev.publishers.includes(pubName);
      const next = exists
        ? prev.publishers.filter((p) => p !== pubName)
        : [...prev.publishers, pubName];
      return { ...prev, publishers: next, page: 1 };
    });
  };

  const handleResetAll = () => {
    setPriceRange({ min: "", max: "" });
    setYearRange({ min: "", max: "" });
    setAuthorSearch("");
    setPublisherSearch("");
    setFilters({
      keyword: "",
      categoryIds: [],
      authors: [],
      publishers: [],
      minRating: "",
      minYear: "",
      maxYear: "",
      minPrice: "",
      maxPrice: "",
      sort: "bestseller",
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.lastPage ||
      newPage === pagination.currentPage
    ) {
      return;
    }
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDefaultAddToCart = async (book) => {
    if (typeof onAddToCart === "function") {
      await onAddToCart(book);
      return;
    }
    if (!book) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoginModalOpen(true);
      return;
    }

    try {
      await ProductService.addToCart(book.id, 1);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      setCartToast({
        type: "success",
        text: `Đã thêm "${book.name || book.title}" vào giỏ hàng.`,
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        setLoginModalOpen(true);
        return;
      }
      setCartToast({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Không thể thêm vào giỏ hàng, vui lòng thử lại.",
      });
    } finally {
      setTimeout(() => setCartToast({ type: "", text: "" }), 3000);
    }
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.keyword) {
      chips.push({
        key: "keyword",
        label: `Từ khóa: "${filters.keyword}"`,
        onRemove: () => updateFilter({ keyword: "" }),
      });
    }
    filters.categoryIds.forEach((catId) => {
      const cat = categories.find((c) => String(c.id) === String(catId));
      chips.push({
        key: `cat-${catId}`,
        label: cat ? cat.name : `Thể loại #${catId}`,
        onRemove: () => handleToggleCategory(catId),
      });
    });
    if (filters.minRating) {
      chips.push({
        key: "rating",
        label:
          filters.minRating === "5"
            ? "Đánh giá: 5 ★"
            : `Đánh giá: Từ ${filters.minRating} ★`,
        onRemove: () => updateFilter({ minRating: "" }),
      });
    }
    filters.authors.forEach((author) => {
      chips.push({
        key: `author-${author}`,
        label: `Tác giả: ${author}`,
        onRemove: () => handleToggleAuthor(author),
      });
    });
    filters.publishers.forEach((pub) => {
      chips.push({
        key: `pub-${pub}`,
        label: `NXB: ${pub}`,
        onRemove: () => handleTogglePublisher(pub),
      });
    });
    if (filters.minYear !== "" || filters.maxYear !== "") {
      const yText =
        filters.minYear && filters.maxYear
          ? `${filters.minYear} - ${filters.maxYear}`
          : filters.minYear
          ? `Từ năm ${filters.minYear}`
          : `Đến năm ${filters.maxYear}`;
      chips.push({
        key: "year",
        label: `Năm XB: ${yText}`,
        onRemove: () => {
          setYearRange({ min: "", max: "" });
          updateFilter({ minYear: "", maxYear: "" });
        },
      });
    }
    if (filters.minPrice !== "" || filters.maxPrice !== "") {
      const minText = filters.minPrice
        ? `${Number(filters.minPrice).toLocaleString("vi-VN")}đ`
        : "0đ";
      const maxText = filters.maxPrice
        ? `${Number(filters.maxPrice).toLocaleString("vi-VN")}đ`
        : "Trở lên";
      chips.push({
        key: "price",
        label: `${minText} - ${maxText}`,
        onRemove: () => {
          setPriceRange({ min: "", max: "" });
          updateFilter({ minPrice: "", maxPrice: "" });
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
    if (currentPage > 3) pages.push("...");
    for (
      let p = Math.max(2, currentPage - 1);
      p <= Math.min(lastPage - 1, currentPage + 1);
      p++
    ) {
      pages.push(p);
    }
    if (currentPage < lastPage - 2) pages.push("...");
    pages.push(lastPage);
    return pages;
  }, [pagination]);

  const viewNode = (
    <>
      {cartToast.text && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl text-xs font-semibold shadow-lg border ${
            cartToast.type === "success"
              ? "bg-emerald-900 text-white border-emerald-700"
              : "bg-red-800 text-white border-red-600"
          }`}
        >
          {cartToast.text}
        </div>
      )}

      <ProductListView
        books={books}
        categories={categories}
        totalAuthorCount={authorOptions.length}
        filteredAuthors={filteredAuthors}
        totalPublisherCount={publisherOptions.length}
        filteredPublishers={filteredPublishers}
        filters={filters}
        priceRange={priceRange}
        yearRange={yearRange}
        authorSearch={authorSearch}
        publisherSearch={publisherSearch}
        openSections={openSections}
        mobileFilterOpen={mobileFilterOpen}
        activeFilterCount={activeChips.length}
        activeChips={activeChips}
        pagination={pagination}
        pageNumbers={pageNumbers}
        loading={loading}
        error={error}
        sortBarRef={sortBarRef}
        sortBarTop={sortBarMetrics.top}
        sortBarSpacerHeight={sortBarMetrics.spacerHeight}
        sidebarStickyTop={sortBarMetrics.sidebarStickyTop}
        onSortChange={(sort) => updateFilter({ sort })}
        onToggleMobileFilter={setMobileFilterOpen}
        onResetAll={handleResetAll}
        onToggleSection={(key) =>
          setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
        }
        onToggleCategory={handleToggleCategory}
        onSelectRating={(val) => updateFilter({ minRating: val })}
        onToggleAuthor={handleToggleAuthor}
        onAuthorSearchChange={setAuthorSearch}
        onTogglePublisher={handleTogglePublisher}
        onPublisherSearchChange={setPublisherSearch}
        onYearRangeChange={setYearRange}
        onApplyYearRange={() =>
          updateFilter({ minYear: yearRange.min, maxYear: yearRange.max })
        }
        onSelectYearPreset={(preset) => {
          const isSame =
            filters.minYear === preset.min && filters.maxYear === preset.max;
          const nextMin = isSame ? "" : preset.min;
          const nextMax = isSame ? "" : preset.max;
          setYearRange({ min: nextMin, max: nextMax });
          updateFilter({ minYear: nextMin, maxYear: nextMax });
        }}
        onPriceRangeChange={(nextRange, immediate = false) => {
          setPriceRange(nextRange);
          if (immediate) {
            updateFilter({ minPrice: nextRange.min, maxPrice: nextRange.max });
          }
        }}
        onApplyPriceRange={() =>
          updateFilter({ minPrice: priceRange.min, maxPrice: priceRange.max })
        }
        onSelectPricePreset={(preset) => {
          const isSame =
            filters.minPrice === preset.min && filters.maxPrice === preset.max;
          const nextMin = isSame ? "" : preset.min;
          const nextMax = isSame ? "" : preset.max;
          setPriceRange({ min: nextMin, max: nextMax });
          updateFilter({ minPrice: nextMin, maxPrice: nextMax });
        }}
        onPageChange={handlePageChange}
        onAddToCart={handleDefaultAddToCart}
      />

      <LoginRequiredModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );

  return isFromProp ? viewNode : <MainLayout>{viewNode}</MainLayout>;
}