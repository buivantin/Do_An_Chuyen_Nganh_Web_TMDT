import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

// Pages & Components
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import Forbidden from './pages/Forbidden';
import AdminPanel from './pages/Admin/AdminPanel';

import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import MainLayout from './layouts/MainLayout';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  // --- 1. CÁC TRANG ĐỘC LẬP ---
  if (pathname === '/cart') {
    return <Cart />;
  }

  if (pathname === '/checkout') {
    return <Checkout />;
  }

  const token = localStorage.getItem('token');
  const user = getStoredUser();

  // --- 2. XỬ LÝ KHU VỰC ADMIN ---
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

  if (pathname === '/403' || adminStatus === 'forbidden') {
    return <Forbidden />;
  }

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

    // Render toàn bộ giao diện Sidebar & các phân hệ quản lý từ AdminPanel
    return <AdminPanel />;
  }

  // --- 3. CÁC TRANG DÀNH CHO KHÁCH HÀNG ---
  const productDetailMatch = pathname.match(/^\/products\/(\d+)$/);
  if (productDetailMatch) {
    return <ProductDetail productId={productDetailMatch[1]} />;
  }

  if (pathname.startsWith('/products')) {
    return <ProductList />;
  }

  if (pathname === '/account' || pathname === '/profile') {
    return (
      <MainLayout>
        <Account />
      </MainLayout>
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