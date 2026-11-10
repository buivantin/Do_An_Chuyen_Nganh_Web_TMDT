import React from 'react';
export default function Header() {
  return (
    <header style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Mọt Sách BookStore</h2>
        <input type="text" placeholder="Tìm kiếm sách, tác giả..." style={{ width: '40%', padding: '8px' }} />
        <div>
          <button style={{ marginRight: '10px' }}>🛒 Giỏ hàng (0)</button>
          <button>Đăng nhập</button>
        </div>
      </div>
    </header>
  );
}