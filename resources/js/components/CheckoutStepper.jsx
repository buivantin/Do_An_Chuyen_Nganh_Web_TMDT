import React from "react";

const STEPS = [
  { number: 1, title: "1. Giỏ ấn", subtitle: "phẩm", href: "/cart" },
  { number: 2, title: "2. Giao nhận & Thanh", subtitle: "toán", href: "/checkout" },
  { number: 3, title: "3. Hoàn tất & Ký", subtitle: "gửi", href: null },
];

export default function CheckoutStepper({
  currentStep = 1,
  canProceedCheckout = false,
}) {
  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-2 flex items-center gap-2 sm:gap-3 overflow-x-auto shadow-2xs max-w-full">
      {STEPS.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isClickable =
          (step.number === 1 && currentStep === 2) ||
          (step.number === 2 && currentStep === 1 && canProceedCheckout);

        const content = (
          <div
            className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-left transition shrink-0 ${
              isActive
                ? "bg-[#141414] text-white shadow-xs"
                : isCompleted
                ? "bg-[#F5F1EC] text-stone-700 hover:bg-[#ECE5DD]"
                : isClickable
                ? "text-stone-500 hover:bg-stone-100/80"
                : "text-stone-400"
            }`}
          >
            {/* Vòng tròn số / dấu tích */}
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isActive
                  ? "bg-[#9A5B13] text-white"
                  : isCompleted
                  ? "bg-[#E6D6C5] text-[#9A5B13]"
                  : "bg-stone-200/70 text-stone-500"
              }`}
            >
              {isCompleted ? (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="w-3.5 h-3.5"
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

            {/* Nhãn 2 dòng đồng bộ mẫu */}
            <div className="text-xs font-semibold leading-snug">
              <div>{step.title}</div>
              <div>{step.subtitle}</div>
            </div>
          </div>
        );

        return (
          <React.Fragment key={step.number}>
            {isClickable && step.href ? (
              <a href={step.href} className="shrink-0">
                {content}
              </a>
            ) : (
              <div className="shrink-0">{content}</div>
            )}

            {index < STEPS.length - 1 && (
              <span
                className={`w-4 sm:w-6 h-[1.5px] shrink-0 ${
                  isCompleted ? "bg-[#C9A882]" : "bg-stone-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}