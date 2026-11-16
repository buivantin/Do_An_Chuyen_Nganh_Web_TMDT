import React, { useState } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

export default function MainLayout({ children }) {
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9] text-stone-900">
      <Header
        user={user}
        onOpenLogin={() => setAuthModal('login')}
        onLogout={() => setUser(null)}
      />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      <LoginModal
        isOpen={authModal === 'login'}
        onClose={() => setAuthModal(null)}
        onLoginSuccess={(userData) => setUser(userData)}
        onSwitchToRegister={() => setAuthModal('register')}
      />

      <RegisterModal
        isOpen={authModal === 'register'}
        onClose={() => setAuthModal(null)}
        onRegisterSuccess={(userData) => setUser(userData)}
        onSwitchToLogin={() => setAuthModal('login')}
      />
    </div>
  );
}