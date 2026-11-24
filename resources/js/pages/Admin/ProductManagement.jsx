import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminModal from "../../components/admin/AdminModal";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";

const EMPTY_FORM = {
  name: "",
  author: "",
  publisher: "",
  publish_year: "",
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
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    keyword: "",
    category_id: "",
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

  // Modal thông báo xác nhận / hủy
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/products", {
        ...getAuthConfig(),
        params: {
          keyword: filters.keyword || undefined,
          category_id: filters.category_id || undefined,
          page: filters.page,
        },
      });
      const list = res.data.data || [];

      if (list.length === 0 && filters.page > 1) {
        setFilters((f) => ({ ...f, page: f.page - 1 }));
        return;
      }

      setProducts(list);
      setMeta({
        current_page: res.data.current_page || 1,
        last_page: res.data.last_page || 1,
        total: res.data.total ?? list.length,
      });
    } catch {
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
    fetchProducts();
  }, [filters]);

  const categoryName = (id) =>
    categories.find((c) => Number(c.id) === Number(id))?.name ?? `#${id}`;

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
      publish_year:
        product.publish_year ||
        product.published_year ||
        product.nam_xuat_ban ||
        "",
      price: String(Math.round(Number(product.price || 0))),
      discount: String(
        Math.round(Number(product.discount ?? product.discount_percent ?? 0))
      ),
      stock: String(product.stock ?? 0),
      category_id: String(product.category_id || ""),
      status: product.status || "active",
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
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setImageError("Ảnh chỉ nhận định dạng JPG, PNG hoặc WEBP.");
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
      "publish_year",
      "price",
      "discount",
      "stock",
      "category_id",
      "status",
      "description",
    ].forEach((key) => fd.append(key, formData[key] ?? ""));

    if (formData.image) fd.append("image", formData.image);
    if (editingId) fd.append("_method", "PUT");

    try {
      await axios.post(
        editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
        fd,
        getAuthConfig()
      );
      setAlertMessage({
        type: "success",
        text: editingId
          ? `Đã cập nhật sách #${editingId} thành công.`
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
    setFilters({ keyword: "", category_id: "", page: 1 });
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

  return (
    <div className="space-y-4">
      {alertMessage.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium ${
            alertMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {alertMessage.text}
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
            placeholder="Tìm theo tên sách, tác giả, nhà xuất bản..."
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
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Ấn phẩm & Tác giả</th>
                <th className="py-3.5 px-4">NXB / Năm XB</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4 text-right">Giá bán & Giảm giá</th>
                <th className="py-3.5 px-4 text-center">Kho</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
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
                    p.publish_year ||
                    p.published_year ||
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

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition">
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
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            Number(p.stock) === 0
                              ? "bg-red-100 text-red-700"
                              : Number(p.stock) <= 5
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {p.stock}
                        </span>
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
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] text-xs font-semibold transition cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => requestToggleStatus(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
                          >
                            {p.status === "active" ? "Ẩn" : "Hiện"}
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteProduct(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition cursor-pointer"
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

      {/* MODAL THÊM / SỬA SÁCH */}
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
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Tên sách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="VD: Paulo Coelho"
                className={inputClass}
              />
              <FieldError name="author" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nhà xuất bản</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                placeholder="VD: NXB Hội Nhà Văn"
                className={inputClass}
              />
              <FieldError name="publisher" />
            </div>

            <div>
              <label className={labelClass}>Năm xuất bản</label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={formData.publish_year}
                onChange={(e) =>
                  setFormData({ ...formData, publish_year: e.target.value })
                }
                placeholder="VD: 2024"
                className={inputClass}
              />
              <FieldError name="publish_year" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                Giá niêm yết (₫) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="120000"
                className={inputClass}
              />
              <FieldError name="price" />
            </div>

            <div>
              <label className={labelClass}>Giảm giá (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
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
                min="0"
                required
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="10"
                className={inputClass}
              />
              <FieldError name="stock" />
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
                required
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
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
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn về nội dung cuốn sách..."
              className={inputClass}
            />
            <FieldError name="description" />
          </div>

          <div>
            <label className={labelClass}>
              Ảnh bìa (JPG / PNG / WEBP, tối đa 2 MB)
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
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="block w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-stone-200 file:text-stone-800 file:font-semibold cursor-pointer"
            />
            <FieldError name="image" />
          </div>
        </form>
      </AdminModal>

      {/* MODAL THÔNG BÁO XÁC NHẬN CHUNG */}
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