export default function StatCard({ label, value, detail, tone = "teal" }) {
  const tones = {
    teal: "from-teal-500/10 to-transparent border-teal-500/20 text-teal-400",
    blue: "from-blue-500/10 to-transparent border-blue-500/20 text-blue-400",
    rose: "from-rose-500/10 to-transparent border-rose-500/20 text-rose-400",
    emerald: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/10 to-transparent border-amber-500/20 text-amber-400",
  };

  return (
    <article className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br ${tones[tone]} p-8 glass-card transition-all duration-300 hover:-translate-y-1 hover:border-white/10`}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/[0.02] transition-transform duration-500 group-hover:scale-150" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <div className="mt-4 flex items-baseline gap-2">
        <strong className="text-5xl font-black tracking-tight text-white">{value}</strong>
      </div>
      {detail ? (
        <span className="mt-3 block text-xs font-bold text-slate-400 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
          {detail}
        </span>
      ) : null}
    </article>
  );
}
