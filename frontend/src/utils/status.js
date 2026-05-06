export const statusOrder = ["Pending", "Assigned", "In Progress", "Resolved"];

export function statusTone(status) {
  return {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Assigned: "bg-blue-50 text-blue-700 border-blue-200",
    "In Progress": "bg-indigo-50 text-indigo-700 border-indigo-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

export function priorityTone(priority) {
  return {
    Normal: "bg-slate-50 text-slate-600 border-slate-200",
    High: "bg-orange-50 text-orange-700 border-orange-200",
    Urgent: "bg-rose-50 text-rose-700 border-rose-200",
  }[priority] || "bg-slate-50 text-slate-600 border-slate-200";
}

export function progressFor(status) {
  const index = statusOrder.indexOf(status);
  return index < 0 ? 0 : ((index + 1) / statusOrder.length) * 100;
}
