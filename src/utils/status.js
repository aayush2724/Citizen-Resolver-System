export const statusOrder = ["Pending", "Assigned", "In Progress", "Resolved"];

export function statusTone(status) {
  return {
    Pending: "bg-amber-100 text-amber-800 ring-amber-200",
    Assigned: "bg-sky-100 text-sky-800 ring-sky-200",
    "In Progress": "bg-indigo-100 text-indigo-800 ring-indigo-200",
    Resolved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  }[status];
}

export function priorityTone(priority) {
  return {
    Normal: "bg-slate-100 text-slate-700",
    High: "bg-rose-100 text-rose-800",
    Urgent: "bg-red-600 text-white",
  }[priority];
}

export function progressFor(status) {
  const index = statusOrder.indexOf(status);
  return index < 0 ? 0 : ((index + 1) / statusOrder.length) * 100;
}
