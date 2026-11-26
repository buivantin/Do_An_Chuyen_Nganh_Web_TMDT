import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function calculateMemberTier(totalSpentValue) {
  const totalSpent = Number(totalSpentValue || 0);

  if (totalSpent >= 5000000) {
    return {
      name: "Đại Sứ Tri Thức",
      icon: "👑",
      badgeClass: "bg-[#F5EDE2] border-[#E5D5BE] text-[#9A5B13]",
      hint: "Danh hiệu cao quý nhất tại BookHouse.",
      progressPercent: 100,
    };
  }
  if (totalSpent >= 2500000) {
    return {
      name: "Học Giả",
      icon: "🏅",
      badgeClass: "bg-yellow-50 border-yellow-300 text-yellow-900",
      hint: `Mua thêm ${(5000000 - totalSpent).toLocaleString("vi-VN")}đ để đạt Đại Sứ Tri Thức`,
      progressPercent: Math.min(100, Math.round((totalSpent / 5000000) * 100)),
    };
  }
  if (totalSpent >= 1000000) {
    return {
      name: "Tri Thức",
      icon: "💠",
      badgeClass: "bg-sky-50 border-sky-200 text-sky-800",
      hint: `Mua thêm ${(2500000 - totalSpent).toLocaleString("vi-VN")}đ để lên hạng Học Giả`,
      progressPercent: Math.min(100, Math.round((totalSpent / 2500000) * 100)),
    };
  }
  if (totalSpent >= 300000) {
    return {
      name: "Người Đọc",
      icon: "📖",
      badgeClass: "bg-amber-50 border-amber-200 text-amber-900",
      hint: `Mua thêm ${(1000000 - totalSpent).toLocaleString("vi-VN")}đ để đạt Tri Thức`,
      progressPercent: Math.min(100, Math.round((totalSpent / 1000000) * 100)),
    };
  }
  return {
    name: "Mầm Sách",
    icon: "🌱",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
    hint: `Mua thêm ${(300000 - totalSpent).toLocaleString("vi-VN")}đ để lên hạng Người Đọc`,
    progressPercent: Math.max(15, Math.min(100, Math.round((totalSpent / 300000) * 100))),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return null;
    }

    try {
      const res = await axios.get("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const freshUser = res.data?.user || res.data?.data || res.data;
      if (freshUser && freshUser.id) {
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } finally {
      setAuthLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
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
          }
        );
      }
    } catch {
      // Bỏ qua lỗi token hết hạn
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  const memberTier = useMemo(
    () => calculateMemberTier(user?.total_spent ?? 0),
    [user?.total_spent]
  );

  const value = useMemo(
    () => ({
      user,
      setUser,
      memberTier,
      authLoading,
      refreshUser,
      logout,
    }),
    [user, memberTier, authLoading, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return ctx;
}