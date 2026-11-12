import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Navbar />
      <main style={{ flex: 1, padding: '20px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}