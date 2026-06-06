export const STATUS_ORDER = ["Pending", "Assigned", "In Progress", "Resolved", "Completed", "Rejected"];

export const statusOrder = STATUS_ORDER; // Legacy export for compatibility

export function statusTone(status) {
  return {
    Pending: "bg-amber-50 text-amber-600 border-amber-200",
    Assigned: "bg-blue-50 text-blue-600 border-blue-200",
    "In Progress": "bg-indigo-50 text-indigo-600 border-indigo-200",
    Resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-600 border-rose-200",
  }[status] || "bg-slate-50 text-slate-600 border-slate-200";
}

export function priorityTone(priority) {
  return {
    Normal: "bg-slate-50 text-slate-500 border-slate-200",
    High: "bg-orange-50 text-orange-600 border-orange-200",
    Urgent: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm",
  }[priority] || "bg-slate-50 text-slate-500 border-slate-200";
}

export function priorityColor(priority) {
  return {
    Normal: "text-slate-500",
    High: "text-orange-600",
    Urgent: "text-rose-600",
  }[priority] || "text-slate-500";
}

export function progressFor(status) {
  const order = STATUS_ORDER.filter(s => s !== "Rejected");
  const index = order.indexOf(status);
  return index < 0 ? 0 : ((index + 1) / order.length) * 100;
}
