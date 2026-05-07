import { X, Calendar, MapPin, User, Shield, Info } from "lucide-react";
import { progressFor, statusOrder, statusTone } from "../utils/status";
import { fallbackImage, getRelevantImage } from "../utils/image";

export default function IssueModal({ issue, onClose }) {
  if (!issue) return null;

  const imageSrc = issue.imageUrl || getRelevantImage(issue.title, issue.description, issue.department);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <section className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-black/5 bg-white shadow-2xl animate-rise flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-black/5 bg-slate-50 p-6 sm:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
              <Shield size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                {issue.id} • Raised on {new Date(issue.created_at).toLocaleDateString()}
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-text-dark leading-tight tracking-tight">{issue.title}</h2>
            </div>
          </div>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-white text-slate-400 hover:text-text-dark transition-all hover:rotate-90"
            type="button"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 sm:p-10 space-y-10">
            {/* Image and Meta */}
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="relative group overflow-hidden rounded-[2rem] border border-black/5 shadow-xl">
                <img
                  className="h-full w-full object-cover aspect-video transition-transform duration-700 group-hover:scale-105"
                  src={imageSrc}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                    <Info size={14} className="text-primary" /> Incident Intelligence
                  </h3>
                  <p className="text-base leading-relaxed text-slate-600 font-bold">
                    {issue.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: MapPin, label: "Precise Area", value: issue.area },
                    { icon: Shield, label: "Primary Unit", value: issue.department },
                    { icon: User, label: "Workforce", value: issue.assignedLabour },
                    { icon: Calendar, label: "Resolution SLA", value: `${issue.slaHours} Hours` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div className="rounded-2xl border border-black/5 bg-slate-50 p-5 transition-all hover:bg-slate-100" key={label}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={12} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                      </div>
                      <p className="text-xs font-black text-text-dark truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="rounded-[2rem] border border-black/5 bg-slate-50/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resolution Lifecycle</h3>
                <span className={`inline-flex items-center justify-center rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all ${statusTone(issue.status)}`}>
                  {issue.status}
                </span>
              </div>
              
              <div className="relative pt-6 px-4">
                <div className="absolute left-4 right-4 top-[43px] h-1.5 rounded-full bg-black/5" />
                <div 
                  className="absolute left-4 top-[43px] h-1.5 rounded-full bg-primary shadow-sm transition-all duration-1000"
                  style={{ width: `calc(${progressFor(issue.status)}% - 32px)` }}
                />
                
                <div className="relative flex justify-between">
                  {statusOrder.map((status) => {
                    const active = statusOrder.indexOf(issue.status) >= statusOrder.indexOf(status);
                    return (
                      <div className="flex flex-col items-center" key={status}>
                        <div className={`z-10 h-10 w-10 rounded-full border-4 border-white shadow-sm transition-all duration-500 ${
                          active ? "bg-primary" : "bg-slate-200"
                        }`} />
                        <span className={`mt-4 text-[10px] font-black uppercase tracking-widest ${
                          active ? "text-primary" : "text-slate-400"
                        }`}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Admin Note */}
            {issue.note && (
              <div className="rounded-[2rem] border border-primary/10 bg-primary/5 p-8 border-l-8 border-l-primary shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Info size={20} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Official Administration Update</span>
                </div>
                <p className="text-base leading-relaxed text-slate-700 font-bold">{issue.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-black/5 bg-slate-50 p-8 text-center sm:text-right">
          <button
            className="rounded-full bg-text-dark text-white px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl"
            onClick={onClose}
          >
            Dismiss Analysis
          </button>
        </footer>
      </section>
    </div>
  );
}
