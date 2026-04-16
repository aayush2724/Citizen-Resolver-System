export default function StatCard({ label, value, detail, tone = "teal" }) {
  const tones = {
    teal: "border-teal-500 bg-teal-50",
    blue: "border-blue-500 bg-blue-50",
    rose: "border-rose-500 bg-rose-50",
    emerald: "border-emerald-500 bg-emerald-50",
    amber: "border-amber-500 bg-amber-50",
  };

  return (
    <article className={`rounded-lg border-l-4 ${tones[tone]} p-4 shadow-sm`}>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <strong className="mt-2 block text-3xl text-slate-950">{value}</strong>
      {detail ? <span className="mt-1 block text-sm text-slate-600">{detail}</span> : null}
    </article>
  );
}
