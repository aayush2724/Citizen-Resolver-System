export const statusOrder = ["Pending", "Assigned", "In Progress", "Resolved"];

export function statusTone(status) {
  return {
    Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "In Progress": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  }[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
}

export function priorityTone(priority) {
  return {
    Normal: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Urgent: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }[priority] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
}

export function progressFor(status) {
  const index = statusOrder.indexOf(status);
  return index < 0 ? 0 : ((index + 1) / statusOrder.length) * 100;
}
