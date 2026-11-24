import React from "react";

const STEPS = [
  { number: 1, shortLabel: "Giỏ hàng", fullLabel: "1. Giỏ ấn phẩm", href: "/cart" },
  { number: 2, shortLabel: "Thanh toán", fullLabel: "2. Giao nhận & Thanh toán", href: "/checkout" },
  { number: 3, shortLabel: "Hoàn tất", fullLabel: "3. Hoàn tất đơn", href: null },
];

export default function CheckoutStepper({
  currentStep = 1,
  canProceedCheckout = false,
}) {
  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-1.5 grid grid-cols-3 items-center gap-1 sm:gap-2 shadow-2xs w-full lg:w-auto">
      {STEPS.map((step) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isClickable =
          (step.number === 1 && currentStep === 2) ||
          (step.number === 2 && currentStep === 1 && canProceedCheckout);

        const content = (
          <div
            className={`flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-1.5 sm:px-3.5 py-2 rounded-xl transition min-w-0 ${
              isActive
                ? "bg-[#141414] text-white shadow-2xs"
                : isCompleted
                ? "bg-[#F5F1EC] text-stone-800 hover:bg-[#ECE5DD]"
                : isClickable
                ? "text-stone-600 hover:bg-stone-100/80"
                : "text-stone-400"
            }`}
          >
            <span
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold shrink-0 ${
                isActive
                  ? "bg-[#9A5B13] text-white"
                  : isCompleted
                  ? "bg-[#E6D6C5] text-[#9A5B13]"
                  : "bg-stone-200/80 text-stone-500"
              }`}
            >
              {isCompleted ? (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                >
                  <path
                    d="M5 10.5l3.2 3.2L15 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                step.number
              )}
            </span>

            <span className="sm:hidden text-[10.5px] font-bold whitespace-nowrap">
              {step.shortLabel}
            </span>
            <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">
              {step.fullLabel}
            </span>
          </div>
        );

        return isClickable && step.href ? (
          <a key={step.number} href={step.href} className="min-w-0 block">
            {content}
          </a>
        ) : (
          <div key={step.number} className="min-w-0">
            {content}
          </div>
        );
      })}
    </div>
  );
}