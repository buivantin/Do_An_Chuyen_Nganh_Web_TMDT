import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import axios from "axios";
import { ADMIN_BANNERS_STORAGE_KEY } from "../../data/homeMockData";
import { resolveBookImageUrl } from "../../components/ProductCard";
import AdminModal from "../../components/admin/AdminModal";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import SearchableSelect from "../../components/admin/SearchableSelect";

const EMPTY_FORM = {
  badge_text: "Ấn phẩm & Trích dẫn nổi bật",
  title: "",
  description: "",
  banner_image: "",
  image_file: null,
  image_preview: "",
  remove_image: false,
  book_id: "",
  category_name: "",
  sort_order: 1,
  status: "active",
};

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Hiển thị (Active)",
    subLabel: "Xuất hiện trên trang chủ",
    sortKey: "A",
  },
  {
    value: "inactive",
    label: "Đang ẩn (Inactive)",
    subLabel: "Tạm ẩn khỏi trang chủ",
    sortKey: "B",
  },
];

const FILTER_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái", sortKey: "0" },
  { value: "active", label: "Đang hiển thị (Active)", sortKey: "1" },
  { value: "inactive", label: "Đang ẩn (Inactive)", sortKey: "2" },
];

/**
 * DUMB COMPONENT: Giao diện bảng & modal quản lý Banner Quảng Cáo
 */
export const BannerManagementView = memo(function BannerManagementView({
  banners = [],
  bookOptions = [],
  sortOrderOptions = [],
  selectedBookCategory = "",
  loading = false,
  msg = { type: "", text: "" },
  searchQuery = "",
  statusFilter = "all",
  onSearchQueryChange,
  onStatusFilterChange,
  isModalOpen = false,
  editingId = null,
  form = EMPTY_FORM,
  fileInputRef,
  onOpenCreate,
  onEdit,
  onRequestCancelModal,
  onFieldChange,
  onFileChange,
  onClearFile,
  onRequestSubmit,
  onRequestToggleStatus,
  onRequestDelete,
  confirmState,
  actionLoading = false,
  onCloseConfirm,
}) {
  const inputClass =
    "w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13]";
  const readOnlyInputClass =
    "w-full px-3.5 py-2 text-sm bg-stone-100 border border-stone-300 rounded-xl text-stone-700 font-semibold cursor-not-allowed select-none";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5";

  const previewUrl =
    form.image_preview ||
    (form.banner_image ? resolveBookImageUrl(form.banner_image) : "");

  return (
    <div className="space-y-4">
      {msg.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium ${
            msg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                Danh Sách Banner Quảng Cáo
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Quản lý slide quảng bá, danh mục và sách liên kết tại trang chủ
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs shrink-0"
            >
              <span className="text-base leading-none">+</span>
              <span>Thêm banner mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange?.(e.target.value)}
                placeholder="Tìm kiếm banner theo tiêu đề, nội dung quảng cáo, danh mục hoặc sách..."
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-4">
              <SearchableSelect
                options={FILTER_STATUS_OPTIONS}
                value={statusFilter}
                onChange={onStatusFilterChange}
                placeholder="Lọc theo trạng thái"
                searchPlaceholder="Gõ trạng thái..."
                sortOrder="09"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4 text-center w-16">Thứ tự</th>
                <th className="py-3.5 px-4">Hình ảnh</th>
                <th className="py-3.5 px-4">Tiêu đề &amp; Nội dung quảng cáo</th>
                <th className="py-3.5 px-4">Sách &amp; Danh mục</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-stone-400">
                    Đang tải danh sách banner...
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-stone-400">
                    Chưa có banner nào phù hợp.
                  </td>
                </tr>
              ) : (
                banners.map((item) => {
                  const isHidden = item.status === "inactive";
                  const imgSrc = item.banner_image || item.image;
                  const categoryLabel =
                    item.category_name || item.promo_label || "";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/70 transition"
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-stone-600">
                        #{item.sort_order ?? 0}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <img
                          src={resolveBookImageUrl(imgSrc)}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://placehold.co/192x112/F5EDE2/9A5B13?text=Banner";
                          }}
                          className="w-24 h-14 object-cover rounded-lg border border-stone-200 bg-stone-100"
                        />
                      </td>
                      <td className="py-3.5 px-4 min-w-[240px]">
                        {item.badge_text && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#9A5B13] mb-0.5">
                            {item.badge_text}
                          </span>
                        )}
                        <div className="font-semibold text-[#1A1A1A] line-clamp-1">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.book_title ? (
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F5EDE2] text-[#9A5B13] text-xs font-semibold max-w-[210px] truncate">
                              {item.book_title}
                            </span>
                            {categoryLabel && (
                              <div className="text-[11px] text-stone-500 font-medium">
                                Danh mục:{" "}
                                <span className="text-stone-700 font-semibold">
                                  {categoryLabel}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">
                            Không liên kết
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            !isHidden
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {!isHidden ? "Hiển thị" : "Đang ẩn"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit?.(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] text-xs font-semibold transition cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestToggleStatus?.(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
                          >
                            {!isHidden ? "Ẩn" : "Hiện"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestDelete?.(item)}
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
      </div>

      {/* MODAL THÊM / CẬP NHẬT BANNER */}
      <AdminModal
        open={isModalOpen}
        onClose={onRequestCancelModal}
        subtitle={editingId ? `Banner #${editingId}` : "Quảng bá trang chủ"}
        title={
          editingId ? "Cập Nhật Banner Quảng Cáo" : "Thêm Banner Quảng Cáo Mới"
        }
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={onRequestCancelModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="banner-modal-form"
              className="px-5 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              {editingId ? "Lưu thay đổi" : "Thêm banner"}
            </button>
          </>
        }
      >
        <form
          id="banner-modal-form"
          onSubmit={onRequestSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Tiêu đề Banner <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => onFieldChange?.("title", e.target.value)}
                placeholder="VD: Tuyển Tập Triết Lý Sống Kinh Điển"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Nhãn nổi bật (Badge)</label>
              <input
                type="text"
                value={form.badge_text}
                onChange={(e) => onFieldChange?.("badge_text", e.target.value)}
                placeholder="VD: Ấn phẩm & Trích dẫn nổi bật"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className={labelClass}>
                Sách được liên kết (Sắp xếp A–Z, gõ để tìm)
              </label>
              <SearchableSelect
                options={bookOptions}
                value={form.book_id}
                onChange={(val) => onFieldChange?.("book_id", val)}
                placeholder="-- Chọn đầu sách liên kết --"
                searchPlaceholder="Gõ tên sách, tác giả hoặc mã ID..."
                allowEmpty
                emptyLabel="-- Không liên kết sách --"
                sortOrder="az"
              />
            </div>

            <div className="sm:col-span-4">
              <label className={labelClass}>Thứ tự hiển thị</label>
              <SearchableSelect
                options={sortOrderOptions}
                value={form.sort_order}
                onChange={(val) => onFieldChange?.("sort_order", Number(val))}
                placeholder="Chọn thứ tự"
                searchPlaceholder="Gõ số thứ tự..."
                sortOrder="09"
              />
            </div>
          </div>

          {/* Ô DANH MỤC (NHỎ, KHÓA SỬA, TỰ ĐỘNG THEO SÁCH) & TRẠNG THÁI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Danh mục (Tự động theo sách)
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={selectedBookCategory || ""}
                placeholder="Tự động cập nhật khi chọn sách..."
                className={readOnlyInputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Trạng thái hiển thị</label>
              <SearchableSelect
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(val) => onFieldChange?.("status", val)}
                placeholder="Chọn trạng thái"
                searchPlaceholder="Gõ trạng thái..."
                sortOrder="az"
              />
            </div>
          </div>

          {/* Ô NỘI DUNG QUẢNG CÁO (MỞ RỘNG TO RA) */}
          <div>
            <label className={labelClass}>Nội dung quảng cáo</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => onFieldChange?.("description", e.target.value)}
              placeholder="Nhập nội dung quảng cáo chi tiết hoặc đoạn giới thiệu thu hút độc giả..."
              className={inputClass}
            />
          </div>

          {/* UPLOAD FILE ẢNH BANNER + XEM TRƯỚC */}
          <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Hình ảnh Banner (Tải tệp ảnh từ máy tính)
              </label>
              {(form.image_file || form.banner_image) && (
                <button
                  type="button"
                  onClick={onClearFile}
                  className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Xóa ảnh đã chọn
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onFileChange}
                className="block w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#141414] file:text-white hover:file:bg-stone-800 file:cursor-pointer cursor-pointer"
              />
            </div>

            <div className="text-[11px] text-stone-400">
              Hỗ trợ JPG, PNG, WEBP, GIF (tối đa 5MB). Khuyến nghị tỷ lệ ngang
              16:7 (1400×600px).
            </div>

            {previewUrl && (
              <div className="pt-1">
                <div className="text-[11px] font-semibold text-stone-500 mb-1.5">
                  Xem trước hình ảnh banner:
                </div>
                <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-stone-200 bg-stone-900">
                  <img
                    src={previewUrl}
                    alt="Xem trước banner"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/800x320/1B1714/F3D19E?text=Banner+Preview";
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
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
        onCancel={onCloseConfirm}
      />
    </div>
  );
});

/**
 * SMART COMPONENT: Quản lý state, gọi API multipart/form-data & đồng bộ dữ liệu
 */
export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

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

  const getAuthHeaders = useCallback((extra = {}) => {
    const token = localStorage.getItem("token");
    return {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }, []);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/banners", {
        headers: getAuthHeaders(),
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setBanners(list);
      localStorage.setItem(ADMIN_BANNERS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          "Không thể tải danh sách banner từ máy chủ.",
      });
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchBanners();

    axios
      .get("/api/products", {
        params: { per_page: 200 },
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        const list = res.data?.data || [];
        setBooks(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, [fetchBanners]);

  const bookOptions = useMemo(() => {
    return books.map((b) => {
      const title = String(b.name || b.title || `Sách #${b.id}`).trim();
      const author = b.author ? ` — ${b.author}` : "";
      const categoryName =
        typeof b.category === "string"
          ? b.category
          : b.category?.name || b.category_name || "";
      return {
        value: b.id,
        label: `${title}${author}`,
        subLabel: categoryName
          ? `Danh mục: ${categoryName} · Mã #${b.id}`
          : `Mã sách #${b.id}`,
        categoryName,
        keywords: `${b.id} ${title} ${b.author || ""} ${categoryName}`,
        sortKey: title,
      };
    });
  }, [books]);

  const selectedBookCategory = useMemo(() => {
    if (!form.book_id) return "";
    const matched = bookOptions.find(
      (opt) => String(opt.value) === String(form.book_id)
    );
    return matched?.categoryName || form.category_name || "";
  }, [form.book_id, form.category_name, bookOptions]);

  const sortOrderOptions = useMemo(() => {
  const maxOrder = Math.max(1, editingId ? banners.length : banners.length + 1);
  return Array.from({ length: maxOrder + 1 }, (_, i) => ({
    value: i,
    label: i === 0 ? "0 — Ưu tiên đầu tiên" : `Vị trí số ${i}`,
    sortKey: i,
  }));
}, [banners.length, editingId]);

  const filteredBanners = useMemo(() => {
    const kw = searchQuery.trim().toLowerCase();
    return banners.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (!kw) return true;
      const haystack = `${item.title || ""} ${item.description || ""} ${
        item.book_title || ""
      } ${item.category_name || ""}`.toLowerCase();
      return haystack.includes(kw);
    });
  }, [banners, searchQuery, statusFilter]);

  const resetAndCloseModal = useCallback(() => {
    if (form.image_preview && form.image_preview.startsWith("blob:")) {
      URL.revokeObjectURL(form.image_preview);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }, [form.image_preview]);

  const requestCancelModal = useCallback(() => {
    setConfirmState({
      open: true,
      variant: "danger",
      title: "Xác nhận hủy thao tác",
      message:
        "Bạn có chắc chắn muốn hủy và đóng biểu mẫu banner? Nội dung chưa lưu sẽ bị mất.",
      detailText: form.title ? `Banner: ${form.title}` : "",
      confirmText: "Đồng ý hủy",
      cancelText: "Tiếp tục nhập",
      action: () => {
        resetAndCloseModal();
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  }, [form.title, resetAndCloseModal]);

  const handleOpenCreate = useCallback(() => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      sort_order: banners.length + 1,
    });
    setMsg({ type: "", text: "" });
    setIsModalOpen(true);
  }, [banners.length]);

  const handleEdit = useCallback((banner) => {
    setEditingId(banner.id);
    setForm({
      badge_text: banner.badge_text || "Ấn phẩm & Trích dẫn nổi bật",
      title: banner.title || "",
      description: banner.description || "",
      banner_image: banner.banner_image || banner.image || "",
      image_file: null,
      image_preview: "",
      remove_image: false,
      book_id: banner.product_id || banner.book_id || "",
      category_name: banner.category_name || banner.promo_label || "",
      sort_order: Number(banner.sort_order ?? 0),
      status: banner.status || "active",
    });
    setMsg({ type: "", text: "" });
    setIsModalOpen(true);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => {
      if (field === "book_id" && !value) {
        return { ...prev, book_id: "", category_name: "" };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMsg({
        type: "error",
        text: "Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.",
      });
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    setForm((prev) => {
      if (prev.image_preview && prev.image_preview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.image_preview);
      }
      return {
        ...prev,
        image_file: file,
        image_preview: preview,
        remove_image: false,
      };
    });
  }, []);

  const handleClearFile = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setForm((prev) => {
      if (prev.image_preview && prev.image_preview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.image_preview);
      }
      return {
        ...prev,
        image_file: null,
        image_preview: "",
        banner_image: "",
        remove_image: true,
      };
    });
  }, []);

  const executeSaveBanner = async () => {
    setActionLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("badge_text", form.badge_text.trim());
      formData.append("promo_label", selectedBookCategory || "");
      formData.append("description", form.description.trim());
      formData.append("status", form.status);
      formData.append("sort_order", String(form.sort_order ?? 0));
      formData.append("product_id", form.book_id ? String(form.book_id) : "");

      if (form.image_file instanceof File) {
        formData.append("image_file", form.image_file);
      } else if (form.remove_image) {
        formData.append("remove_image", "1");
      } else if (form.banner_image) {
        formData.append("banner_image", form.banner_image);
      }

      if (editingId) {
        formData.append("_method", "PUT");
        await axios.post(`/api/admin/banners/${editingId}`, formData, {
          headers: getAuthHeaders({ "Content-Type": "multipart/form-data" }),
        });
        setMsg({ type: "success", text: "Đã cập nhật banner quảng cáo!" });
      } else {
        await axios.post("/api/admin/banners", formData, {
          headers: getAuthHeaders({ "Content-Type": "multipart/form-data" }),
        });
        setMsg({ type: "success", text: "Đã thêm banner quảng cáo mới!" });
      }

      await fetchBanners();
      window.dispatchEvent(new CustomEvent("banners-updated"));
      resetAndCloseModal();
    } catch (err) {
      const firstErr = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null;
      setMsg({
        type: "error",
        text:
          firstErr ||
          err.response?.data?.message ||
          "Không thể lưu banner quảng cáo.",
      });
    } finally {
      setActionLoading(false);
      setConfirmState((prev) => ({ ...prev, open: false }));
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setMsg({ type: "error", text: "Vui lòng nhập tiêu đề banner." });
      return;
    }

    setConfirmState({
      open: true,
      variant: "info",
      title: editingId
        ? "Xác nhận cập nhật banner"
        : "Xác nhận thêm banner mới",
      message: editingId
        ? "Bạn có chắc chắn muốn lưu thay đổi cho banner quảng cáo này?"
        : "Bạn có chắc chắn muốn đăng banner quảng cáo mới lên trang chủ?",
      detailText: form.title,
      confirmText: editingId ? "Lưu thay đổi" : "Thêm banner",
      cancelText: "Quay lại",
      action: executeSaveBanner,
    });
  };

  const requestToggleStatus = useCallback(
    (banner) => {
      const nextLabel = banner.status === "inactive" ? "Hiển thị" : "Ẩn";
      setConfirmState({
        open: true,
        variant: "warning",
        title: `Xác nhận ${nextLabel.toLowerCase()} banner`,
        message: `Bạn có chắc chắn muốn ${nextLabel.toLowerCase()} banner "${
          banner.title
        }" trên trang chủ?`,
        detailText: banner.title,
        confirmText: `Xác nhận ${nextLabel}`,
        cancelText: "Hủy",
        action: async () => {
          setActionLoading(true);
          try {
            await axios.patch(
              `/api/admin/banners/${banner.id}/toggle`,
              {},
              { headers: getAuthHeaders() }
            );
            await fetchBanners();
            window.dispatchEvent(new CustomEvent("banners-updated"));
            setMsg({
              type: "success",
              text: `Đã cập nhật trạng thái banner "${banner.title}".`,
            });
          } catch (err) {
            setMsg({
              type: "error",
              text:
                err.response?.data?.message ||
                "Không thể thay đổi trạng thái banner.",
            });
          } finally {
            setActionLoading(false);
            setConfirmState((prev) => ({ ...prev, open: false }));
          }
        },
      });
    },
    [fetchBanners, getAuthHeaders]
  );

  const requestDeleteBanner = useCallback(
    (banner) => {
      setConfirmState({
        open: true,
        variant: "danger",
        title: "Xác nhận xóa banner quảng cáo",
        message: "Bạn có chắc chắn muốn xóa vĩnh viễn banner này?",
        detailText: banner.title,
        confirmText: "Xóa banner",
        cancelText: "Hủy",
        action: async () => {
          setActionLoading(true);
          try {
            await axios.delete(`/api/admin/banners/${banner.id}`, {
              headers: getAuthHeaders(),
            });
            await fetchBanners();
            window.dispatchEvent(new CustomEvent("banners-updated"));
            if (editingId === banner.id) resetAndCloseModal();
            setMsg({ type: "success", text: "Đã xóa banner quảng cáo." });
          } catch (err) {
            setMsg({
              type: "error",
              text: err.response?.data?.message || "Không thể xóa banner.",
            });
          } finally {
            setActionLoading(false);
            setConfirmState((prev) => ({ ...prev, open: false }));
          }
        },
      });
    },
    [editingId, fetchBanners, getAuthHeaders, resetAndCloseModal]
  );

  return (
    <BannerManagementView
      banners={filteredBanners}
      bookOptions={bookOptions}
      sortOrderOptions={sortOrderOptions}
      selectedBookCategory={selectedBookCategory}
      loading={loading}
      msg={msg}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      onSearchQueryChange={setSearchQuery}
      onStatusFilterChange={setStatusFilter}
      isModalOpen={isModalOpen}
      editingId={editingId}
      form={form}
      fileInputRef={fileInputRef}
      onOpenCreate={handleOpenCreate}
      onEdit={handleEdit}
      onRequestCancelModal={requestCancelModal}
      onFieldChange={handleFieldChange}
      onFileChange={handleFileChange}
      onClearFile={handleClearFile}
      onRequestSubmit={handleRequestSubmit}
      onRequestToggleStatus={requestToggleStatus}
      onRequestDelete={requestDeleteBanner}
      confirmState={confirmState}
      actionLoading={actionLoading}
      onCloseConfirm={() =>
        !actionLoading &&
        setConfirmState((prev) => ({ ...prev, open: false }))
      }
    />
  );
}