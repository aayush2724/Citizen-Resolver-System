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
    primary: "bg-[#1F345E] text-white hover:bg-[#005040] focus:ring-[#1F345E] shadow-lg",
    secondary: "bg-[#E0EDF8] text-[#1F345E] hover:bg-[#213D76] hover:text-white focus:ring-[#1F345E]",
    ghost: "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
    outline: "border border-[#1F345E] text-[#1F345E] hover:bg-[#E0EDF8]",
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