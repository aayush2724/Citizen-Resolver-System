import { forwardRef } from "react";

const Button = forwardRef(function Button({ 
  variant = "primary", 
  size = "md", 
  disabled = false,
  loading = false,
  children,
  className = "",
  ...props 
}, ref) {
  const baseClasses = "font-bold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#342721] text-white hover:bg-[#DDC5A3] focus:ring-[#342721] shadow-lg",
    secondary: "bg-[#DDC5A3] text-[#342721] hover:bg-[#342721] hover:text-white focus:ring-[#342721]",
    ghost: "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
    outline: "border border-[#342721] text-[#342721] hover:bg-[#DDC5A3]",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
});

export default Button;