import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EMPTY_FORM = {
  name: '',
  author: '',
  price: '',
  stock: '',
  category_id: '',
  status: 'active',
  description: '',
  image: null,
};

const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    Number(value)
  );

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ keyword: '', category_id: '', page: 1 });
  const [searchInput, setSearchInput] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [currentImage, setCurrentImage] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const [serverErrors, setServerErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    };
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories', getAuthConfig());
      setCategories(res.data.data || []);
    } catch (error) {
      setAlertMessage({ type: 'error', text: 'Không thể tải danh sách danh mục.' });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/products', {
        ...getAuthConfig(),
        params: {
          keyword: filters.keyword || undefined,
          category_id: filters.category_id || undefined,
          page: filters.page,
        },
      });
      const list = res.data.data || [];

      // Xóa hết sản phẩm ở trang cuối thì lùi về trang trước
      if (list.length === 0 && filters.page > 1) {
        setFilters((f) => ({ ...f, page: f.page - 1 }));
        return;
      }

      setProducts(list);
      setMeta({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (error) {
      setAlertMessage({ type: 'error', text: 'Không thể tải danh sách sản phẩm.' });
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
    categories.find((c) => c.id === id)?.name ?? `#${id}`;

  const resetForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setCurrentImage(null);
    setFileKey((k) => k + 1); // xóa tệp đang chọn trong ô input
    setServerErrors({});
  };

  const setImageError = (text) => {
    setServerErrors((prev) => ({ ...prev, image: [text] }));
    setFileKey((k) => k + 1);
    setFormData((f) => ({ ...f, image: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0] ?? null;

    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setImageError('Ảnh chỉ nhận định dạng JPG hoặc PNG.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setImageError('Ảnh không được vượt quá 2 MB.');
        return;
      }
    }

    setServerErrors((prev) => {
      const { image, ...rest } = prev;
      return rest;
    });
    setFormData((f) => ({ ...f, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});
    setAlertMessage({ type: '', text: '' });
    setSaving(true);

    // Có tệp ảnh nên gửi bằng FormData, không gửi JSON
    const fd = new FormData();
    ['name', 'author', 'price', 'stock', 'category_id', 'status', 'description'].forEach(
      (key) => fd.append(key, formData[key] ?? '')
    );
    if (formData.image) fd.append('image', formData.image);
    // PHP không đọc được form-data của PUT thật: gửi POST kèm _method=PUT
    if (editingId) fd.append('_method', 'PUT');

    try {
      await axios.post(
        editingId ? `/api/admin/products/${editingId}` : '/api/admin/products',
        fd,
        getAuthConfig()
      );
      setAlertMessage({
        type: 'success',
        text: editingId ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm mới.',
      });
      resetForm();
      fetchProducts();
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
      } else {
        setAlertMessage({
          type: 'error',
          text: error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm.',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      author: product.author || '',
      // decimal trả về "339000.00": đổi về số nguyên, nếu không server báo lỗi
      price: String(Math.round(Number(product.price))),
      stock: String(product.stock),
      category_id: String(product.category_id),
      status: product.status || 'active',
      description: product.description || '',
      image: null,
    });
    setCurrentImage(product.image || null);
    setFileKey((k) => k + 1);
    setServerErrors({});
    setAlertMessage({ type: '', text: '' });
  };

  const handleToggle = async (product) => {
    setAlertMessage({ type: '', text: '' });
    try {
      await axios.put(
        `/api/admin/products/${product.id}/toggle-status`,
        {},
        getAuthConfig()
      );
      fetchProducts();
    } catch (error) {
      setAlertMessage({
        type: 'error',
        text: error.response?.data?.message || 'Không thể đổi trạng thái.',
      });
    }
  };

  const handleDelete = async (product) => {
    setAlertMessage({ type: '', text: '' });

    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }

    try {
      const res = await axios.delete(
        `/api/admin/products/${product.id}`,
        getAuthConfig()
      );
      setAlertMessage({ type: 'success', text: res.data.message });
      if (editingId === product.id) resetForm();
      fetchProducts();
    } catch (error) {
      setAlertMessage({
        type: 'error',
        text: error.response?.data?.message || 'Không thể xóa sản phẩm này.',
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, keyword: searchInput.trim(), page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ keyword: '', category_id: '', page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.last_page) {
      setFilters((f) => ({ ...f, page: newPage }));
    }
  };

  const inputClass =
    'w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]';
  const labelClass =
    'block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5';

  const FieldError = ({ name }) =>
    serverErrors[name] ? (
      <p className="text-red-600 text-xs mt-1">{serverErrors[name][0]}</p>
    ) : null;

  return (
    <div className="space-y-6">
      {alertMessage.text && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {alertMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        {/* Form Thêm / Sửa sản phẩm */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 h-fit">
          <h2 className="font-serif text-lg font-bold text-[#1A1A1A] mb-4">
            {editingId ? `Cập nhật sản phẩm #${editingId}` : 'Thêm sản phẩm mới'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>
                Tên sách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="VD: Paulo Coelho"
                className={inputClass}
              />
              <FieldError name="author" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Giá (đ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="120000"
                  className={inputClass}
                />
                <FieldError name="price" />
              </div>

              <div>
                <label className={labelClass}>
                  Tồn kho <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="10"
                  className={inputClass}
                />
                <FieldError name="stock" />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={inputClass}
              >
                <option value="active">Hiển thị (Active)</option>
                <option value="hidden">Đang ẩn (Hidden)</option>
              </select>
              <FieldError name="status" />
            </div>

            <div>
              <label className={labelClass}>Mô tả</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả ngắn về cuốn sách..."
                className={inputClass}
              />
              <FieldError name="description" />
            </div>

            <div>
              <label className={labelClass}>Ảnh bìa (JPG/PNG, tối đa 2 MB)</label>
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
                className="block w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-stone-100 file:text-stone-700 file:font-semibold"
              />
              <FieldError name="image" />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#141414] hover:bg-stone-800 disabled:opacity-60 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition"
              >
                {saving
                  ? 'Đang lưu...'
                  : editingId
                  ? 'Lưu thay đổi'
                  : 'Thêm sản phẩm'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Bộ lọc + bảng sản phẩm */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <form
            onSubmit={handleSearch}
            className="flex flex-wrap items-center gap-2 p-4 border-b border-stone-200"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên sách..."
              className="flex-1 min-w-[180px] px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
            />
            <select
              value={filters.category_id}
              onChange={(e) =>
                setFilters({ ...filters, category_id: e.target.value, page: 1 })
              }
              className="px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-[#141414] hover:bg-stone-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition"
            >
              Tìm
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition"
            >
              Xóa lọc
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Sách</th>
                  <th className="py-3.5 px-4">Danh mục</th>
                  <th className="py-3.5 px-4 text-right">Giá</th>
                  <th className="py-3.5 px-4 text-center">Kho</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-stone-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-stone-400">
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/70">
                      <td className="py-3.5 px-4 font-medium text-stone-600">
                        #{p.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt=""
                              className="w-10 h-14 object-cover rounded-md border border-stone-200"
                            />
                          ) : (
                            <div className="w-10 h-14 rounded-md bg-stone-100" />
                          )}
                          <div>
                            <div className="font-semibold text-[#1A1A1A]">{p.name}</div>
                            <div className="text-xs text-stone-500">
                              {p.author || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {categoryName(p.category_id)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold whitespace-nowrap">
                        {formatVND(p.price)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            p.stock === 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-50 text-[#9A5B13]'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {p.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-[#9A5B13] hover:underline text-xs font-semibold"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggle(p)}
                          className="text-stone-600 hover:underline text-xs font-semibold"
                        >
                          {p.status === 'active' ? 'Ẩn' : 'Hiện'}
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="text-red-600 hover:underline text-xs font-semibold"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang phía server */}
          <div className="flex justify-between items-center p-4 border-t border-stone-200">
            <span className="text-sm text-stone-500">
              Trang {meta.current_page} / {meta.last_page}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
                className="px-4 py-2 border border-stone-300 rounded-lg text-sm disabled:opacity-50 hover:bg-stone-50 transition cursor-pointer disabled:cursor-not-allowed"
              >
                Trang trước
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(meta.current_page + 1)}
                disabled={meta.current_page >= meta.last_page}
                className="px-4 py-2 border border-stone-300 rounded-lg text-sm disabled:opacity-50 hover:bg-stone-50 transition cursor-pointer disabled:cursor-not-allowed"
              >
                Trang sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}