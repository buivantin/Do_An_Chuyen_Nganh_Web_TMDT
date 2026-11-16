import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });

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
      setLoading(true);
      const res = await axios.get('/api/admin/categories', getAuthConfig());
      setCategories(res.data.data || []);
    } catch (error) {
      setAlertMessage({
        type: 'error',
        text: 'Không thể tải danh sách danh mục.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', status: 'active' });
    setServerErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});
    setAlertMessage({ type: '', text: '' });

    try {
      if (editingId) {
        const res = await axios.put(
          `/api/admin/categories/${editingId}`,
          formData,
          getAuthConfig()
        );
        setAlertMessage({ type: 'success', text: res.data.message });
      } else {
        const res = await axios.post(
          '/api/admin/categories',
          formData,
          getAuthConfig()
        );
        setAlertMessage({ type: 'success', text: res.data.message });
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setServerErrors(error.response.data.errors);
      } else {
        setAlertMessage({
          type: 'error',
          text:
            error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.',
        });
      }
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      status: category.status || 'active',
    });
    setServerErrors({});
    setAlertMessage({ type: '', text: '' });
  };

  const handleDelete = async (category) => {
    setAlertMessage({ type: '', text: '' });

    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      const res = await axios.delete(
        `/api/admin/categories/${category.id}`,
        getAuthConfig()
      );
      setAlertMessage({ type: 'success', text: res.data.message });
      if (editingId === category.id) resetForm();
      fetchCategories();
    } catch (error) {
      setAlertMessage({
        type: 'error',
        text:
          error.response?.data?.message || 'Không thể xóa danh mục này.',
      });
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Thêm / Sửa danh mục */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 h-fit">
          <h2 className="font-serif text-lg font-bold text-[#1A1A1A] mb-4">
            {editingId ? `Cập nhật danh mục #${editingId}` : 'Thêm danh mục mới'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="VD: Tiểu thuyết trinh thám"
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
              />
              {serverErrors.name && (
                <p className="text-red-600 text-xs mt-1">
                  {serverErrors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Mô tả
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả ngắn về danh mục..."
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
              />
              {serverErrors.description && (
                <p className="text-red-600 text-xs mt-1">
                  {serverErrors.description[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9A5B13]"
              >
                <option value="active">Hiển thị (Active)</option>
                <option value="inactive">Đang ẩn (Inactive)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#141414] hover:bg-stone-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition"
              >
                {editingId ? 'Lưu thay đổi' : 'Thêm danh mục'}
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

        {/* Bảng danh sách danh mục */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Tên danh mục</th>
                  <th className="py-3.5 px-4">Mô tả</th>
                  <th className="py-3.5 px-4 text-center">Số SP</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-stone-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-stone-400">
                      Chưa có danh mục nào.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-stone-50/70">
                      <td className="py-3.5 px-4 font-medium text-stone-600">
                        #{cat.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1A1A1A]">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block bg-amber-50 text-[#9A5B13] font-semibold px-2.5 py-0.5 rounded-full text-xs">
                          {cat.products_count ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cat.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {cat.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="text-[#9A5B13] hover:underline text-xs font-semibold"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
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
        </div>
      </div>
    </div>
  );
}