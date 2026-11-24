import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ADMIN_BANNERS_STORAGE_KEY,
  DEFAULT_HERO_BANNERS,
} from "../../data/homeMockData";
import { resolveBookImageUrl } from "../../components/ProductCard";
import AdminModal from "../../components/admin/AdminModal";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";

const EMPTY_FORM = {
  title: "",
  quote: "",
  description: "",
  banner_image: "",
  book_id: "",
  badge_text: "Ấn phẩm & Trích dẫn nổi bật",
  status: "active",
};

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

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

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("/api/products?per_page=100", {
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        const list = res.data?.data || [];
        setBooks(Array.isArray(list) ? list : []);
      })
      .catch(() => {});

    axios
      .get("/api/admin/banners", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setBanners(list);
          return;
        }
        throw new Error("empty");
      })
      .catch(() => {
        try {
          const saved = JSON.parse(
            localStorage.getItem(ADMIN_BANNERS_STORAGE_KEY) || "null"
          );
          setBanners(
            Array.isArray(saved) && saved.length > 0
              ? saved
              : DEFAULT_HERO_BANNERS
          );
        } catch {
          setBanners(DEFAULT_HERO_BANNERS);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const persistBannersLocal = (nextList) => {
    setBanners(nextList);
    localStorage.setItem(ADMIN_BANNERS_STORAGE_KEY, JSON.stringify(nextList));
    window.dispatchEvent(new CustomEvent("banners-updated"));
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const requestCancelModal = () => {
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
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMsg({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || "",
      quote: banner.quote || "",
      description: banner.description || "",
      banner_image: banner.banner_image || "",
      book_id: banner.book_id || "",
      badge_text: banner.badge_text || "Ấn phẩm & Trích dẫn nổi bật",
      status: banner.status || "active",
    });
    setMsg({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const executeSaveBanner = async () => {
    setActionLoading(true);
    setMsg({ type: "", text: "" });

    const linkedBook = books.find(
      (b) => String(b.id) === String(form.book_id)
    );

    const payload = {
      ...form,
      book_id: linkedBook ? linkedBook.id : form.book_id || null,
      book_title: linkedBook ? linkedBook.name || linkedBook.title : "",
      book_author: linkedBook ? linkedBook.author : "",
      book_image: linkedBook ? linkedBook.image : "",
    };

    try {
      if (editingId) {
        await axios.put(`/api/admin/banners/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/admin/banners", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Fallback đồng bộ localStorage
    }

    if (editingId) {
      const next = banners.map((b) =>
        b.id === editingId ? { ...b, ...payload, id: editingId } : b
      );
      persistBannersLocal(next);
      setMsg({ type: "success", text: "Đã cập nhật banner quảng cáo!" });
    } else {
      const next = [{ ...payload, id: Date.now() }, ...banners];
      persistBannersLocal(next);
      setMsg({ type: "success", text: "Đã thêm banner quảng cáo mới!" });
    }

    setActionLoading(false);
    setConfirmState((prev) => ({ ...prev, open: false }));
    resetAndCloseModal();
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

  const requestToggleStatus = (banner) => {
    const nextStatus = banner.status === "inactive" ? "active" : "inactive";
    const label = nextStatus === "active" ? "Hiển thị" : "Ẩn";
    setConfirmState({
      open: true,
      variant: "warning",
      title: `Xác nhận ${label.toLowerCase()} banner`,
      message: `Bạn có chắc chắn muốn ${label.toLowerCase()} banner "${
        banner.title
      }" trên trang chủ?`,
      detailText: banner.title,
      confirmText: `Xác nhận ${label}`,
      cancelText: "Hủy",
      action: () => {
        const next = banners.map((b) =>
          b.id === banner.id ? { ...b, status: nextStatus } : b
        );
        persistBannersLocal(next);
        setMsg({
          type: "success",
          text: `Đã cập nhật trạng thái banner "${banner.title}".`,
        });
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const requestDeleteBanner = (banner) => {
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
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // ignore
        }
        const next = banners.filter((b) => b.id !== banner.id);
        persistBannersLocal(next);
        if (editingId === banner.id) resetAndCloseModal();
        setMsg({ type: "success", text: "Đã xóa banner quảng cáo." });
        setActionLoading(false);
        setConfirmState((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const inputClass =
    "w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13]";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5";

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
        <div className="p-4 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
              Danh Sách Banner Quảng Cáo
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Quản lý slide quảng bá, trích dẫn nổi bật và sách liên kết tại
              trang chủ
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs shrink-0"
          >
            <span className="text-base leading-none">+</span>
            <span>Thêm banner mới</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4">Hình ảnh</th>
                <th className="py-3.5 px-4">Tiêu đề & Trích dẫn</th>
                <th className="py-3.5 px-4">Sách liên kết</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-stone-400">
                    Đang tải danh sách banner...
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-stone-400">
                    Chưa có banner nào.
                  </td>
                </tr>
              ) : (
                banners.map((item) => {
                  const isHidden = item.status === "inactive";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/70 transition"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <img
                          src={resolveBookImageUrl(item.banner_image)}
                          alt={item.title}
                          className="w-24 h-14 object-cover rounded-lg border border-stone-200 bg-stone-100"
                        />
                      </td>
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="font-semibold text-[#1A1A1A] line-clamp-1">
                          {item.title}
                        </div>
                        {item.quote && (
                          <div className="text-xs italic text-[#9A5B13] line-clamp-1 mt-0.5">
                            &ldquo;{item.quote}&rdquo;
                          </div>
                        )}
                        {item.description && (
                          <div className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.book_title ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F5EDE2] text-[#9A5B13] text-xs font-semibold">
                            {item.book_title}
                          </span>
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
                            onClick={() => handleEdit(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F5EDE2] border border-[#E5D5BE] text-[#9A5B13] text-xs font-semibold transition cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => requestToggleStatus(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
                          >
                            {!isHidden ? "Ẩn" : "Hiện"}
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteBanner(item)}
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

      <AdminModal
        open={isModalOpen}
        onClose={requestCancelModal}
        subtitle={editingId ? `Banner #${editingId}` : "Quảng bá trang chủ"}
        title={
          editingId ? "Cập Nhật Banner Quảng Cáo" : "Thêm Banner Quảng Cáo Mới"
        }
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
          onSubmit={handleRequestSubmit}
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
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VD: Tuyển Tập Triết Lý Sống Kinh Điển"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Sách được liên kết</label>
              <select
                value={form.book_id}
                onChange={(e) => setForm({ ...form, book_id: e.target.value })}
                className={inputClass}
              >
                <option value="">-- Chọn đầu sách liên kết --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.id} - {b.name || b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Câu nói hay / Trích dẫn nổi bật
            </label>
            <textarea
              rows={2}
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="Nhập câu trích dẫn hay hoặc điểm nổi bật của cuốn sách..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nội dung quảng cáo ngắn</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Mô tả ngắn thu hút độc giả..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Trạng thái hiển thị</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                <option value="active">Hiển thị (Active)</option>
                <option value="inactive">Đang ẩn (Inactive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Hình ảnh Banner (URL hoặc đường dẫn /imgs/...)
            </label>
            <input
              type="text"
              value={form.banner_image}
              onChange={(e) =>
                setForm({ ...form, banner_image: e.target.value })
              }
              placeholder="https://... hoặc /imgs/banner1.jpg"
              className={inputClass}
            />
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