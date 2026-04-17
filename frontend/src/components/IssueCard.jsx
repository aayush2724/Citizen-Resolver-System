import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { priorityTone, progressFor, statusTone } from "../utils/status";

export default function IssueCard({ issue, onOpen }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={issue.imageUrl}
          alt=""
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-black ${priorityTone(issue.priority)}`}>
            {issue.priority}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(issue.status)}`}>
            {issue.status}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">
            {issue.department}
          </span>
          <span className="text-xs font-bold text-slate-500">{issue.id}</span>
        </div>

        <h3 className="mt-4 text-xl font-black leading-tight text-slate-950">{issue.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{issue.description}</p>

        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <span
              className="block h-full rounded-full bg-teal-600 transition-all duration-500"
              style={{ width: `${progressFor(issue.status)}%` }}
            />
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <MapPin size={16} /> {issue.area}
            </span>
            <span className="flex items-center gap-2">
              <UserRound size={16} /> {issue.assignedLabour}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays size={16} /> Updated {issue.updatedAt}
            </span>
          </div>
        </div>

        <button
          className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-800 transition hover:border-teal-600 hover:text-teal-700"
          type="button"
          onClick={() => onOpen(issue)}
        >
          View details
        </button>
      </div>
    </article>
  );
}
