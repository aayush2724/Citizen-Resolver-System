import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { priorityTone, progressFor, statusTone } from "../utils/status";
import { fallbackImage, getRelevantImage } from "../utils/image";

export default function IssueCard({ issue, onOpen }) {
  const imageSrc = issue.imageUrl || getRelevantImage(issue.title, issue.description, issue.department);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0f0f0f] shadow-premium transition-all duration-300 hover:-translate-y-1.5 hover:border-white/10 hover:shadow-2xl">
      <div className="relative h-48 overflow-hidden">
        <img
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          src={imageSrc}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-60" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${priorityTone(issue.priority)}`}>
            {issue.priority}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${statusTone(issue.status)}`}>
            {issue.status}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-400">
            {issue.department}
          </span>
          <span className="text-[10px] font-bold text-slate-500 tracking-widest">{issue.id}</span>
        </div>

        <h3 className="mt-4 text-lg font-bold leading-tight text-white transition-colors group-hover:text-teal-400">{issue.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-400">{issue.description}</p>

        {issue.note && (
          <div className="mt-4 rounded-xl bg-white/5 p-4 border border-white/5">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-1.5">Latest Update</span>
            <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{issue.note}</p>
          </div>
        )}

        <div className="mt-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all duration-700 ease-out"
              style={{ width: `${progressFor(issue.status)}%` }}
            />
          </div>
          <div className="mt-4 grid gap-2.5 text-xs text-slate-500">
            <span className="flex items-center gap-2.5">
              <MapPin size={14} className="text-teal-500/70" /> {issue.area}
            </span>
            <span className="flex items-center gap-2.5">
              <UserRound size={14} className="text-teal-500/70" /> {issue.assignedLabour}
            </span>
            <span className="flex items-center gap-2.5">
              <CalendarDays size={14} className="text-teal-500/70" /> Updated {issue.updatedAt}
            </span>
          </div>
        </div>

        <button
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
          type="button"
          onClick={() => onOpen(issue)}
        >
          View Full Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </div>
    </article>
  );
}
