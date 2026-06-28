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
    default: "bg-white/95 backdrop-blur-md border border-white/50",
    elevated: "bg-white/90 backdrop-blur-md border border-white/60",
    glass: "bg-white/80 backdrop-blur-md border border-white/30",
    flat: "bg-[#DDC5A3]",
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