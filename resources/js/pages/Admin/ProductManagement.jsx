import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminModal from "../../components/admin/AdminModal";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";

const EMPTY_FORM = {
  name: "",
  author: "",
  publisher: "",
  published_year: "",
  page_count: "",
  price: "",
  discount: "0",
  stock: "",
  category_id: "",
  status: "active",
  description: "",
  image: null,
};

const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [stockAlerts, setStockAlerts] = useState({
    threshold: 5,
    out_of_stock_count: 0,
    low_stock_count: 0,
    total_alert_count: 0,
    items: [],
  });
  const [isAlertExpanded, setIsAlertExpanded] = useState(true);
  const [showAllAlertItems, setShowAllAlertItems] = useState(false);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    keyword: "",
    category_id: "",
    stock_status: "",
    page: 1,
  });
  const [searchInput, setSearchInput] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [currentImage, setCurrentImage] = useState(null);
  const [fileKey, setFileKey] = useState(0);

  const [serverErrors, setServerErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });

  const [confirmState, setConfirmState] = useState({
    open: false,
    variant: "warning",
    title: "",
    message: "",
    detailText: "",
    confirmText: "Xác nhận",
    cancelText: "Quay lại",
    action: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories", getAuthConfig());
      setCategories(res.data.data || []);
    } catch {
      setAlertMessage({
        type: "error",
        text: "Không thể tải danh sách danh mục.",
      });
    }
  };

  const fetchProducts = async (signal) => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/products", {
        ...getAuthConfig(),
        signal,
        params: {
          keyword: filters.keyword || undefined,
          category_id: filters.category_id || undefined,
          stock_status: filters.stock_status || undefined,
          page: filters.page,
        },
      });

      const payload = res.data?.data;
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      const currentPage = Array.isArray(payload)
        ? res.data?.current_page || 1
        : payload?.current_page || 1;
      const lastPage = Array.isArray(payload)
        ? res.data?.last_page || 1
        : payload?.last_page || 1;
      const total = Array.isArray(payload)
        ? res.data?.total ?? list.length
        : payload?.total ?? list.length;

      if (res.data?.stock_alerts) {
        setStockAlerts(res.data.stock_alerts);
      }

      if (list.length === 0 && filters.page > 1) {
        setFilters((f) => ({ ...f, page: f.page - 1 }));
        return;
      }

      setProducts(list);
      setMeta({
        current_page: currentPage,
        last_page: lastPage,
        total,
      });
    } catch (err) {
      if (axios.isCancel?.(err) || err?.code === "ERR_CANCELED") {
        return;
      }
      setAlertMessage({
        type: "error",
        text: "Không thể tải danh sách sản phẩm.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      setFilters((f) =>
        f.keyword === trimmed ? f : { ...f, keyword: trimmed, page: 1 }
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [filters]);

  const categoryName = (id) =>
    categories.find((c) => Number(c.id) === Number(id))?.name ?? `#${id}`;

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (serverErrors[field]) {
      setServerErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = ["Vui lòng nhập tên sách."];
    }

    if (formData.published_year !== "" && formData.published_year !== null) {
      const year = Number(formData.published_year);
      if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        errors.published_year = ["Năm xuất bản phải từ 1900 đến 2100."];
      }
    }

    if (formData.page_count !== "" && formData.page_count !== null) {
      const pages = Number(formData.page_count);
      if (!Number.isInteger(pages) || pages < 1) {
        errors.page_count = ["Số trang phải lớn hơn hoặc bằng 1."];
      }
    }

    if (formData.price === "" || formData.price === null) {
      errors.price = ["Vui lòng nhập giá niêm yết."];
    } else if (Number(formData.price) < 1) {
      errors.price = ["Giá niêm yết phải lớn hơn 0."];
    }

    if (formData.discount !== "" && formData.discount !== null) {
      const discount = Number(formData.discount);
      if (Number.isNaN(discount) || discount < 0) {
        errors.discount = ["Phần trăm giảm giá phải lớn hơn hoặc bằng 0."];
      } else if (discount > 100) {
        errors.discount = ["Phần trăm giảm giá không được vượt quá 100%."];
      }
    }

    if (formData.stock === "" || formData.stock === null) {
      errors.stock = ["Vui lòng nhập số lượng tồn kho."];
    } else {
      const stock = Number(formData.stock);
      if (!Number.isInteger(stock)) {
        errors.stock = ["Số lượng tồn kho phải là số nguyên."];
      } else if (!editingId && stock < 1) {
        errors.stock = ["Khi thêm sách mới, số lượng tồn kho phải lớn hơn 0."];
      } else if (editingId && stock < 0) {
        errors.stock = ["Số lượng tồn kho không được nhỏ hơn 0."];
      }
    }

    if (!formData.category_id) {
      errors.category_id = ["Vui lòng chọn danh mục."];
    }

    return errors;
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setCurrentImage(null);
    setFileKey((k) => k + 1);
    setServerErrors({});
  };

  const requestCancelModal = () => {
    setConfirmState({
      open: true,
      variant: "danger",
      title: "Xác nhận hủy thao tác",
      message:
        "Bạn có chắc chắn muốn hủy và đóng biểu mẫu? Dữ liệu chưa lưu sẽ bị mất.",
      detailText: formData.name ? `Ấn phẩm: ${formData.name}` : "",
      confirmText: "Đồng ý hủy",
      cancelText: "Tiếp tục nhập",
      action: () => {
        resetAndCloseModal();
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setCurrentImage(null);
    setFileKey((k) => k + 1);
    setServerErrors({});
    setAlertMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || "",
      author: product.author || "",
      publisher: product.publisher || product.nha_xuat_ban || "",
      published_year:
        product.published_year ||
        product.publish_year ||
        product.nam_xuat_ban ||
        "",
      page_count: product.page_count || product.pages || "",
      price: String(Math.round(Number(product.price || 0))),
      discount: String(
        Math.round(Number(product.discount ?? product.discount_percent ?? 0))
      ),
      stock: String(product.stock ?? 0),
      category_id: String(product.category_id || ""),
      status: product.status === "active" ? "active" : "hidden",
      description: product.description || "",
      image: null,
    });
    setCurrentImage(product.image || null);
    setFileKey((k) => k + 1);
    setServerErrors({});
    setAlertMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const setImageError = (text) => {
    setServerErrors((prev) => ({ ...prev, image: [text] }));
    setFileKey((k) => k + 1);
    setFormData((f) => ({ ...f, image: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;

    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setImageError("Ảnh chỉ nhận định dạng JPG hoặc PNG.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setImageError("Ảnh không được vượt quá 2 MB.");
        return;
      }
    }

    setServerErrors((prev) => {
      const { image, ...rest } = prev;
      return rest;
    });
    setFormData((f) => ({ ...f, image: file }));
  };

  const executeSaveProduct = async () => {
    setServerErrors({});
    setAlertMessage({ type: "", text: "" });
    setActionLoading(true);

    const fd = new FormData();
    [
      "name",
      "author",
      "publisher",
      "published_year",
      "page_count",
      "price",
      "discount",
      "stock",
      "category_id",
      "status",
      "description",
    ].forEach((key) => fd.append(key, formData[key] ?? ""));

    if (formData.image) fd.append("image", formData.image);
    if (editingId) fd.append("_method", "PUT");

    const savedStock = Number(formData.stock || 0);

    try {
      await axios.post(
        editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
        fd,
        getAuthConfig()
      );
      setAlertMessage({
        type: editingId && savedStock === 0 ? "warning" : "success",
        text: editingId
          ? savedStock === 0
            ? `Đã cập nhật sách #${editingId}. Sách hiện đã hết hàng (tồn kho = 0) và được đưa vào mục cảnh báo nhập kho.`
            : `Đã cập nhật sách #${editingId} thành công.`
          : "Đã thêm đầu sách mới thành công.",
      });
      resetAndCloseModal();
      fetchProducts();
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
      } else {
        setAlertMessage({
          type: "error",
          text:
            error.response?.data?.message || "Có lỗi xảy ra khi lưu sản phẩm.",
        });
      }
    } finally {
      setActionLoading(false);
      setConfirmState((prev) => ({ ...prev, open: false }));
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setServerErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    setConfirmState({
      open: true,
      variant: "info",
      title: editingId
        ? "Xác nhận cập nhật thông tin sách"
        : "Xác nhận thêm đầu sách mới",
      message: editingId
        ? "Bạn có chắc chắn muốn lưu các thay đổi cho cuốn sách này?"
        : "Bạn có chắc chắn muốn thêm đầu sách mới vào hệ thống?",
      detailText: `${formData.name} — Giá: ${formatVND(
        formData.price
      )} (Giảm ${formData.discount || 0}%)`,
      confirmText: editingId ? "Lưu thay đổi" : "Thêm sách",
      cancelText: "Quay lại",
      action: executeSaveProduct,
    });
  };

  const requestToggleStatus = (product) => {
    const nextText =
      product.status === "active" ? "Ẩn sản phẩm" : "Hiển thị sản phẩm";
    setConfirmState({
      open: true,
      variant: "warning",
      title: `Xác nhận ${nextText.toLowerCase()}`,
      message: `Bạn có chắc chắn muốn chuyển trạng thái của cuốn "${product.name}"?`,
      detailText: `Ấn phẩm #${product.id}: ${product.name}`,
      confirmText: nextText,
      cancelText: "Hủy",
      action: async () => {
        setActionLoading(true);
        setAlertMessage({ type: "", text: "" });
        try {
          await axios.put(
            `/api/admin/products/${product.id}/toggle-status`,
            {},
            getAuthConfig()
          );
          setAlertMessage({
            type: "success",
            text: `Đã cập nhật trạng thái sách "${product.name}".`,
          });
          fetchProducts();
        } catch (error) {
          setAlertMessage({
            type: "error",
            text: error.response?.data?.message || "Không thể đổi trạng thái.",
          });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const requestDeleteProduct = (product) => {
    setConfirmState({
      open: true,
      variant: "danger",
      title: "Xác nhận xóa ấn phẩm sách",
      message:
        "Bạn có chắc chắn muốn xóa vĩnh viễn cuốn sách này khỏi danh sách?",
      detailText: `Sách #${product.id}: ${product.name}`,
      confirmText: "Xóa sách",
      cancelText: "Hủy",
      action: async () => {
        setActionLoading(true);
        setAlertMessage({ type: "", text: "" });
        try {
          const res = await axios.delete(
            `/api/admin/products/${product.id}`,
            getAuthConfig()
          );
          setAlertMessage({
            type: "success",
            text: res.data?.message || "Đã xóa sản phẩm.",
          });
          if (editingId === product.id) resetAndCloseModal();
          fetchProducts();
        } catch (error) {
          setAlertMessage({
            type: "error",
            text:
              error.response?.data?.message || "Không thể xóa sản phẩm này.",
          });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, keyword: searchInput.trim(), page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ keyword: "", category_id: "", stock_status: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.last_page) {
      setFilters((f) => ({ ...f, page: newPage }));
    }
  };

  const inputClass =
    "w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13]";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5";

  const FieldError = ({ name }) =>
    serverErrors[name] ? (
      <p className="text-red-600 text-xs mt-1">{serverErrors[name][0]}</p>
    ) : null;

  const previewPrice = Number(formData.price || 0);
  const previewDiscount = Math.min(
    100,
    Math.max(0, Number(formData.discount || 0))
  );
  const previewFinalPrice = Math.round(
    previewPrice * (1 - previewDiscount / 100)
  );

  const visibleAlertItems = showAllAlertItems
    ? stockAlerts.items
    : stockAlerts.items.slice(0, 6);

  return (
    <div className="space-y-4">
      {alertMessage.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium ${
            alertMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : alertMessage.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {alertMessage.text}
        </div>
      )}

      {/* KHUNG CẢNH BÁO TỒN KHO */}
      {stockAlerts.total_alert_count > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAF8F5]/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/90 text-[#9A5B13] flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1A1A1A]">
                    Cảnh báo tồn kho
                  </h3>
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs text-stone-600 truncate">
                    {stockAlerts.total_alert_count} đầu sách dưới ngưỡng{" "}
                    {stockAlerts.threshold} cuốn
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {stockAlerts.out_of_stock_count > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      stock_status:
                        f.stock_status === "out_of_stock"
                          ? ""
                          : "out_of_stock",
                      page: 1,
                    }))
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    filters.stock_status === "out_of_stock"
                      ? "bg-[#141414] text-white border-[#141414]"
                      : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Hết hàng</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${
                      filters.stock_status === "out_of_stock"
                        ? "bg-white/20 text-white"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {stockAlerts.out_of_stock_count}
                  </span>
                </button>
              )}

              {stockAlerts.low_stock_count > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      stock_status:
                        f.stock_status === "low_stock" ? "" : "low_stock",
                      page: 1,
                    }))
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    filters.stock_status === "low_stock"
                      ? "bg-[#141414] text-white border-[#141414]"
                      : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Sắp hết</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${
                      filters.stock_status === "low_stock"
                        ? "bg-white/20 text-white"
                        : "bg-amber-50 text-[#9A5B13]"
                    }`}
                  >
                    {stockAlerts.low_stock_count}
                  </span>
                </button>
              )}

              {filters.stock_status && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({ ...f, stock_status: "", page: 1 }))
                  }
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                >
                  Bỏ lọc
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsAlertExpanded((v) => !v)}
                className="ml-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
              >
                {isAlertExpanded ? "Thu gọn" : "Chi tiết"}
              </button>
            </div>
          </div>

          {isAlertExpanded && (
            <div className="p-3.5 sm:p-4 border-t border-stone-100">
              <div
                className={`grid grid-cols-1 gap-2.5 ${
                  visibleAlertItems.length >= 3
                    ? "md:grid-cols-2 xl:grid-cols-3"
                    : "md:grid-cols-2"
                }`}
              >
                {visibleAlertItems.map((book) => {
                  const isOutOfStock = Number(book.stock) === 0;
                  return (
                    <div
                      key={book.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 hover:border-stone-300 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {book.image ? (
                          <img
                            src={book.image}
                            alt={book.name}
                            className="w-8 h-11 object-cover rounded-md border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-11 rounded-md bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] flex items-center justify-center text-[8px] font-bold shrink-0">
                            SÁCH
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1A1A1A] truncate">
                            {book.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11px] text-stone-400">
                              #{book.id}
                            </span>
                            <span className="text-[10px] text-stone-300">
                              •
                            </span>
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Hết hàng (0)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9A5B13]">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Còn {book.stock} cuốn
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEdit(book)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#141414] text-[#1A1A1A] hover:text-white border border-stone-300 hover:border-[#141414] text-xs font-semibold shrink-0 transition cursor-pointer"
                      >
                        + Nhập kho
                      </button>
                    </div>
                  );
                })}
              </div>

              {stockAlerts.items.length > 6 && (
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAllAlertItems((v) => !v)}
                    className="text-xs font-semibold text-[#9A5B13] hover:text-[#1A1A1A] transition cursor-pointer"
                  >
                    {showAllAlertItems
                      ? "Thu gọn bớt"
                      : `Xem tất cả ${stockAlerts.items.length} đầu sách →`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
              Danh Sách Ấn Phẩm Sách
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Quản lý thông tin sách, nhà xuất bản, năm xuất bản, tồn kho và
              mức giảm giá
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs shrink-0"
          >
            <span className="text-base leading-none">+</span>
            <span>Thêm sách mới</span>
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-4 bg-[#FAF8F5]/70 border-b border-stone-200"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên sách hoặc tác giả..."
            className="flex-1 px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          />
          <select
            value={filters.category_id}
            onChange={(e) =>
              setFilters({ ...filters, category_id: e.target.value, page: 1 })
            }
            className="px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filters.stock_status}
            onChange={(e) =>
              setFilters({ ...filters, stock_status: e.target.value, page: 1 })
            }
            className="px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
          >
            <option value="">Tất cả tồn kho</option>
            <option value="alert">Cần nhập thêm (≤ 5 cuốn)</option>
            <option value="out_of_stock">Đã hết hàng (0 cuốn)</option>
            <option value="low_stock">Sắp hết hàng (1 - 5 cuốn)</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-none bg-[#141414] hover:bg-stone-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition cursor-pointer"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 sm:flex-none bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition cursor-pointer"
            >
              Xóa lọc
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4 whitespace-nowrap">ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">
                  Ấn phẩm & Tác giả
                </th>
                <th className="py-3.5 px-4 whitespace-nowrap">NXB / Năm XB</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Danh mục</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">
                  Giá bán & Giảm giá
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  Kho
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap w-44">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-stone-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-stone-400">
                    Không có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const publisher =
                    p.publisher || p.nha_xuat_ban || "Chưa cập nhật";
                  const publishYear =
                    p.published_year ||
                    p.publish_year ||
                    p.nam_xuat_ban ||
                    "—";
                  const discount = Number(
                    p.discount ?? p.discount_percent ?? 0
                  );
                  const originalPrice = Number(p.price || 0);
                  const finalPrice =
                    discount > 0
                      ? Math.round(originalPrice * (1 - discount / 100))
                      : originalPrice;
                  const stockNum = Number(p.stock || 0);

                  return (
                    <tr
                      key={p.id}
                      className={`transition ${
                        stockNum === 0
                          ? "bg-red-50/30 hover:bg-red-50/60"
                          : stockNum <= 5
                          ? "bg-amber-50/25 hover:bg-amber-50/50"
                          : "hover:bg-stone-50/70"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-stone-600 whitespace-nowrap">
                        #{p.id}
                      </td>
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-14 object-cover rounded-lg border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-14 rounded-lg bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] flex items-center justify-center text-[9px] font-bold shrink-0">
                              SÁCH
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-[#1A1A1A] line-clamp-1">
                              {p.name}
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5">
                              {p.author || "Chưa rõ tác giả"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-stone-800">
                          {publisher}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Năm XB: {publishYear}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-stone-600 whitespace-nowrap">
                        {categoryName(p.category_id)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-[#1A1A1A]">
                          {formatVND(finalPrice)}
                        </div>
                        {discount > 0 ? (
                          <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <span className="text-[11px] text-stone-400 line-through">
                              {formatVND(originalPrice)}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                              -{discount}%
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-stone-400">
                            Không giảm giá
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {stockNum === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Hết (0)
                          </span>
                        ) : stockNum <= 5 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#9A5B13] border border-amber-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Còn {stockNum}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                            {stockNum}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            p.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {p.status === "active" ? "Hiển thị" : "Đang ẩn"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap w-44">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer"
                          >
                            {stockNum <= 5 ? "Nhập / Sửa" : "Sửa"}
                          </button>
                          <button
                            type="button"
                            onClick={() => requestToggleStatus(p)}
                            className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 border border-stone-200 text-[#9A5B13] text-xs font-medium transition cursor-pointer"
                          >
                            {p.status === "active" ? "Ẩn" : "Hiện"}
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteProduct(p)}
                            className="px-2.5 py-1 rounded-md bg-white hover:bg-red-50/70 border border-red-200/80 text-red-600 text-xs font-medium transition cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-stone-200">
          <span className="text-xs sm:text-sm text-stone-500">
            Trang <strong>{meta.current_page}</strong> / {meta.last_page} (Tổng{" "}
            {meta.total} đầu sách)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(meta.current_page - 1)}
              disabled={meta.current_page <= 1}
              className="px-3.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold disabled:opacity-50 hover:bg-stone-50 transition cursor-pointer disabled:cursor-not-allowed"
            >
              Trang trước
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(meta.current_page + 1)}
              disabled={meta.current_page >= meta.last_page}
              className="px-3.5 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold disabled:opacity-50 hover:bg-stone-50 transition cursor-pointer disabled:cursor-not-allowed"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      <AdminModal
        open={isModalOpen}
        onClose={requestCancelModal}
        subtitle={editingId ? `Mã sách #${editingId}` : "Tạo ấn phẩm mới"}
        title={editingId ? "Cập Nhật Thông Tin Sách" : "Thêm Đầu Sách Mới"}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={requestCancelModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="product-modal-form"
              className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              {editingId ? "Lưu thay đổi" : "Thêm sách mới"}
            </button>
          </>
        }
      >
        <form
          id="product-modal-form"
          onSubmit={handleRequestSubmit}
          noValidate
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Tên sách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="VD: Nhà Giả Kim"
                className={inputClass}
              />
              <FieldError name="name" />
            </div>

            <div>
              <label className={labelClass}>Tác giả</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => updateField("author", e.target.value)}
                placeholder="VD: Paulo Coelho"
                className={inputClass}
              />
              <FieldError name="author" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Nhà xuất bản</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => updateField("publisher", e.target.value)}
                placeholder="VD: NXB Hội Nhà Văn"
                className={inputClass}
              />
              <FieldError name="publisher" />
            </div>

            <div>
              <label className={labelClass}>Năm xuất bản</label>
              <input
                type="number"
                value={formData.published_year}
                onChange={(e) => updateField("published_year", e.target.value)}
                placeholder="VD: 2024"
                className={inputClass}
              />
              <FieldError name="published_year" />
            </div>

            <div>
              <label className={labelClass}>Số trang</label>
              <input
                type="number"
                value={formData.page_count}
                onChange={(e) => updateField("page_count", e.target.value)}
                placeholder="VD: 228"
                className={inputClass}
              />
              <FieldError name="page_count" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                Giá niêm yết (₫) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="120000"
                className={inputClass}
              />
              <FieldError name="price" />
            </div>

            <div>
              <label className={labelClass}>Giảm giá (%)</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => updateField("discount", e.target.value)}
                placeholder="0"
                className={inputClass}
              />
              <FieldError name="discount" />
            </div>

            <div>
              <label className={labelClass}>
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => updateField("stock", e.target.value)}
                placeholder={editingId ? "0" : "Tối thiểu 1"}
                className={inputClass}
              />
              <FieldError name="stock" />
              {!serverErrors.stock &&
                editingId &&
                formData.stock !== "" &&
                Number(formData.stock) === 0 && (
                  <p className="text-amber-700 text-xs mt-1">
                    Tồn kho bằng 0 sẽ đánh dấu sách này là đã hết hàng.
                  </p>
                )}
            </div>
          </div>

          {previewPrice > 0 && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#F5EDE2]/70 border border-[#E5D5BE] text-xs flex items-center justify-between">
              <span className="text-stone-600 font-medium">
                Giá hiển thị tới khách hàng:
              </span>
              <span className="font-bold text-[#9A5B13] text-sm">
                {formatVND(previewFinalPrice)}{" "}
                {previewDiscount > 0 && `(Giảm ${previewDiscount}%)`}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => updateField("category_id", e.target.value)}
                className={inputClass}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <FieldError name="category_id" />
            </div>

            <div>
              <label className={labelClass}>Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => updateField("status", e.target.value)}
                className={inputClass}
              >
                <option value="active">Hiển thị (Active)</option>
                <option value="hidden">Đang ẩn (Hidden)</option>
              </select>
              <FieldError name="status" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Mô tả nội dung sách</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Mô tả ngắn về nội dung cuốn sách..."
              className={inputClass}
            />
            <FieldError name="description" />
          </div>
          
          <div>
            <label className={labelClass}>
              Ảnh bìa (JPG / PNG, tối đa 2 MB)
            </label>
            {editingId && currentImage && !formData.image && (
              <img
                src={currentImage}
                alt="Ảnh hiện tại"
                className="w-16 h-24 object-cover rounded-lg border border-stone-200 mb-2"
              />
            )}
            <input
              key={fileKey}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="block w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-stone-200 file:text-stone-800 file:font-semibold cursor-pointer"
            />
            <FieldError name="image" />
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        open={confirmState.open}
        variant={confirmState.variant}
        title={confirmState.title}
        message={confirmState.message}
        detailText={confirmState.detailText}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        loading={actionLoading}
        onConfirm={() => confirmState.action?.()}
        onCancel={() =>
          !actionLoading &&
          setConfirmState((prev) => ({ ...prev, open: false }))
        }
      />
    </div>
  );
}