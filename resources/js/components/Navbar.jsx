import React from 'react';
export default function Navbar() {
  const categories = ['Văn học', 'Kinh tế', 'Kỹ năng sống', 'CNTT & Lập trình', 'Ngoại ngữ'];
  return (
    <nav style={{ background: '#343a40', padding: '10px 0' }}>
      <ul style={{ display: 'flex', listStyle: 'none', margin: 0, gap: '20px', paddingLeft: '20px' }}>
        {categories.map((cat, idx) => (
          <li key={idx}><a href="#" style={{ color: '#fff', textDecoration: 'none' }}>{cat}</a></li>
        ))}
      </ul>
    </nav>
  );
}