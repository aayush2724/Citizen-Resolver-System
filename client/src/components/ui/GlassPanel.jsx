import { forwardRef } from "react";

const GlassPanel = forwardRef(function GlassPanel({ 
  className = "",
  children,
  ...props 
}, ref) {
  return (
    <div
      ref={ref}
      className={`bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/30 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default GlassPanel;