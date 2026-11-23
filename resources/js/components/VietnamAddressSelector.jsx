import React, { useEffect, useMemo, useRef, useState } from "react";
import { VIETNAM_63_PROVINCES } from "../data/vietnamAddresses";

const CACHE_KEY = "vn_admin_63_provinces_full_v3";
const WARD_PREFIX_RE = /^(phường|p\.?|xã|x\.?|thị trấn|tt\.?)(?:\s+|(?=\d))/i;

const PROVINCE_ALIASES = {
  hcm: "hồ chí minh",
  "tp hcm": "hồ chí minh",
  tphcm: "hồ chí minh",
  "sài gòn": "hồ chí minh",
  sg: "hồ chí minh",
  hn: "hà nội",
  "tp hn": "hà nội",
  tphn: "hà nội",
  đn: "đà nẵng",
  "tp đn": "đà nẵng",
  hp: "hải phòng",
  "tp hp": "hải phòng",
  ct: "cần thơ",
  "tp ct": "cần thơ",
  "br vt": "bà rịa vũng tàu",
  brvt: "bà rịa vũng tàu",
  "tt huế": "thừa thiên huế",
  huế: "thừa thiên huế",
};

let memoryProvinces = null;
let inflightLoadPromise = null;

function padCode(value, length) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? digits.padStart(length, "0") : String(value ?? "");
}

function cleanProvinceLabel(rawName) {
  const name = String(rawName ?? "").normalize("NFC").trim();
  if (/hồ chí minh/i.test(name)) return "TP. Hồ Chí Minh";
  return name.replace(/^(Thành phố|Tỉnh)\s+/i, "").trim();
}

function normalizeRemoteDataset(rawList) {
  if (!Array.isArray(rawList) || rawList.length < 60) return null;

  return rawList
    .map((p) => {
      const pCode = padCode(p.Id ?? p.code ?? p.id, 2);
      const pName = cleanProvinceLabel(p.Name ?? p.name ?? p.full_name);

      const rawDistricts = p.Districts ?? p.districts ?? p.data2 ?? [];
      const districts = Array.isArray(rawDistricts)
        ? rawDistricts.map((d) => {
            const dCode = padCode(d.Id ?? d.code ?? d.id, 3);
            const dName = String(d.full_name ?? d.Name ?? d.name ?? "")
              .normalize("NFC")
              .trim();
            const rawWards = d.Wards ?? d.wards ?? d.data3 ?? [];
            const wards = Array.isArray(rawWards)
              ? rawWards
                  .map((w) =>
                    typeof w === "string"
                      ? w.normalize("NFC").trim()
                      : String(w.full_name ?? w.Name ?? w.name ?? "")
                          .normalize("NFC")
                          .trim()
                  )
                  .filter(Boolean)
              : [];

            return { code: dCode, name: dName, wards };
          })
        : [];

      return { code: pCode, name: pName, districts };
    })
    .filter((p) => p.code && p.name);
}

function getCachedProvinces() {
  if (memoryProvinces) return memoryProvinces;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 60) {
        memoryProvinces = parsed;
        return parsed;
      }
    }
  } catch {
    // Bỏ qua lỗi localStorage nếu trình duyệt hạn chế
  }
  return VIETNAM_63_PROVINCES;
}

async function loadFull63Provinces() {
  if (memoryProvinces) return memoryProvinces;
  if (inflightLoadPromise) return inflightLoadPromise;

  inflightLoadPromise = (async () => {
    const endpoints = [
      {
        url: "https://esgoo.net/api-tinhthanh/4/0.htm",
        extract: (json) => (json?.error === 0 ? json.data : null),
      },
      {
        url: "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json",
        extract: (json) => json,
      },
      {
        url: "https://provinces.open-api.vn/api/v1/?depth=3",
        extract: (json) => json,
      },
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url);
        if (!res.ok) continue;
        const json = await res.json();
        const extracted = ep.extract(json);
        const normalized = normalizeRemoteDataset(extracted);
        if (normalized) {
          memoryProvinces = normalized;
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
          } catch {
            // Bỏ qua nếu vượt quota storage
          }
          return normalized;
        }
      } catch {
        // Thử nguồn tiếp theo
      }
    }

    return VIETNAM_63_PROVINCES;
  })();

  return inflightLoadPromise;
}

function normalizeTonePlacement(str) {
  return str
    .replace(/oà/g, "òa")
    .replace(/oá/g, "óa")
    .replace(/oả/g, "ỏa")
    .replace(/oã/g, "õa")
    .replace(/oạ/g, "ọạ".slice(0, 1))
    .replace(/uỳ/g, "ùy")
    .replace(/uý/g, "úy")
    .replace(/uỷ/g, "ủy")
    .replace(/uỹ/g, "ũy")
    .replace(/uỵ/g, "ụy");
}

export function normalizeAdminText(text = "") {
  let cleaned = normalizeTonePlacement(
    String(text)
      .normalize("NFC")
      .toLowerCase()
      .replace(/[–—.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

  // Kiểm tra các từ viết tắt tỉnh/thành trước khi cắt tiền tố (vd: "tp hcm", "tp hn")
  if (PROVINCE_ALIASES[cleaned]) {
    return PROVINCE_ALIASES[cleaned];
  }

  // Cắt tiền tố hành chính đầy đủ hoặc viết tắt (kể cả viết liền như "q1", "p1", "tp hcm")
  cleaned = cleaned
    .replace(
      /^(thành phố|tỉnh|quận|huyện|thị xã|phường|xã|thị trấn)\s+/i,
      ""
    )
    .replace(/^(tp|tx|tt)\s+/i, "")
    .replace(/^(q|p|x)(?:\s+|(?=\d))/i, "")
    .replace(/\b0+(\d+)\b/g, "$1")
    .replace(/\bi\b$/i, "1")
    .replace(/\bii\b$/i, "2")
    .replace(/\biii\b$/i, "3")
    .replace(/\biv\b$/i, "4")
    .replace(/\s+/g, " ")
    .trim();

  return PROVINCE_ALIASES[cleaned] || cleaned;
}

export function parseAddressParts(rawAddress = "", sourceList = null) {
  const provinces =
    Array.isArray(sourceList) && sourceList.length > 0
      ? sourceList
      : getCachedProvinces();

  const raw = String(rawAddress || "").normalize("NFC").trim();
  if (!raw) {
    return { provinceCode: "", districtCode: "", wardName: "", street: "" };
  }

  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const lastPart = parts[parts.length - 1] || "";
  const matchedProvince = provinces.find(
    (p) => normalizeAdminText(p.name) === normalizeAdminText(lastPart)
  );

  if (!matchedProvince) {
    return { provinceCode: "", districtCode: "", wardName: "", street: raw };
  }

  if (parts.length === 1) {
    return {
      provinceCode: matchedProvince.code,
      districtCode: "",
      wardName: "",
      street: "",
    };
  }

  const distPart = parts[parts.length - 2] || "";
  const matchedDistrict = matchedProvince.districts.find(
    (d) => normalizeAdminText(d.name) === normalizeAdminText(distPart)
  );

  if (!matchedDistrict) {
    return {
      provinceCode: matchedProvince.code,
      districtCode: "",
      wardName: "",
      street: parts.slice(0, parts.length - 1).join(", "),
    };
  }

  if (parts.length === 2) {
    return {
      provinceCode: matchedProvince.code,
      districtCode: matchedDistrict.code,
      wardName: "",
      street: "",
    };
  }

  const wardPart = parts[parts.length - 3] || "";
  const matchedWard = matchedDistrict.wards.find(
    (w) => normalizeAdminText(w) === normalizeAdminText(wardPart)
  );

  if (matchedWard) {
    return {
      provinceCode: matchedProvince.code,
      districtCode: matchedDistrict.code,
      wardName: matchedWard,
      street: parts.slice(0, parts.length - 3).join(", "),
    };
  }

  if (WARD_PREFIX_RE.test(wardPart)) {
    return {
      provinceCode: matchedProvince.code,
      districtCode: matchedDistrict.code,
      wardName: wardPart,
      street: parts.slice(0, parts.length - 3).join(", "),
    };
  }

  return {
    provinceCode: matchedProvince.code,
    districtCode: matchedDistrict.code,
    wardName: "",
    street: parts.slice(0, parts.length - 2).join(", "),
  };
}

export function formatVietnamAddress(
  { provinceCode = "", districtCode = "", wardName = "", streetAddress = "" },
  sourceList = null
) {
  const provinces =
    Array.isArray(sourceList) && sourceList.length > 0
      ? sourceList
      : getCachedProvinces();

  const province = provinces.find((p) => p.code === provinceCode) || null;
  const district =
    province?.districts.find((d) => d.code === districtCode) || null;

  return [
    String(streetAddress || "").trim(),
    String(wardName || "").trim(),
    district?.name || "",
    province?.name || "",
  ]
    .filter(Boolean)
    .join(", ");
}

const SELECT_CLASS =
  "w-full bg-white border border-stone-200/80 focus:border-[#9A5B13] disabled:bg-stone-100 disabled:text-stone-400 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 focus:outline-none transition cursor-pointer";
const LABEL_CLASS =
  "block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5";

export default function VietnamAddressSelector({
  provinceCode = "",
  onProvinceChange,
  districtCode = "",
  onDistrictChange,
  wardName = "",
  onWardChange,
  streetAddress = "",
  onStreetChange,
  onDatasetLoaded,
  streetRequired = false,
  mapLabel = "Vị trí trên bản đồ:",
  mapHeightClass = "h-56 sm:h-64",
  header = null,
  footer = null,
}) {
  const [provinces, setProvinces] = useState(() => getCachedProvinces());
  const [customWardMode, setCustomWardMode] = useState(false);
  const onDatasetLoadedRef = useRef(onDatasetLoaded);
  onDatasetLoadedRef.current = onDatasetLoaded;

  useEffect(() => {
    let active = true;
    loadFull63Provinces().then((list) => {
      if (!active || !Array.isArray(list)) return;
      setProvinces(list);
      if (typeof onDatasetLoadedRef.current === "function") {
        onDatasetLoadedRef.current(list);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const currentProvince = useMemo(
    () => provinces.find((p) => p.code === provinceCode) || null,
    [provinces, provinceCode]
  );

  const availableDistricts = useMemo(
    () => currentProvince?.districts || [],
    [currentProvince]
  );

  const currentDistrict = useMemo(
    () => availableDistricts.find((d) => d.code === districtCode) || null,
    [availableDistricts, districtCode]
  );

  const availableWards = useMemo(() => {
    const list = currentDistrict?.wards || [];
    if (wardName && !list.includes(wardName)) {
      return [wardName, ...list];
    }
    return list;
  }, [currentDistrict, wardName]);

  const fullAddress = useMemo(
    () =>
      formatVietnamAddress(
        { provinceCode, districtCode, wardName, streetAddress },
        provinces
      ),
    [provinceCode, districtCode, wardName, streetAddress, provinces]
  );

  const [debouncedMapQuery, setDebouncedMapQuery] = useState(
    fullAddress || "TP. Hồ Chí Minh, Việt Nam"
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMapQuery(fullAddress || "TP. Hồ Chí Minh, Việt Nam");
    }, 450);
    return () => clearTimeout(timer);
  }, [fullAddress]);

  const mapZoom = streetAddress.trim()
    ? 16
    : wardName
    ? 14
    : currentDistrict
    ? 13
    : 12;

  const encodedMapQuery = encodeURIComponent(
    debouncedMapQuery.includes("Việt Nam")
      ? debouncedMapQuery
      : `${debouncedMapQuery}, Việt Nam`
  );
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedMapQuery}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;

  return (
    <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-stone-200/80 space-y-4">
      {header}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL_CLASS}>
            Tỉnh / Thành phố{" "}
            {streetRequired && <span className="text-[#9A5B13]">*</span>}
          </label>
          <select
            value={provinceCode}
            onChange={(e) => {
              const nextProvince = e.target.value;
              setCustomWardMode(false);
              onProvinceChange?.(nextProvince);
              onDistrictChange?.("");
              onWardChange?.("");
            }}
            className={SELECT_CLASS}
          >
            <option value="">-- Chọn Tỉnh / Thành --</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS}>Quận / Huyện / Thị xã</label>
          <select
            value={districtCode}
            disabled={!provinceCode}
            onChange={(e) => {
              const nextDistrict = e.target.value;
              setCustomWardMode(false);
              onDistrictChange?.(nextDistrict);
              onWardChange?.("");
            }}
            className={SELECT_CLASS}
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
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Phường / Xã / Thị trấn
            </label>
            {districtCode && (
              <button
                type="button"
                onClick={() => setCustomWardMode((v) => !v)}
                className="text-[10px] font-semibold text-[#9A5B13] hover:underline cursor-pointer"
              >
                {customWardMode ? "Chọn danh sách" : "Nhập tay"}
              </button>
            )}
          </div>

          {customWardMode ? (
            <input
              type="text"
              value={wardName}
              disabled={!districtCode}
              onChange={(e) => onWardChange?.(e.target.value)}
              placeholder="Ví dụ: Phường Bến Thành"
              className="w-full bg-white border border-stone-200/80 focus:border-[#9A5B13] rounded-xl py-2.5 px-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
            />
          ) : (
            <select
              value={wardName}
              disabled={!districtCode}
              onChange={(e) => onWardChange?.(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="">-- Chọn Phường / Xã --</option>
              {availableWards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>
          Số nhà, tên đường (Địa chỉ cụ thể){" "}
          {streetRequired && <span className="text-[#9A5B13]">*</span>}
        </label>
        <input
          type="text"
          required={streetRequired}
          value={streetAddress}
          onChange={(e) => onStreetChange?.(e.target.value)}
          placeholder="Ví dụ: 123 Nguyễn Văn Cừ"
          className="w-full bg-white border border-stone-200/80 focus:border-[#9A5B13] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition"
        />
      </div>

      <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#9A5B13] shrink-0" />
            <span className="text-[11px] text-stone-600 truncate">
              {mapLabel}{" "}
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
            Mở Google Maps
          </a>
        </div>

        <div className={`w-full ${mapHeightClass} bg-stone-200/60`}>
          <iframe
            title="Bản đồ địa chỉ nhận hàng"
            src={mapEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {footer}
    </div>
  );
}