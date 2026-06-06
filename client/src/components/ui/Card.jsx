import { forwardRef } from "react";

const Card = forwardRef(function Card({ 
  variant = "default",
  hover = false,
  className = "",
  children,
  ...props 
}, ref) {
  const baseClasses = "rounded-[2.5rem] p-8 shadow-premium border";
  
  const variants = {
    default: "bg-white/95 dark:bg-[#161d1a]/95 backdrop-blur-md border border-white/50 dark:border-white/10",
    elevated: "bg-white/90 backdrop-blur-md border border-white/60",
    glass: "bg-white/80 dark:bg-[#161d1a]/80 backdrop-blur-md border border-white/30",
    flat: "bg-[#E0EDF8] dark:bg-[#2a322e]/80",
  };

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${hover ? "transition-all hover:shadow-lg hover:-translate-y-1" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;