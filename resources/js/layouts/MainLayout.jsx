import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import FloatingContactBubbles from "../components/FloatingContactBubbles";

function normalizeUser(u) {
    if (!u) return null;
    return {
        ...u,
        name: u.name || u.username || u.email,
    };
}

function getStoredUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
}

export default function MainLayout({ children }) {
    const [user, setUser] = useState(() => getStoredUser());
    const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register'

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        axios
            .get("/api/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            })
            .then((res) => {
                const normalized = normalizeUser(res.data);
                if (normalized?.id) {
                    setUser(normalized);
                    localStorage.setItem("user", JSON.stringify(normalized));
                }
            })
            .catch(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            });
    }, []);

    // CHỈ SỬA TẠI ĐÂY: Lưu token khi đăng nhập thành công
    const handleAuthSuccess = (data) => {
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        const userData = data.user ? data.user : data;
        const normalized = normalizeUser(userData);
        
        if (normalized) {
            localStorage.setItem("user", JSON.stringify(normalized));
            setUser(normalized);
        }
        setAuthModal(null);
    };

    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        try {
            if (token) {
                await axios.post(
                    "/api/logout",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    },
                );
            }
        } catch {
            // Bỏ qua nếu token đã hết hạn
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FCFBF9] text-stone-900">
            <Header
                user={user}
                onOpenLogin={() => setAuthModal("login")}
                onLogout={handleLogout}
            />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />

            <FloatingContactBubbles />

            <LoginModal
                isOpen={authModal === "login"}
                onClose={() => setAuthModal(null)}
                onLoginSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setAuthModal("register")}
            />

            <RegisterModal
                isOpen={authModal === "register"}
                onClose={() => setAuthModal(null)}
                onRegisterSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setAuthModal("login")}
            />
        </div>
    );
}