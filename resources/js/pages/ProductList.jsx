import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import ProductListView from "../components/ProductListView";
import ProductService from "../services/ProductService";
import { enrichBookWithSampleMeta } from "../data/homeMockData";

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
    page: Number(sp.get("page")) || 1,
  };
}

/**
 * SMART COMPONENT: Xử lý API, đo vị trí Navbar để fixed thanh Sắp xếp, lọc & phân trang
 */
export default function ProductList({
  products = null,
  categories: propCategories = null,
  onAddToCart,
}) {
  const isFromProp = Array.isArray(products);

  const [categories, setCategories] = useState(propCategories || []);
  const [catalogBooks, setCatalogBooks] = useState(() =>
    isFromProp ? products.map(enrichBookWithSampleMeta) : []
  );
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

  // Tải danh sách sách từ DB
  useEffect(() => {
    if (isFromProp) {
      setCatalogBooks(products.map(enrichBookWithSampleMeta));
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    axios
      .get("/api/products", {
        params: { per_page: 500 },
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        if (!active) return;
        const raw =
          res.data?.data?.data ??
          res.data?.data ??
          res.data?.products ??
          res.data ??
          [];
        const list = Array.isArray(raw) ? raw : [];
        setCatalogBooks(list.map(enrichBookWithSampleMeta));
      })
      .catch(async () => {
        try {
          const fallback = await ProductService.search("", "", "", "", "newest", 1);
          if (!active) return;
          setCatalogBooks((fallback.items || []).map(enrichBookWithSampleMeta));
        } catch {
          if (!active) return;
          setCatalogBooks([]);
          setError("Không thể tải dữ liệu sách từ hệ thống.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isFromProp, products]);

  // Đồng bộ URL
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

  // Trích xuất danh sách Tác giả & Nhà xuất bản
  const { authorOptions, publisherOptions } = useMemo(() => {
    const authorMap = new Map();
    const pubMap = new Map();

    catalogBooks.forEach((b) => {
      const author = String(b.author || "").trim().normalize("NFC");
      if (author && author.toLowerCase() !== "đang cập nhật") {
        authorMap.set(author, (authorMap.get(author) || 0) + 1);
      }

      const pub = String(b.publisher || "").trim().normalize("NFC");
      if (pub) {
        pubMap.set(pub, (pubMap.get(pub) || 0) + 1);
      }
    });

    return {
      authorOptions: Array.from(authorMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name, "vi")),
      publisherOptions: Array.from(pubMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name, "vi")),
    };
  }, [catalogBooks]);

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

  // Lọc & Sắp xếp sách
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...catalogBooks];

    if (filters.keyword.trim()) {
      const kw = filters.keyword.trim().toLowerCase();
      result = result.filter(
        (b) =>
          (b.title || b.name || "").toLowerCase().includes(kw) ||
          (b.author || "").toLowerCase().includes(kw) ||
          (b.publisher || "").toLowerCase().includes(kw)
      );
    }

    if (filters.categoryIds.length > 0) {
      const selectedCats = categories.filter((c) =>
        filters.categoryIds.includes(String(c.id))
      );
      const selectedNames = selectedCats.map((c) => c.name.toLowerCase());

      result = result.filter((b) => {
        const catIdMatch = filters.categoryIds.includes(String(b.category_id));
        const catName =
          typeof b.category === "object" ? b.category?.name : b.category;
        const catNameMatch =
          catName && selectedNames.includes(String(catName).toLowerCase());
        return catIdMatch || catNameMatch;
      });
    }

    if (filters.minRating !== "") {
      const minR = Number(filters.minRating);
      result = result.filter((b) => Number(b.rating || 0) >= minR);
    }

    if (filters.authors.length > 0) {
      const selectedAuthorSet = new Set(
        filters.authors.map((a) => a.toLowerCase())
      );
      result = result.filter((b) =>
        selectedAuthorSet.has(String(b.author || "").trim().toLowerCase())
      );
    }

    if (filters.publishers.length > 0) {
      const selectedPubSet = new Set(
        filters.publishers.map((p) => p.toLowerCase())
      );
      result = result.filter((b) =>
        selectedPubSet.has(String(b.publisher || "").trim().toLowerCase())
      );
    }

    if (filters.minYear !== "") {
      const minY = Number(filters.minYear);
      result = result.filter((b) => Number(b.publish_year || 0) >= minY);
    }
    if (filters.maxYear !== "") {
      const maxY = Number(filters.maxYear);
      result = result.filter((b) => Number(b.publish_year || 0) <= maxY);
    }

    if (filters.minPrice !== "") {
      result = result.filter(
        (b) => Number(b.price || 0) >= Number(filters.minPrice)
      );
    }
    if (filters.maxPrice !== "") {
      result = result.filter(
        (b) => Number(b.price || 0) <= Number(filters.maxPrice)
      );
    }

    switch (filters.sort) {
      case "title_asc":
        result.sort((a, b) =>
          String(a.title || a.name || "").localeCompare(
            String(b.title || b.name || ""),
            "vi",
            { sensitivity: "base" }
          )
        );
        break;
      case "title_desc":
        result.sort((a, b) =>
          String(b.title || b.name || "").localeCompare(
            String(a.title || a.name || ""),
            "vi",
            { sensitivity: "base" }
          )
        );
        break;
      case "publish_year_asc":
        result.sort(
          (a, b) => Number(a.publish_year || 0) - Number(b.publish_year || 0)
        );
        break;
      case "publish_year_desc":
        result.sort(
          (a, b) => Number(b.publish_year || 0) - Number(a.publish_year || 0)
        );
        break;
      case "price_asc":
        result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "price_desc":
        result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "rating_desc":
        result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case "newest":
        result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
        break;
      case "bestseller":
      default:
        result.sort(
          (a, b) => Number(b.sold_count || 0) - Number(a.sold_count || 0)
        );
        break;
    }

    return result;
  }, [catalogBooks, categories, filters]);

  const pagination = useMemo(() => {
    const total = filteredAndSortedBooks.length;
    const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
    const currentPage = Math.min(Math.max(1, filters.page), lastPage);
    return { currentPage, lastPage, total };
  }, [filteredAndSortedBooks.length, filters.page]);

  const paginatedBooks = useMemo(() => {
    const start = (pagination.currentPage - 1) * PER_PAGE;
    return filteredAndSortedBooks.slice(start, start + PER_PAGE);
  }, [filteredAndSortedBooks, pagination.currentPage]);

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
    <ProductListView
      books={paginatedBooks}
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
      onAddToCart={onAddToCart}
    />
  );

  return isFromProp ? viewNode : <MainLayout>{viewNode}</MainLayout>;
}