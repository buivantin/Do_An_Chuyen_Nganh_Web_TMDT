import React, { useEffect, useMemo, useRef, useState } from "react";
import VIETNAM_ADDRESSES from "../data/vietnamAddress.json";

function normalizeName(text = "") {
  return text
    .toLowerCase()
    .replace(/^(thành phố|tp\.?|tỉnh|quận|huyện|thị xã|tx\.?|phường|xã|thị trấn|tt\.?)\s+/i, "")
    .trim();
}

export default function AddressPickerMap({
  value = "",
  onChange,
  required = false,
  labelPrefix = "Địa chỉ nhận sách",
}) {
  const [provinceCode, setProvinceCode] = useState(VIETNAM_ADDRESSES[0]?.code || "");
  const [districtCode, setDistrictCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [street, setStreet] = useState("");

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const lastEmittedRef = useRef(null);

  // Đồng bộ ngược chuỗi địa chỉ từ CSDL (vd: "48 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội") vào dropdown
  useEffect(() => {
    const raw = (value || "").trim();
    if (raw === lastEmittedRef.current) return;
    lastEmittedRef.current = raw;

    if (!raw) {
      setProvinceCode(VIETNAM_ADDRESSES[0]?.code || "");
      setDistrictCode("");
      setWardName("");
      setStreet("");
      return;
    }

    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const lastPart = parts[parts.length - 1] || "";
    const matchedProvince = VIETNAM_ADDRESSES.find(
      (p) => normalizeName(p.name) === normalizeName(lastPart)
    );

    if (matchedProvince) {
      setProvinceCode(matchedProvince.code);

      const distPart = parts.length >= 3 ? parts[parts.length - 2] : "";
      const matchedDistrict = matchedProvince.districts.find(
        (d) => normalizeName(d.name) === normalizeName(distPart)
      );

      if (matchedDistrict) {
        setDistrictCode(matchedDistrict.code);

        const wardPart = parts.length >= 4 ? parts[parts.length - 3] : "";
        const matchedWard = matchedDistrict.wards.find(
          (w) => normalizeName(w) === normalizeName(wardPart)
        );

        if (matchedWard) {
          setWardName(matchedWard);
          setStreet(parts.slice(0, parts.length - 3).join(", "));
        } else {
          setWardName("");
          setStreet(parts.slice(0, parts.length - 2).join(", "));
        }
      } else {
        setDistrictCode("");
        setWardName("");
        setStreet(parts.slice(0, parts.length - 1).join(", "));
      }
    } else {
      setDistrictCode("");
      setWardName("");
      setStreet(raw);
    }
  }, [value]);

  const currentProvince = useMemo(
    () => VIETNAM_ADDRESSES.find((p) => p.code === provinceCode) || null,
    [provinceCode]
  );

  const availableDistricts = useMemo(
    () => currentProvince?.districts || [],
    [currentProvince]
  );

  const currentDistrict = useMemo(
    () => availableDistricts.find((d) => d.code === districtCode) || null,
    [availableDistricts, districtCode]
  );

  const availableWards = useMemo(
    () => currentDistrict?.wards || [],
    [currentDistrict]
  );

  const fullAddress = useMemo(() => {
    return [
      street.trim(),
      wardName,
      currentDistrict?.name || "",
      currentProvince?.name || "",
    ]
      .filter(Boolean)
      .join(", ");
  }, [street, wardName, currentDistrict, currentProvince]);

  // Phát chuỗi địa chỉ đầy đủ về form cha để lưu vào CSDL
  useEffect(() => {
    if (fullAddress === lastEmittedRef.current) return;
    lastEmittedRef.current = fullAddress;

    onChange?.(fullAddress, {
      street: street.trim(),
      ward: wardName,
      district: currentDistrict?.name || "",
      province: currentProvince?.name || "",
    });
  }, [fullAddress, street, wardName, currentDistrict, currentProvince, onChange]);

  // Trì hoãn cập nhật URL bản đồ khi người dùng đang gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(fullAddress || "TP. Hồ Chí Minh, Việt Nam");
    }, 450);
    return () => clearTimeout(timer);
  }, [fullAddress]);

  const mapZoom = street.trim() ? 16 : wardName ? 14 : currentDistrict ? 13 : 12;
  const encodedQuery = encodeURIComponent(
    debouncedQuery.includes("Việt Nam") ? debouncedQuery : `${debouncedQuery}, Việt Nam`
  );
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <div className="space-y-4">
      {/* 3 Dropdown từ mảng JSON */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Tỉnh / Thành phố {required && <span className="text-[#9A5B13]">*</span>}
          </label>
          <select
            value={provinceCode}
            required={required}
            onChange={(e) => {
              setProvinceCode(e.target.value);
              setDistrictCode("");
              setWardName("");
            }}
            className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 focus:outline-none transition cursor-pointer"
          >
            <option value="">-- Chọn Tỉnh / Thành --</option>
            {VIETNAM_ADDRESSES.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Quận / Huyện {required && <span className="text-[#9A5B13]">*</span>}
          </label>
          <select
            value={districtCode}
            required={required}
            disabled={!provinceCode}
            onChange={(e) => {
              setDistrictCode(e.target.value);
              setWardName("");
            }}
            className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white disabled:opacity-60 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 focus:outline-none transition cursor-pointer"
          >
            <option value="">-- Chọn Quận / Huyện --</option>
            {availableDistricts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Xã / Phường {required && <span className="text-[#9A5B13]">*</span>}
          </label>
          <select
            value={wardName}
            required={required}
            disabled={!districtCode}
            onChange={(e) => setWardName(e.target.value)}
            className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white disabled:opacity-60 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 focus:outline-none transition cursor-pointer"
          >
            <option value="">-- Chọn Xã / Phường --</option>
            {availableWards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ô nhập địa chỉ chi tiết */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
          {labelPrefix} chi tiết (Số nhà, tên đường, tòa nhà){" "}
          {required && <span className="text-[#9A5B13]">*</span>}
        </label>
        <input
          type="text"
          required={required}
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Ví dụ: Số 48 Phố Tràng Tiền, Tòa nhà BookHouse..."
          className="w-full bg-[#F5F2EE] border border-stone-200/80 focus:border-[#9A5B13] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
        />
      </div>

      {/* Bản đồ Google Maps hiển thị địa chỉ đã chọn/nhập */}
      <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#9A5B13] shrink-0" />
            <span className="text-[11px] text-stone-600 truncate">
              Vị trí trên bản đồ:{" "}
              <strong className="text-stone-900">
                {fullAddress || "Chưa chọn địa chỉ"}
              </strong>
            </span>
          </div>

          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-[#9A5B13] hover:underline shrink-0"
          >
            Mở Google Maps &nearr;
          </a>
        </div>

        <div className="w-full h-56 sm:h-64 bg-stone-200/60">
          <iframe
            title="Bản đồ Google Maps"
            src={mapEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}