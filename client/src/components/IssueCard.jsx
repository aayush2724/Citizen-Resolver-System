import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { priorityTone, progressFor, statusTone } from "../utils/status";
import { fallbackImage, getRelevantImage } from "../utils/image";

export default function IssueCard({ issue, onOpen }) {
  const imageSrc = getRelevantImage(issue.title, issue.description, issue.department, `card:${issue.id}`);

  return (
    <article 
      className="group relative flex flex-col overflow-hidden rounded-[3.5rem] border border-black/5 bg-white shadow-premium transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl"
    >
      <div className="relative h-64 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="absolute left-6 top-6 flex flex-wrap gap-3">
          <span className={`rounded-full backdrop-blur-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border ${priorityTone(issue.priority)}`}>
            {issue.priority}
          </span>
          <span className={`rounded-full backdrop-blur-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border ${statusTone(issue.status)}`}>
            {issue.status}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-10">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-primary/10 border border-primary/20 px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary group-hover:bg-primary/20 transition-all duration-500">
            {issue.department}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{issue.id}</span>
            <span className="text-[9px] font-black text-slate-300 uppercase mt-1">{new Date(issue.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <h3 className="mt-6 text-2xl font-black leading-tight text-text-dark group-hover:text-primary transition-colors duration-500">
          {issue.title}
        </h3>
        <p className="mt-4 line-clamp-2 text-base leading-relaxed text-slate-500 font-medium">
          {issue.description}
        </p>

        <div className="mt-10">
          <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
            <span
              className="block h-full rounded-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${progressFor(issue.status)}%` }}
            />
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-6 text-xs font-bold">
            <div className="flex items-center gap-4 text-slate-400 group-hover:text-text-dark transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-slate-500">
                <MapPin size={18} />
              </div>
              <span className="truncate">{issue.area}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 group-hover:text-text-dark transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-slate-500">
                <UserRound size={18} />
              </div>
              <span className="truncate">{issue.assignedLabour}</span>
            </div>
          </div>
        </div>

        <button
          className="mt-10 flex w-full items-center justify-center gap-4 rounded-full border border-black/5 bg-black/5 px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-text-dark transition-all duration-500 hover:bg-primary hover:text-white hover:border-primary active:scale-[0.98] shadow-sm"
          type="button"
          onClick={() => onOpen(issue)}
        >
          View Analysis
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>
      </div>
    </article>
  );
}
