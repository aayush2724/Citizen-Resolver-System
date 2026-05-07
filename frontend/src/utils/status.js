export const statusOrder = ["Yet to Analyse", "Assigned", "In Progress", "Completed"];

export function statusTone(status) {
  return {
    "Yet to Analyse": "bg-amber-50 text-amber-600 border-amber-200",
    Assigned: "bg-blue-50 text-blue-600 border-blue-200",
    "In Progress": "bg-indigo-50 text-indigo-600 border-indigo-200",
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  }[status] || "bg-slate-50 text-slate-600 border-slate-200";
}

export function priorityTone(priority) {
  return {
    Normal: "bg-slate-50 text-slate-500 border-slate-200",
    High: "bg-orange-50 text-orange-600 border-orange-200",
    Urgent: "bg-rose-50 text-rose-600 border-rose-200 shadow-sm",
  }[priority] || "bg-slate-50 text-slate-500 border-slate-200";
}

export function progressFor(status) {
  const index = statusOrder.indexOf(status);
  return index < 0 ? 0 : ((index + 1) / statusOrder.length) * 100;
}
