import React, { useState, useEffect } from 'react';

const COLORS = ['#342721', '#4a3830', '#8B7355', '#CDB893', '#DDC5A3', '#ffffff'];
const DEPT_COLORS = {
  Roads: '#f59e0b',
  Sanitation: '#10b981',
  'Water Supply': '#3b82f6',
  'Street Lights': '#eab308',
  Drainage: '#6366f1',
  'Public Parks': '#22c55e',
};

const BarChart = ({ data, labelKey, valueKey, title }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);
  return (
    <div>
      <h3 className="text-[13px] font-bold text-[#342721] dark:text-[#DDC5A3] uppercase tracking-widest mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => {
          const val = Number(item[valueKey]) || 0;
          const pct = Math.round((val / max) * 100);
          const color = DEPT_COLORS[item[labelKey]] || COLORS[i % COLORS.length];
          return (
            <div key={item[labelKey] || i}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[12px] font-semibold text-[#342721] dark:text-[#DDC5A3] truncate max-w-[60%]">
                  {item[labelKey] || 'Unknown'}
                </span>
                <span className="text-[12px] font-black text-[#342721] dark:text-[#DDC5A3]">{val}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#DDC5A3] dark:bg-[#4a3830] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DonutChart = ({ data, labelKey, valueKey, title }) => {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0) || 1;
  const statusColors = {
    Pending: '#f59e0b',
    Assigned: '#3b82f6',
    'In Progress': '#6366f1',
    Resolved: '#10b981',
  };

  let cumulative = 0;
  const slices = data.map((d, i) => {
    const val = Number(d[valueKey]) || 0;
    const pct = val / total;
    const start = cumulative;
    cumulative += pct;
    const color = statusColors[d[labelKey]] || COLORS[i % COLORS.length];
    return { ...d, pct, start, color, val };
  });

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const slicePath = (slice, cx, cy, r) => {
    const startAngle = slice.start * 360;
    const endAngle = (slice.start + slice.pct) * 360;
    if (Math.abs(endAngle - startAngle) < 0.01) return null;
    const s = polarToCartesian(cx, cy, r, startAngle);
    const e = polarToCartesian(cx, cy, r, endAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
  };

  return (
    <div>
      <h3 className="text-[13px] font-bold text-[#342721] dark:text-[#DDC5A3] uppercase tracking-widest mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <svg width="100" height="100" viewBox="0 0 100 100">
          {slices.map((slice, i) => {
            const d = slicePath(slice, 50, 50, 42);
            if (!d) return null;
            return <path key={i} d={d} fill={slice.color} />;
          })}
          <circle cx="50" cy="50" r="24" fill="white" className="dark:fill-[#342721]" />
          <text x="50" y="53" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#342721">{total}</text>
        </svg>
        <div className="space-y-2 flex-1">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-[11px] text-[#8B7355] truncate">{slice[labelKey] || 'Unknown'}</span>
              <span className="ml-auto text-[11px] font-bold text-[#342721] dark:text-[#DDC5A3]">{slice.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TimelineChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="text-center text-[#8B7355] py-8 text-sm">No timeline data yet</div>
  );
  const max = Math.max(...data.map(d => Number(d.count) || 0), 1);
  const W = 300, H = 80;
  const pts = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * W,
    y: H - ((Number(d.count) || 0) / max) * (H - 10) - 5,
    count: d.count,
    date: d.date,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div>
      <h3 className="text-[13px] font-bold text-[#342721] dark:text-[#DDC5A3] uppercase tracking-widest mb-4">Issues Over Time (Last 30 Days)</h3>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#342721" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#342721" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#timeGrad)" />
        <path d={pathD} stroke="#342721" strokeWidth="2" fill="none" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#342721" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-[#8B7355] mt-1">
        <span>{data[0]?.date || ''}</span>
        <span>{data[data.length - 1]?.date || ''}</span>
      </div>
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('citizen-user') || '{}');
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error('Failed to load analytics');
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-[#342721] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-red-500">{error}</div>
  );

  const kpis = [
    { label: 'Total Active', value: data.totalActive, icon: 'folder_open', color: 'text-[#342721]', bg: 'bg-[#DDC5A3]' },
    { label: 'Resolved', value: data.totalResolved, icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Urgent Issues', value: data.urgentIssues, icon: 'warning', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Citizens', value: data.citizenCount, icon: 'group', color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <span className="text-[#342721] font-bold text-[11px] uppercase tracking-widest block mb-1">Administration</span>
        <h1 className="text-[34px] md:text-[44px] font-black text-[#342721] dark:text-[#DDC5A3] leading-none tracking-[-0.04em]">
          Analytics
        </h1>
        <p className="text-[#8B7355] text-sm mt-2">Real-time insights into CivicResolve activity</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white/90 dark:bg-[#342721]/90 backdrop-blur-md rounded-[1.75rem] p-6 shadow-sm border border-white/60 dark:border-white/10">
            <div className={`w-11 h-11 ${k.bg} rounded-2xl flex items-center justify-center mb-4`}>
              <span className={`material-symbols-outlined ${k.color} text-xl`}>{k.icon}</span>
            </div>
            <p className="text-[36px] font-black text-[#342721] dark:text-[#DDC5A3] leading-none">{k.value}</p>
            <p className="text-[11px] font-semibold text-[#8B7355] uppercase tracking-wider mt-2">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/90 dark:bg-[#342721]/90 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white/60 dark:border-white/10">
          <DonutChart data={data.byStatus} labelKey="status" valueKey="count" title="By Status" />
        </div>
        <div className="bg-white/90 dark:bg-[#342721]/90 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white/60 dark:border-white/10">
          <BarChart data={data.byDepartment} labelKey="department" valueKey="count" title="By Department" />
        </div>
        <div className="bg-white/90 dark:bg-[#342721]/90 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white/60 dark:border-white/10">
          <BarChart data={data.byPriority} labelKey="priority" valueKey="count" title="By Priority" />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white/90 dark:bg-[#342721]/90 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white/60 dark:border-white/10">
        <TimelineChart data={data.timeline} />
      </div>

      {/* Top Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 dark:bg-[#342721]/90 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white/60 dark:border-white/10">
          <BarChart data={data.byArea} labelKey="area" valueKey="count" title="Issues by Area" />
        </div>
        <div className="bg-white/90 dark:bg-[#342721]/90 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white/60 dark:border-white/10">
          <h3 className="text-[13px] font-bold text-[#342721] dark:text-[#DDC5A3] uppercase tracking-widest mb-4">Department Performance</h3>
          <div className="space-y-4">
            {(data.topDepts || []).map((d, i) => {
              const total = Number(d.count) || 0;
              const resolved = Number(d.resolved) || 0;
              const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-28 text-[11px] font-semibold text-[#8B7355] truncate">{d.department}</div>
                  <div className="flex-1 h-2.5 rounded-full bg-[#DDC5A3] dark:bg-[#4a3830] overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${rate}%` }} />
                  </div>
                  <div className="w-12 text-right text-[11px] font-black text-[#342721] dark:text-[#DDC5A3]">{rate}%</div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[#8B7355] mt-4">Resolution rate by department</p>
        </div>
      </div>
    </div>
  );
}
