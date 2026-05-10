import { X, Calendar, MapPin, User, Shield, Info } from "lucide-react";
import { progressFor, statusOrder, statusTone } from "../utils/status";
import { fallbackImage, getRelevantImage } from "../utils/image";

export default function IssueModal({ issue, onClose }) {
  if (!issue) return null;

  const imageSrc = issue.imageUrl || getRelevantImage(issue.title, issue.description, issue.department);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-xl animate-fade-in" onClick={onClose} />
      
      <section className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[3rem] border border-white/20 bg-white shadow-premium animate-rise flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest px-10 py-8">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
              <Shield size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-outline mb-1.5">
                #CR-{issue.id.toString().padStart(4, '0')} • {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : "Recent"}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-primary leading-tight tracking-tighter">{issue.title}</h2>
            </div>
          </div>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant/30 bg-white text-outline hover:text-primary transition-all hover:rotate-90 shadow-sm"
            type="button"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-10 sm:p-12 space-y-12">
            {/* Image and Meta */}
            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <div className="relative group overflow-hidden rounded-[2.5rem] border border-outline-variant/20 shadow-premium">
                <img
                  className="h-full w-full object-cover aspect-[4/3] transition-transform duration-1000 group-hover:scale-110"
                  src={imageSrc}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-outline mb-6">
                    <Info size={16} className="text-secondary" /> Incident Intelligence
                  </h3>
                  <p className="text-lg leading-relaxed text-on-surface-variant font-bold tracking-tight">
                    {issue.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {[
                    { icon: MapPin, label: "Location", value: issue.area },
                    { icon: Shield, label: "Department", value: issue.department },
                    { icon: User, label: "Personnel", value: issue.assignedLabour },
                    { icon: Calendar, label: "Est. Resolve", value: `24 Hours` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div className="rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest p-5 transition-all hover:border-secondary/50 shadow-sm" key={label}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className="text-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-outline">{label}</span>
                      </div>
                      <p className="text-xs font-black text-primary truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="rounded-[2.5rem] border border-outline-variant/20 bg-surface-container-low/50 p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-outline">Resolution Lifecycle</h3>
                <span className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusTone(issue.status)}`}>
                  {issue.status}
                </span>
              </div>
              
              <div className="relative pt-8 px-6">
                <div className="absolute left-6 right-6 top-[54px] h-2 rounded-full bg-outline-variant/30" />
                <div 
                  className="absolute left-6 top-[54px] h-2 rounded-full bg-secondary shadow-lg transition-all duration-1000"
                  style={{ width: `calc(${progressFor(issue.status)}% - 48px)` }}
                />
                
                <div className="relative flex justify-between">
                  {statusOrder.map((status) => {
                    const active = statusOrder.indexOf(issue.status) >= statusOrder.indexOf(status);
                    const current = issue.status === status;
                    return (
                      <div className="flex flex-col items-center" key={status}>
                        <div className={`z-10 h-12 w-12 rounded-full border-4 border-white shadow-premium transition-all duration-700 ${
                          active ? "bg-secondary scale-110" : "bg-outline-variant/50"
                        } ${current ? "ring-4 ring-secondary/20" : ""}`} />
                        <span className={`mt-5 text-[10px] font-black uppercase tracking-widest ${
                          active ? "text-secondary" : "text-outline"
                        }`}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Admin Note */}
            {issue.note && (
              <div className="rounded-[2.5rem] border border-secondary/20 bg-secondary/5 p-10 border-l-[12px] border-l-secondary shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-secondary text-white shadow-lg">
                    <Info size={24} />
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.25em] text-secondary">Official Administration Update</span>
                </div>
                <p className="text-lg leading-relaxed text-primary font-black tracking-tight">{issue.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-outline-variant/20 bg-surface-container-lowest px-10 py-8 flex justify-end">
          <button
            className="rounded-full bg-primary text-white px-12 py-5 text-xs font-black uppercase tracking-widest hover:shadow-xl transition-all active:scale-95 shadow-lg"
            onClick={onClose}
          >
            Dismiss Analysis
          </button>
        </footer>
      </section>
    </div>
  );
}
