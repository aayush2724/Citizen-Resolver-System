export default function StatCard({ label, value, detail, tone = "primary" }) {
  const tones = {
    primary: "border-primary/20 bg-primary/5 text-primary",
    secondary: "border-slate-200 bg-slate-50 text-slate-600",
    rose: "border-rose-500/20 bg-rose-50 text-rose-600",
    emerald: "border-emerald-500/20 bg-emerald-50 text-emerald-600",
    amber: "border-amber-500/20 bg-amber-50 text-amber-600",
    blue: "border-blue-500/20 bg-blue-50 text-blue-600",
  };

  return (
    <article className={`group relative overflow-hidden rounded-full border ${tones[tone] || tones.primary} px-10 py-8 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-xl`}>
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <strong className="text-4xl font-black tracking-tighter text-text-dark group-hover:scale-105 transition-transform duration-500">{value}</strong>
        </div>
        {detail ? (
          <span className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {detail}
          </span>
        ) : null}
      </div>
    </article>
  );
}
