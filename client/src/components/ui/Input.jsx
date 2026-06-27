import { forwardRef } from "react";

const Input = forwardRef(function Input({ 
  label,
  error,
  icon,
  className = "",
  ...props 
}, ref) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-[11px] font-bold text-[#342721] dark:text-[#8B7355] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`w-full bg-[#DDC5A3] dark:bg-[#4a3830] border border-transparent rounded-2xl px-4 py-3 text-sm text-[#342721] dark:text-[#DDC5A3] placeholder:text-[#8B7355] focus:ring-2 focus:ring-[#342721] transition-all outline-none ${icon ? "pr-12" : ""}`}
          {...props}
        />
        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B7355] pointer-events-none">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-rose-600 mt-1">{error}</p>
      )}
    </div>
  );
});

export default Input;