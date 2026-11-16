import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import Home from './pages/Home';
import Forbidden from './pages/Forbidden';
import CategoryManagement from './pages/admin/CategoryManagement';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const pathname = window.location.pathname;
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  const [adminStatus, setAdminStatus] = useState(() => {
    if (!pathname.startsWith('/admin')) return 'not-admin-route';
    if (!token || !user) return 'unauthenticated';
    if (user.role !== 'admin') return 'forbidden';
    return 'checking';
  });

  useEffect(() => {
    if (adminStatus !== 'checking') return;

    axios
      .get('/api/admin', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setAdminStatus('authorized'))
      .catch((err) => {
        if (err.response?.status === 403) {
          setAdminStatus('forbidden');
        } else {
          setAdminStatus('unauthenticated');
        }
      });
  }, [adminStatus, token]);

  // Hiển thị trang từ chối truy cập nếu vào /403 hoặc customer cố vào /admin
  if (pathname === '/403' || adminStatus === 'forbidden') {
    return <Forbidden />;
  }

  // Xử lý khu vực /admin
  if (pathname.startsWith('/admin')) {
    if (adminStatus === 'unauthenticated') {
      window.location.href = '/';
      return null;
    }

    if (adminStatus === 'checking') {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-sm text-stone-500">
          Đang kiểm tra quyền truy cập...
        </div>
      );
    }

    // Giao diện khi đã xác thực đúng vai trò admin
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Thanh tiêu đề & Điều hướng Admin */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#9A5B13]">
                Mọt Sách BookHouse
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1">
                {pathname === '/admin/categories'
                  ? 'Quản lý danh mục sách'
                  : 'Trang quản trị Admin'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/admin"
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  pathname === '/admin'
                    ? 'bg-[#9A5B13] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Tổng quan
              </a>
              <a
                href="/admin/categories"
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  pathname === '/admin/categories'
                    ? 'bg-[#9A5B13] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Quản lý danh mục
              </a>
              <a
                href="/"
                className="px-4 py-2 rounded-xl bg-[#141414] text-white text-xs font-semibold hover:bg-stone-800 transition"
              >
                Về trang chủ
              </a>
            </div>
          </div>

          {/* Nội dung từng trang con trong Admin */}
          {pathname === '/admin/categories' ? (
            <CategoryManagement />
          ) : (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-stone-600 mb-4">
                Xin chào quản trị viên. Chọn chức năng bên dưới để bắt đầu quản lý hệ thống:
              </p>
              <a
                href="/admin/categories"
                className="inline-block px-4 py-2.5 rounded-xl bg-[#141414] text-white text-xs font-semibold hover:bg-stone-800 transition"
              >
                Đi tới Quản lý danh mục →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <Home />;
}

const rootElement = document.getElementById('app');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}