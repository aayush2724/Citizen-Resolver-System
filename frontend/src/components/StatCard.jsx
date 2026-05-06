export default function StatCard({ label, value, detail, tone = "teal" }) {
  const tones = {
    teal: "text-teal-400 border-teal-500/30 bg-teal-500/5",
    blue: "text-blue-400 border-blue-500/30 bg-blue-500/5",
    rose: "text-rose-400 border-rose-500/30 bg-rose-500/5",
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  };

  return (
    <article className={`rounded-2xl border ${tones[tone]} p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/5`}>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <strong className="mt-3 block text-4xl font-black text-white">{value}</strong>
      {detail ? <span className="mt-2 block text-xs font-medium text-slate-400">{detail}</span> : null}
    </article>
  );
}
