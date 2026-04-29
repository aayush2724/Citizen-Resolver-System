import { X } from "lucide-react";

export default function NotificationBox({
  message,
  type = "success",
  onClose,
}) {
  const colors = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] max-w-sm rounded-lg border ${colors[type]} p-4 shadow-xl flex items-start gap-3 transition-all duration-300 transform scale-100 opacity-100`}
    >
      <div className="flex-1">
        <p className="text-sm font-bold">{message}</p>
      </div>
      <button
        onClick={onClose}
        type="button"
        className="shrink-0 text-current hover:opacity-70"
      >
        <X size={18} />
      </button>
    </div>
  );
}
