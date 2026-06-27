import { forwardRef } from "react";

const Badge = forwardRef(function Badge({ 
  variant = "default",
  size = "sm",
  className = "",
  children,
  ...props 
}, ref) {
  const baseClasses = "inline-flex items-center font-bold rounded-full";
  
  const variants = {
    default: "bg-slate-50 text-slate-600 border border-slate-200",
    primary: "bg-[#342721]/10 text-[#342721] border border-[#342721]/20",
    success: "bg-emerald-50 text-emerald-600 border-emerald-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    danger: "bg-rose-50 text-rose-600 border-rose-200",
    priority: {
      Normal: "bg-slate-50 text-slate-500 border-slate-200",
      High: "bg-orange-50 text-orange-600 border-orange-200",
      Urgent: "bg-rose-50 text-rose-600 border-rose-200",
    },
    status: {
      Pending: "bg-amber-50 text-amber-600 border-amber-200",
      Assigned: "bg-blue-50 text-blue-600 border-blue-200",
      "In Progress": "bg-indigo-50 text-indigo-600 border-indigo-200",
      Resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
      Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
      Rejected: "bg-rose-50 text-rose-600 border-rose-200",
    },
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  const getVariantClasses = () => {
    if (typeof variant === "string") {
      return variants[variant] || variants.default;
    }
    return variant;
  };

  return (
    <span
      ref={ref}
      className={`${baseClasses} ${getVariantClasses()} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

export default Badge;