import React, { useEffect, useMemo, useRef, useState, memo } from "react";

const viCollator = new Intl.Collator("vi", {
  numeric: true,
  sensitivity: "base",
});

function normalizeSearch(str) {
  return String(str ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "-- Chọn mục --",
  searchPlaceholder = "Gõ để tìm kiếm...",
  emptyText = "Không tìm thấy kết quả phù hợp",
  allowEmpty = false,
  emptyLabel = "-- Không chọn --",
  sortOrder = "az", // "az" | "09" | "none"
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const sortedOptions = useMemo(() => {
    const list = Array.isArray(options) ? [...options] : [];
    if (sortOrder === "none") return list;

    return list.sort((a, b) => {
      if (sortOrder === "09") {
        const numA = Number(a.sortKey ?? a.value ?? 0);
        const numB = Number(b.sortKey ?? b.value ?? 0);
        if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) {
          return numA - numB;
        }
      }
      return viCollator.compare(
        String(a.sortKey ?? a.label ?? ""),
        String(b.sortKey ?? b.label ?? "")
      );
    });
  }, [options, sortOrder]);

  const filteredOptions = useMemo(() => {
    const kw = normalizeSearch(query);
    if (!kw) return sortedOptions;

    return sortedOptions.filter((opt) => {
      const haystack = normalizeSearch(
        `${opt.label ?? ""} ${opt.subLabel ?? ""} ${opt.keywords ?? ""}`
      );
      return haystack.includes(kw);
    });
  }, [sortedOptions, query]);

  const selectedOption = useMemo(
    () =>
      sortedOptions.find((opt) => String(opt.value) === String(value)) || null,
    [sortedOptions, value]
  );

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const handleSelect = (nextVal) => {
    onChange?.(nextVal);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9A5B13] flex items-center justify-between gap-2 text-left transition cursor-pointer disabled:opacity-50"
      >
        <span
          className={`truncate ${
            selectedOption ? "text-stone-900 font-medium" : "text-stone-400"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-40 mt-1.5 w-full bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-stone-100 bg-[#FAF8F5]">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9A5B13]"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto divide-y divide-stone-50 text-xs sm:text-sm">
            {allowEmpty && (
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect("")}
                  className={`w-full px-3.5 py-2 text-left transition cursor-pointer ${
                    String(value) === ""
                      ? "bg-[#F5EDE2] text-[#9A5B13] font-bold"
                      : "text-stone-500 hover:bg-stone-50"
                  }`}
                >
                  {emptyLabel}
                </button>
              </li>
            )}

            {filteredOptions.length === 0 ? (
              <li className="px-3.5 py-4 text-center text-xs text-stone-400">
                {emptyText}
              </li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <li key={String(opt.value)}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        isSelected
                          ? "bg-[#F5EDE2] text-[#9A5B13] font-bold"
                          : "text-stone-800 hover:bg-stone-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate">{opt.label}</div>
                        {opt.subLabel && (
                          <div className="text-[11px] text-stone-400 truncate">
                            {opt.subLabel}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-[#9A5B13] font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default memo(SearchableSelect);