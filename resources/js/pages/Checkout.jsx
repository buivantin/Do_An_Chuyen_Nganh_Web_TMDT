import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import CheckoutView from "../components/CheckoutView";
import LoginRequiredModal from "../components/LoginRequiredModal";
import ProductService from "../services/ProductService";
import { formatVietnamAddress } from "../components/VietnamAddressSelector";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function resolveProductImage(item) {
  const raw =
    item?.image ||
    item?.image_path ||
    item?.thumbnail ||
    item?.product?.image ||
    "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "https://via.placeholder.com/120x160?text=Book";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/+/, "");
  if (clean.startsWith("public/")) return `/storage/${clean.slice(7)}`;
  if (clean.startsWith("storage/") || clean.startsWith("imgs/")) {
    return `/${clean}`;
  }
  return `/storage/${clean}`;
}

function normalizeUserVoucher(raw) {
  const v = raw?.voucher || raw || {};
  const discountTypeRaw = String(
    v.discount_type || v.type || "fixed"
  ).toLowerCase();
  const isPercent =
    discountTypeRaw === "percent" || discountTypeRaw === "percentage";

  const discountValue = Number(
    v.discount_value ?? v.value ?? v.amount ?? v.discount ?? 0
  );
  const maxDiscount = Number(
    v.max_discount ?? v.max_discount_amount ?? v.max_value ?? 0
  );
  const minOrderValue = Number(
    v.min_order_value ?? v.min_order_amount ?? v.min_order ?? 0
  );

  const rawDate = v.expires_at || v.end_date || v.expired_at || null;
  let expiresLabel = "";
  if (rawDate) {
    const d = new Date(rawDate);
    if (!Number.isNaN(d.getTime())) {
      expiresLabel = d.toLocaleDateString("vi-VN");
    }
  }

  const discountLabel = isPercent
    ? `Giảm ${discountValue}%${
        maxDiscount > 0 ? ` (tối đa ${maxDiscount.toLocaleString("vi-VN")}đ)` : ""
      }`
    : `Giảm ${discountValue.toLocaleString("vi-VN")}đ`;

  return {
    id: v.id || raw?.id || v.code,
    code: String(v.code || "VOUCHER").toUpperCase(),
    title: v.name || v.title || v.description || "Ưu đãi độc giả BookHouse",
    isPercent,
    discountValue,
    maxDiscount,
    minOrderValue,
    expiresLabel,
    discountLabel,
    isUsed: Boolean(raw?.is_used || raw?.used_at || v.is_used),
    isExpired: rawDate ? new Date(rawDate).getTime() < Date.now() : false,
  };
}

/**
 * SMART COMPONENT: Xử lý Checkout, tải & kiểm tra điều kiện Voucher Admin cấp cho User
 */
export default function Checkout() {
  const storedUser = useMemo(() => getStoredUser(), []);
  const initialName = storedUser?.username || storedUser?.name || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Địa chỉ
  const [addressMode, setAddressMode] = useState("saved");
  const [savedProfile, setSavedProfile] = useState({
    name: initialName,
    phone: storedUser?.phone || "",
    email: storedUser?.email || "",
    address: storedUser?.address || "",
  });
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(storedUser?.phone || "");
  const [email, setEmail] = useState(storedUser?.email || "");
  const [provinceCode, setProvinceCode] = useState("79");
  const [districtCode, setDistrictCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [note, setNote] = useState("");

  // Vận chuyển & Thanh toán
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Voucher của User được Admin cấp
  const [rawVouchers, setRawVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  // Gắn class lên body để đẩy bong bóng liên hệ lên trên thanh đặt hàng đáy Mobile
  useEffect(() => {
    document.body.classList.add("bh-checkout-mobile-bar");
    return () => {
      document.body.classList.remove("bh-checkout-mobile-bar");
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setShowLoginModal(true);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    const fetchInitialData = async () => {
      setLoading(true);
      setVouchersLoading(true);
      try {
        const [cartItems, profileRes, voucherRes] = await Promise.all([
          ProductService.getCart(),
          axios.get("/api/profile", { headers }).catch(() => null),
          axios
            .get("/api/user/vouchers", { headers })
            .catch(() =>
              axios.get("/api/vouchers", { headers }).catch(() => null)
            ),
        ]);

        setItems(
          (Array.isArray(cartItems) ? cartItems : []).map((row) => ({
            ...row,
            resolvedImage: resolveProductImage(row),
          }))
        );

        const p =
          profileRes?.data?.user ||
          profileRes?.data?.data ||
          profileRes?.data;

        if (p && typeof p === "object") {
          const nextProfile = {
            name: p.username || p.name || initialName,
            phone: p.phone || storedUser?.phone || "",
            email: p.email || storedUser?.email || "",
            address: p.address || storedUser?.address || "",
          };
          setSavedProfile(nextProfile);
          if (nextProfile.name) setFullName(nextProfile.name);
          if (nextProfile.phone) setPhone(nextProfile.phone);
          if (nextProfile.email) setEmail(nextProfile.email);
        }

        const vList =
          voucherRes?.data?.data ??
          voucherRes?.data?.vouchers ??
          voucherRes?.data ??
          [];
        setRawVouchers(Array.isArray(vList) ? vList : []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setShowLoginModal(true);
        } else {
          setErrorMsg(
            err.response?.data?.message || "Không thể tải thông tin giỏ hàng."
          );
        }
      } finally {
        setLoading(false);
        setVouchersLoading(false);
      }
    };

    fetchInitialData();
  }, [storedUser, initialName]);

  const totalBooks = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [items]
  );

  // Đánh giá điều kiện áp dụng từng voucher theo giá trị đơn hàng (subtotal)
  const evaluatedVouchers = useMemo(() => {
    return rawVouchers
      .map(normalizeUserVoucher)
      .filter((v) => !v.isUsed && !v.isExpired)
      .map((v) => {
        const isEligible = subtotal >= v.minOrderValue;
        const missingAmount = Math.max(0, v.minOrderValue - subtotal);
        let discountAmount = 0;

        if (isEligible) {
          if (v.isPercent) {
            const rawDisc = Math.round((subtotal * v.discountValue) / 100);
            discountAmount =
              v.maxDiscount > 0 ? Math.min(rawDisc, v.maxDiscount) : rawDisc;
          } else {
            discountAmount = Math.min(v.discountValue, subtotal);
          }
        }

        return {
          ...v,
          isEligible,
          missingAmount,
          discountAmount,
        };
      })
      .sort((a, b) => {
        if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
        if (a.isEligible) return b.discountAmount - a.discountAmount;
        return a.missingAmount - b.missingAmount;
      });
  }, [rawVouchers, subtotal]);

  const eligibleVoucherCount = useMemo(
    () => evaluatedVouchers.filter((v) => v.isEligible).length,
    [evaluatedVouchers]
  );

  const selectedVoucher = useMemo(() => {
    if (!selectedVoucherId) return null;
    const found = evaluatedVouchers.find(
      (v) => String(v.id) === String(selectedVoucherId)
    );
    return found && found.isEligible ? found : null;
  }, [evaluatedVouchers, selectedVoucherId]);

  const voucherDiscount = selectedVoucher ? selectedVoucher.discountAmount : 0;
  const shippingFee = shippingMethod === "express" ? 35000 : 0;
  const grandTotal = Math.max(0, subtotal - voucherDiscount) + shippingFee;

  const handleSelectAddressMode = (mode) => {
    setAddressMode(mode);
    setErrorMsg("");
    if (mode === "saved") {
      setFullName(savedProfile.name || "");
      setPhone(savedProfile.phone || "");
      setEmail(savedProfile.email || "");
    } else {
      setFullName("");
      setPhone("");
      setProvinceCode("79");
      setDistrictCode("");
      setWardName("");
      setStreetAddress("");
    }
  };

  const newAddressString = useMemo(
    () =>
      formatVietnamAddress({
        provinceCode,
        districtCode,
        wardName,
        streetAddress,
      }),
    [provinceCode, districtCode, wardName, streetAddress]
  );

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Giỏ hàng đang trống, vui lòng chọn sách trước khi đặt hàng.");
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ Họ tên và Số điện thoại người nhận.");
      return;
    }

    const finalShippingAddress =
      addressMode === "saved"
        ? (savedProfile.address || "").trim()
        : newAddressString;

    if (addressMode === "saved" && !finalShippingAddress) {
      setErrorMsg(
        "Tài khoản chưa có địa chỉ lưu sẵn trên hệ thống. Vui lòng chọn 'Giao tới địa chỉ mới'."
      );
      return;
    }

    if (addressMode === "new" && (!provinceCode || !streetAddress.trim())) {
      setErrorMsg(
        "Vui lòng chọn Tỉnh/Thành phố và nhập Địa chỉ cụ thể (số nhà, tên đường)."
      );
      return;
    }

    const payload = {
      shipping_name: fullName.trim(),
      receiver_name: fullName.trim(),
      customer_name: fullName.trim(),
      name: fullName.trim(),
      shipping_phone: phone.trim(),
      receiver_phone: phone.trim(),
      phone: phone.trim(),
      email: email.trim(),
      shipping_email: email.trim(),
      shipping_address: finalShippingAddress,
      receiver_address: finalShippingAddress,
      address: finalShippingAddress,
      payment_method: paymentMethod,
      shipping_method: shippingMethod,
      shipping_fee: shippingFee,
      voucher_id: selectedVoucher ? selectedVoucher.id : null,
      voucher_code: selectedVoucher ? selectedVoucher.code : null,
      discount_amount: voucherDiscount,
      total_amount: grandTotal,
      note: note.trim(),
      notes: note.trim(),
    };

    setSubmitting(true);
    try {
      const response =
        typeof ProductService.createOrder === "function"
          ? await ProductService.createOrder(payload)
          : (
              await axios.post("/api/orders", payload, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              })
            ).data;

      // Chỉ cập nhật địa chỉ mặc định nếu người dùng chủ động tick chọn, giữ nguyên tên tài khoản gốc
      if (addressMode === "new" && saveAsDefault && finalShippingAddress) {
        const currentStored = getStoredUser() || {};
        const keptName =
          savedProfile.name || currentStored.username || currentStored.name || "";
        const keptPhone =
          savedProfile.phone || currentStored.phone || phone.trim();

        axios
          .put(
            "/api/profile",
            {
              username: keptName,
              name: keptName,
              phone: keptPhone,
              address: finalShippingAddress,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          )
          .then(() => {
            const nextUser = {
              ...currentStored,
              username: keptName,
              name: keptName,
              phone: keptPhone,
              address: finalShippingAddress,
            };
            localStorage.setItem("user", JSON.stringify(nextUser));
            setSavedProfile((prev) => ({
              ...prev,
              phone: keptPhone,
              address: finalShippingAddress,
            }));
            window.dispatchEvent(
              new CustomEvent("user-updated", { detail: nextUser })
            );
          })
          .catch(() => null);
      }

      const createdOrder = response?.data || response?.order || response || {};
      setOrderSuccess({
        code:
          createdOrder.order_code ||
          createdOrder.code ||
          (createdOrder.id ? `#MS${createdOrder.id}` : "#MS2026"),
        receiver: fullName.trim(),
        phone: phone.trim(),
        address: finalShippingAddress,
        total: grandTotal,
        discount: voucherDiscount,
        voucherCode: selectedVoucher?.code || "",
        paymentMethod,
      });

      window.dispatchEvent(new CustomEvent("cart-updated"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLoginModal(true);
      } else {
        const validationErrors = err.response?.data?.errors;
        const firstValidationMsg = validationErrors
          ? Object.values(validationErrors).flat()[0]
          : null;
        setErrorMsg(
          firstValidationMsg ||
            err.response?.data?.message ||
            "Đặt hàng không thành công. Vui lòng kiểm tra lại thông tin."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <CheckoutView
        items={items}
        totalBooks={totalBooks}
        subtotal={subtotal}
        shippingFee={shippingFee}
        voucherDiscount={voucherDiscount}
        grandTotal={grandTotal}
        loading={loading}
        submitting={submitting}
        errorMsg={errorMsg}
        orderSuccess={orderSuccess}
        currentStep={orderSuccess ? 3 : 2}
        addressMode={addressMode}
        savedProfile={savedProfile}
        fullName={fullName}
        phone={phone}
        email={email}
        provinceCode={provinceCode}
        districtCode={districtCode}
        wardName={wardName}
        streetAddress={streetAddress}
        saveAsDefault={saveAsDefault}
        note={note}
        shippingMethod={shippingMethod}
        paymentMethod={paymentMethod}
        vouchers={evaluatedVouchers}
        vouchersLoading={vouchersLoading}
        selectedVoucher={selectedVoucher}
        voucherModalOpen={voucherModalOpen}
        eligibleVoucherCount={eligibleVoucherCount}
        onSelectAddressMode={handleSelectAddressMode}
        onFullNameChange={setFullName}
        onPhoneChange={setPhone}
        onEmailChange={setEmail}
        onProvinceChange={setProvinceCode}
        onDistrictChange={setDistrictCode}
        onWardChange={setWardName}
        onStreetChange={setStreetAddress}
        onSaveAsDefaultChange={setSaveAsDefault}
        onNoteChange={setNote}
        onShippingMethodChange={setShippingMethod}
        onPaymentMethodChange={setPaymentMethod}
        onOpenVoucherModal={() => setVoucherModalOpen(true)}
        onCloseVoucherModal={() => setVoucherModalOpen(false)}
        onApplyVoucher={(voucher) => {
          if (!voucher?.isEligible) return;
          setSelectedVoucherId(voucher.id);
          setVoucherModalOpen(false);
        }}
        onRemoveVoucher={() => setSelectedVoucherId(null)}
        onSubmitOrder={handleSubmitOrder}
      />
    </MainLayout>
  );
}