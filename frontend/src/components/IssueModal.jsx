import { X, Calendar, MapPin, User, Shield, Info } from "lucide-react";
import { progressFor, statusOrder, statusTone } from "../utils/status";
import { fallbackImage, getRelevantImage } from "../utils/image";

export default function IssueModal({ issue, onClose }) {
  if (!issue) return null;

  const imageSrc = issue.imageUrl || getRelevantImage(issue.title, issue.description, issue.department);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <section className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl animate-rise flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-6 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{issue.id}</p>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">{issue.title}</h2>
            </div>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
            type="button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Image and Meta */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="relative group overflow-hidden rounded-2xl border border-white/5 shadow-lg">
                <img
                  className="h-full w-full object-cover aspect-video transition-transform duration-700 group-hover:scale-105"
                  src={imageSrc}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                    <Info size={14} className="text-teal-500" /> Description
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-300 font-medium">
                    {issue.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: MapPin, label: "Location", value: issue.area },
                    { icon: Shield, label: "Department", value: issue.department },
                    { icon: User, label: "Assigned To", value: issue.assignedLabour },
                    { icon: Calendar, label: "SLA Deadline", value: `${issue.slaHours} Hours` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10" key={label}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={12} className="text-teal-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Resolution Status</h3>
                <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-bold border transition-all ${statusTone(issue.status)}`}>
                  {issue.status}
                </span>
              </div>
              
              <div className="relative pt-2">
                <div className="absolute left-0 top-[19px] h-1 w-full rounded-full bg-white/5" />
                <div 
                  className="absolute left-0 top-[19px] h-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${progressFor(issue.status)}%` }}
                />
                
                <div className="relative flex justify-between">
                  {statusOrder.map((status) => {
                    const active = statusOrder.indexOf(issue.status) >= statusOrder.indexOf(status);
                    return (
                      <div className="flex flex-col items-center" key={status}>
                        <div className={`z-10 h-10 w-10 rounded-full border-4 border-[#0f0f0f] transition-all duration-500 ${
                          active ? "bg-teal-500" : "bg-[#1a1a1a]"
                        }`} />
                        <span className={`mt-3 text-[10px] font-bold uppercase tracking-tighter sm:tracking-widest ${
                          active ? "text-teal-400" : "text-slate-600"
                        }`}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Admin Note */}
            {issue.note && (
              <div className="rounded-2xl border border-teal-500/10 bg-teal-500/5 p-6 border-l-4 border-l-teal-500">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Latest Admin Update</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300 font-medium">{issue.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-white/[0.02] p-6 sm:px-8 text-right">
          <button
            className="rounded-xl bg-white text-black px-6 py-2.5 text-sm font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-white/5"
            onClick={onClose}
          >
            Close Details
          </button>
        </footer>
      </section>
    </div>
  );
}
