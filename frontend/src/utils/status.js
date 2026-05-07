export const statusOrder = ["Pending", "Assigned", "In Progress", "Resolved"];

export function statusTone(status) {
  return {
    Pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Assigned: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "In Progress": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  }[status] || "bg-slate-500/20 text-slate-300 border-slate-500/30";
}

export function priorityTone(priority) {
  return {
    Normal: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    High: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Urgent: "bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
  }[priority] || "bg-slate-500/20 text-slate-300 border-slate-500/30";
}

export function progressFor(status) {
  const index = statusOrder.indexOf(status);
  return index < 0 ? 0 : ((index + 1) / statusOrder.length) * 100;
}
