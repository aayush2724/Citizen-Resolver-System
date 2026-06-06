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
        <label className="block text-[11px] font-bold text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`w-full bg-[#E0EDF8] dark:bg-[#2a322e] border border-transparent rounded-2xl px-4 py-3 text-sm text-[#161d1a] dark:text-[#E0EDF8] placeholder:text-[#7E8AA9] focus:ring-2 focus:ring-[#1F345E] transition-all outline-none ${icon ? "pr-12" : ""}`}
          {...props}
        />
        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7E8AA9] pointer-events-none">
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