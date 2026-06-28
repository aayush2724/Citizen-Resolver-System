import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Construction,
  Droplets,
  Layers3,
  Lightbulb,
  MapPin,
  MessageCircle,
  Shield,
  Sparkles,
  TreePine,
  Users,
  Zap,
} from 'lucide-react';

const useInView = (threshold = 0.16) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold });

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
};

const Reveal = ({ children, delay = 0, className = '', eager = false }) => {
  const [ref, visible] = useInView();
  const isVisible = eager || visible;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0,0,0)' : 'translate3d(0,28px,0)',
        transition: `opacity 720ms cubic-bezier(.16,1,.3,1) ${delay}ms, transform 720ms cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const Metric = ({ value, label, tone }) => (
  <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
    <div className={`text-[24px] font-black leading-none ${tone}`}>{value}</div>
    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/52">{label}</div>
  </div>
);

const CityScene = () => {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointer = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setPointer({ x, y });
    };

    window.addEventListener('pointermove', handlePointer);
    return () => window.removeEventListener('pointermove', handlePointer);
  }, []);

  const blocks = useMemo(() => ([
    { x: 8, y: 50, h: 96, tone: 'from-cyan-300 to-sky-500', delay: '0s' },
    { x: 21, y: 32, h: 138, tone: 'from-amber-200 to-orange-500', delay: '-1.8s' },
    { x: 35, y: 58, h: 82, tone: 'from-emerald-300 to-teal-600', delay: '-.8s' },
    { x: 49, y: 24, h: 166, tone: 'from-fuchsia-300 to-rose-500', delay: '-2.7s' },
    { x: 64, y: 46, h: 112, tone: 'from-blue-300 to-indigo-600', delay: '-1.2s' },
    { x: 78, y: 36, h: 146, tone: 'from-lime-300 to-emerald-600', delay: '-2.2s' },
  ]), []);

  const reports = [
    { icon: Construction, label: 'Road fixed', pos: 'left-[6%] top-[16%]', color: 'text-amber-200' },
    { icon: Droplets, label: 'Leak mapped', pos: 'right-[4%] top-[30%]', color: 'text-cyan-200' },
    { icon: Lightbulb, label: 'Lights restored', pos: 'left-[12%] bottom-[22%]', color: 'text-yellow-200' },
  ];

  return (
    <div className="landing-scene relative min-h-[420px] md:min-h-[560px] overflow-hidden rounded-lg border border-white/14 bg-slate-950/38 shadow-[0_34px_120px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      <div className="absolute inset-0 opacity-70 landing-grid" />
      <div
        className="absolute inset-0 landing-scene-plane"
        style={{
          transform: `rotateX(${62 - pointer.y * 2}deg) rotateZ(${-28 + pointer.x * 3}deg) translate3d(-4%, 10%, 0)`,
        }}
      >
        <div className="absolute left-[7%] top-[46%] h-[2px] w-[86%] bg-cyan-200/40 shadow-[0_0_20px_rgba(125,211,252,.55)]" />
        <div className="absolute left-[12%] top-[28%] h-[2px] w-[70%] rotate-90 bg-amber-200/28 shadow-[0_0_18px_rgba(253,224,71,.4)]" />
        <div className="absolute left-[16%] top-[18%] h-[2px] w-[76%] rotate-[34deg] bg-emerald-200/25" />
        <div className="absolute left-[18%] top-[72%] h-[2px] w-[70%] -rotate-[28deg] bg-rose-200/25" />

        {blocks.map((block) => (
          <span
            key={`${block.x}-${block.y}`}
            className={`city-block absolute bg-gradient-to-t ${block.tone}`}
            style={{
              left: `${block.x}%`,
              top: `${block.y}%`,
              height: block.h,
              animationDelay: block.delay,
            }}
          />
        ))}
      </div>

      <div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/28 landing-ring"
        style={{ transform: `translate(-50%, -50%) rotateX(${64 - pointer.y * 3}deg) rotateZ(${pointer.x * 18}deg)` }}
      />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/40 landing-ring-fast" />

      {reports.map(({ icon: Icon, label, pos, color }) => (
        <div
          key={label}
          className={`absolute ${pos} hidden sm:flex items-center gap-2 rounded-lg border border-white/15 bg-black/32 px-3 py-2 text-white shadow-2xl backdrop-blur-xl landing-float`}
        >
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]">{label}</span>
        </div>
      ))}

      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-3">
        <Metric value="2.4k" label="Resolved" tone="text-emerald-200" />
        <Metric value="18m" label="Avg triage" tone="text-cyan-200" />
        <Metric value="98%" label="Satisfaction" tone="text-amber-200" />
      </div>
    </div>
  );
};

export default function LandingPage({ onGetStarted }) {
  const issueTypes = [
    { icon: Construction, title: 'Roads', desc: 'Potholes, broken medians, unsafe turns', color: 'text-amber-300' },
    { icon: Droplets, title: 'Water', desc: 'Leakage, supply gaps, burst pipes', color: 'text-cyan-300' },
    { icon: Zap, title: 'Lights', desc: 'Dark streets, damaged poles, outages', color: 'text-yellow-300' },
    { icon: TreePine, title: 'Parks', desc: 'Damaged play areas and public spaces', color: 'text-lime-300' },
  ];

  const flow = [
    { icon: MapPin, title: 'Capture', desc: 'Photo, GPS, priority, and department context are collected in one pass.' },
    { icon: Shield, title: 'Route', desc: 'Reports move to the right administrator queue with traceable status changes.' },
    { icon: Bell, title: 'Close', desc: 'Citizens receive live updates until evidence-backed resolution is complete.' },
  ];

  const features = [
    { icon: Layers3, title: '3D civic overview', desc: 'A visual operating layer for categories, workloads, and city zones.' },
    { icon: MessageCircle, title: 'Threaded messages', desc: 'Citizen and admin communication stays attached to each report.' },
    { icon: BarChart3, title: 'Performance analytics', desc: 'Resolution velocity, SLA health, and department load stay visible.' },
    { icon: Users, title: 'Role-aware flow', desc: 'Citizens, admins, and labour teams see the tools that matter to them.' },
  ];

  return (
    <div data-testid="page-landing" className="relative mx-auto w-full max-w-[1240px] px-4 pb-24 pt-4 text-white sm:px-6 lg:px-8">
      <section className="relative z-10 grid min-h-[calc(100vh-160px)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal eager className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-cyan-200" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/72">Smart Civic Command</span>
          </div>
          <h1 className="font-display-lg text-[48px] font-black leading-[0.98] text-white drop-shadow-2xl sm:text-[64px] lg:text-[84px]">
            CivicResolve
          </h1>
          <p className="mt-6 max-w-xl text-[15px] font-medium leading-7 text-white/66 md:text-[18px]">
            Report public issues through a fast, visual, real-time flow built for citizens and city teams.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onGetStarted('signup')}
              className="group inline-flex items-center justify-center gap-3 rounded-lg bg-white px-6 py-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#342721] shadow-[0_18px_50px_rgba(255,255,255,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-50 active:translate-y-0"
            >
              Start reporting
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => onGetStarted('login')}
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-4 text-[13px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/16 active:translate-y-0"
            >
              Sign in
            </button>
          </div>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <Metric value="24h" label="Response" tone="text-cyan-200" />
            <Metric value="6" label="Departments" tone="text-amber-200" />
            <Metric value="Live" label="Updates" tone="text-emerald-200" />
          </div>
        </Reveal>

        <Reveal eager delay={120} className="relative z-10">
          <CityScene />
        </Reveal>
      </section>

      <section className="grid gap-4 py-16 md:grid-cols-4">
        {issueTypes.map(({ icon: Icon, title, desc, color }, index) => (
          <Reveal key={title} delay={index * 80}>
            <div className="group h-full rounded-lg border border-white/14 bg-white/[0.08] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.13]">
              <Icon className={`h-6 w-6 ${color} transition-transform duration-300 group-hover:scale-110`} />
              <h3 className="mt-5 text-[15px] font-black uppercase tracking-[0.08em] text-white">{title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-white/54">{desc}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="py-14">
        <Reveal>
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200/80">Smooth Flow</p>
              <h2 className="mt-3 text-[32px] font-black leading-tight md:text-[44px]">From street problem to closed case.</h2>
            </div>
            <p className="max-w-md text-[14px] leading-7 text-white/58">
              The product flow is built around short decisions, visible progress, and zero guesswork for the next action.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {flow.map(({ icon: Icon, title, desc }, index) => (
            <Reveal key={title} delay={index * 90}>
              <div className="relative h-full rounded-lg border border-white/14 bg-black/24 p-6 backdrop-blur-xl">
                <div className="mb-8 flex items-center justify-between">
                  <Icon className="h-7 w-7 text-amber-200" />
                  <span className="text-[12px] font-black text-white/36">0{index + 1}</span>
                </div>
                <h3 className="text-[20px] font-black text-white">{title}</h3>
                <p className="mt-3 text-[13px] leading-6 text-white/56">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <div className="rounded-lg border border-white/14 bg-white/[0.08] p-7 backdrop-blur-xl">
            <CheckCircle2 className="h-8 w-8 text-emerald-200" />
            <h2 className="mt-5 text-[30px] font-black leading-tight">Built for clean daily operations.</h2>
            <p className="mt-4 text-[14px] leading-7 text-white/58">
              Citizens get a polished reporting path. Admins get assignment, monitoring, and resolution tools without a messy handoff.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }, index) => (
            <Reveal key={title} delay={index * 70}>
              <div className="h-full rounded-lg border border-white/14 bg-black/24 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-black/32">
                <Icon className="h-6 w-6 text-cyan-200" />
                <h3 className="mt-5 text-[15px] font-black uppercase tracking-[0.08em] text-white">{title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-white/54">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="mt-10 flex flex-col items-start justify-between gap-6 rounded-lg border border-white/16 bg-white/[0.1] p-7 backdrop-blur-xl md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-200/80">Ready</p>
            <h2 className="mt-2 text-[28px] font-black leading-tight text-white">Open the portal and start resolving faster.</h2>
          </div>
          <button
            type="button"
            onClick={() => onGetStarted('signup')}
            className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-white px-6 py-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#342721] transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-50 md:w-auto"
          >
            Create account
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </Reveal>
    </div>
  );
}
