import React from 'react';
import MainLayout from '../layouts/MainLayout';


export default function HomeSample() {
  return (
    <MainLayout>
      <div style={{ padding: '20px', background: '#e9ecef', borderRadius: '5px' }}>
        <h3>Trang mẫu giao diện (React Layout)</h3>
        <p>Đây là layout dùng chung cho các màn hình tiếp theo.</p>
      </div>
    </MainLayout>
  );
}