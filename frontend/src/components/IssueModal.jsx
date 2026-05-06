import { X } from "lucide-react";
import { progressFor, statusOrder, statusTone } from "../utils/status";
import { fallbackImage, getRelevantImage } from "../utils/image";

export default function IssueModal({ issue, onClose }) {
  if (!issue) return null;

  const imageSrc = issue.imageUrl || getRelevantImage(issue.title, issue.description, issue.department);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-lg bg-white shadow-2xl animate-rise">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-black uppercase text-teal-700">{issue.id}</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{issue.title}</h2>
          </div>
          <button
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            type="button"
            onClick={onClose}
            aria-label="Close issue details"
          >
            <X size={20} />
          </button>
        </header>

        <div className="grid gap-5 p-5">
          <img
            className="max-h-72 w-full rounded-lg object-cover"
            src={imageSrc}
            alt=""
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImage;
            }}
          />
          <p className="leading-7 text-slate-700">{issue.description}</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Area", issue.area],
              ["Department", issue.department],
              ["Labour", issue.assignedLabour],
              ["SLA", `${issue.slaHours} hours`],
            ].map(([label, value]) => (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={label}>
                <span className="text-xs font-black uppercase text-slate-500">{label}</span>
                <strong className="mt-1 block text-slate-950">{value}</strong>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(issue.status)}`}>
                {issue.status}
              </span>
              <span className="text-sm font-bold text-slate-500">{Math.round(progressFor(issue.status))}% complete</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              {statusOrder.map((status) => {
                const active = statusOrder.indexOf(issue.status) >= statusOrder.indexOf(status);
                return (
                  <div
                    className={`rounded-lg border p-3 text-center text-sm font-black ${
                      active
                        ? "border-teal-500 bg-teal-50 text-teal-800"
                        : "border-slate-200 text-slate-400"
                    }`}
                    key={status}
                  >
                    {status}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-xs font-black uppercase text-slate-500">Latest update</span>
            <p className="mt-1 text-slate-700">{issue.note}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
