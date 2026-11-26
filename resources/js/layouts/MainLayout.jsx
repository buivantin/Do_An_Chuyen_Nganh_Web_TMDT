import React from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import FloatingContactBubbles from "../components/FloatingContactBubbles";

function normalizeUser(u) {
  if (!u) return null;
  return {
    ...u,
    name: u.name || u.username || u.email,
  };
}

export default function MainLayout({ children }) {
  const {
    user,
    setUser,
    refreshUser,
    logout,
    authModal,
    setAuthModal,
    closeAuthModal,
  } = useAuth();

  const handleAuthSuccess = async (loggedInUser) => {
    const normalized = normalizeUser(loggedInUser);
    if (normalized) {
      localStorage.setItem("user", JSON.stringify(normalized));
      setUser(normalized);
    }
    closeAuthModal();
    await refreshUser();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9] text-stone-900">
      <Header
        user={user}
        onOpenAuthModal={setAuthModal}
        onLogout={logout}
      />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      <FloatingContactBubbles />

      <AuthModal
        open={Boolean(authModal)}
        initialMode={authModal || "login"}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}