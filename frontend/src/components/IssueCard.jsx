import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { priorityTone, progressFor, statusTone } from "../utils/status";
import { fallbackImage, getRelevantImage } from "../utils/image";

export default function IssueCard({ issue, onOpen }) {
  const imageSrc = issue.imageUrl || getRelevantImage(issue.title, issue.description, issue.department);

  return (
    <article 
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#0f0f0f]/40 glass-card shadow-premium transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)]"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          src={imageSrc}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-80" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className={`rounded-xl backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${priorityTone(issue.priority)}`}>
            {issue.priority}
          </span>
          <span className={`rounded-xl backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${statusTone(issue.status)}`}>
            {issue.status}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">
            {issue.department}
          </span>
          <span className="text-[10px] font-bold text-slate-600 tracking-widest">{issue.id}</span>
        </div>

        <h3 className="mt-5 text-xl font-black leading-tight text-white transition-colors group-hover:text-teal-400">
          {issue.title}
        </h3>
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
          {issue.description}
        </p>

        {issue.note && (
          <div className="mt-5 rounded-2xl bg-white/[0.03] p-5 border border-white/5 transition-colors group-hover:bg-white/[0.05]">
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-teal-500 mb-2">Latest Update</span>
            <p className="text-sm text-slate-300 italic leading-relaxed">
              "{issue.note}"
            </p>
          </div>
        )}

        <div className="mt-8">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(45,212,191,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${progressFor(issue.status)}%` }}
            />
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] font-bold">
            <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-400 transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-teal-500">
                <MapPin size={14} />
              </div>
              <span className="truncate">{issue.area}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-400 transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-teal-500">
                <UserRound size={14} />
              </div>
              <span className="truncate">{issue.assignedLabour}</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-slate-600">
             <CalendarDays size={14} />
             <span>UPDATED {issue.updatedAt?.toUpperCase()}</span>
          </div>
        </div>

        <button
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-6 py-4 text-xs font-black uppercase tracking-widest text-white transition-all duration-300 hover:bg-teal-500 hover:text-black hover:border-teal-500 active:scale-[0.98] shadow-lg hover:shadow-teal-500/20"
          type="button"
          onClick={() => onOpen(issue)}
        >
          View Full Details
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </div>
    </article>
  );
}
