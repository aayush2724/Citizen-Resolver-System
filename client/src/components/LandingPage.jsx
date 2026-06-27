import React, { useEffect, useRef, useState } from 'react';
import { Shield, MapPin, Bell, BarChart3, Users, MessageCircle, Droplets, Zap, TreePine, Lightbulb, Bug, Construction } from 'lucide-react';

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const ScaleIn = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useInView(0.2);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.9)',
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const CountUp = ({ target, suffix = '', duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

export default function LandingPage({ onGetStarted }) {
  const issueTypes = [
    { icon: <Construction className="w-5 h-5" />, title: 'Roads & Potholes', color: 'bg-orange-50 text-orange-600' },
    { icon: <Droplets className="w-5 h-5" />, title: 'Water Supply', color: 'bg-blue-50 text-blue-600' },
    { icon: <Zap className="w-5 h-5" />, title: 'Street Lights', color: 'bg-yellow-50 text-yellow-600' },
    { icon: <Bug className="w-5 h-5" />, title: 'Sanitation', color: 'bg-green-50 text-green-600' },
    { icon: <TreePine className="w-5 h-5" />, title: 'Public Parks', color: 'bg-emerald-50 text-emerald-600' },
    { icon: <Lightbulb className="w-5 h-5" />, title: 'Drainage', color: 'bg-purple-50 text-purple-600' },
  ];

  const features = [
    { icon: <Shield className="w-6 h-6" />, title: 'Report Issues', desc: 'Report civic problems with photos, GPS location, and priority levels.' },
    { icon: <Bell className="w-6 h-6" />, title: 'Real-Time Updates', desc: 'Get instant notifications as your issue progresses through resolution.' },
    { icon: <Users className="w-6 h-6" />, title: 'Admin Dashboard', desc: 'Admins assign departments, track labor, and manage the full workflow.' },
    { icon: <BarChart3 className="w-6 h-6" />, title: 'Analytics', desc: 'Track resolution rates, SLA compliance, and department performance.' },
    { icon: <MessageCircle className="w-6 h-6" />, title: 'Messaging', desc: 'Direct communication between citizens and administrators.' },
    { icon: <MapPin className="w-6 h-6" />, title: 'GPS Tracking', desc: 'Pin exact locations of issues for faster on-ground response.' },
  ];

  const steps = [
    { num: '01', title: 'Report', desc: 'Spot an issue? Snap a photo, drop a pin, and submit in seconds.' },
    { num: '02', title: 'Assign', desc: 'Admins review and assign the right department and team.' },
    { num: '03', title: 'Resolve', desc: 'Track progress in real-time with status updates and messaging.' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-24">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-[#342721]/10 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-4 h-4 text-[#342721]" />
            <span className="text-[11px] font-bold text-[#342721] uppercase tracking-wider">CivicResolve</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="font-display-lg text-[48px] md:text-[64px] font-extrabold text-[#342721] leading-[1.05] mb-6">
            Your City.<br />Your Voice.<br />Your Resolution.
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-[#8B7355] text-[16px] max-w-xl mx-auto leading-relaxed mb-10">
            Report civic issues, track their resolution in real-time, and hold authorities accountable — all from one platform.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onGetStarted('signup')}
              className="bg-[#342721] text-white px-8 py-3.5 rounded-2xl font-bold text-[14px] hover:bg-[#4a3830] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started Free
            </button>
            <button
              onClick={() => onGetStarted('login')}
              className="bg-white border-2 border-[#342721]/20 text-[#342721] px-8 py-3.5 rounded-2xl font-bold text-[14px] hover:border-[#342721]/40 transition-all hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </div>
        </FadeIn>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
        {[
          { value: 2400, suffix: '+', label: 'Issues Resolved' },
          { value: 98, suffix: '%', label: 'Satisfaction Rate' },
          { value: 6, suffix: '', label: 'Departments' },
          { value: 24, suffix: 'h', label: 'Avg. Response' },
        ].map((s, i) => (
          <ScaleIn key={s.label} delay={i * 0.08}>
            <div className="bg-white/80 rounded-2xl p-6 text-center border border-[#DDC5A3] hover:shadow-md transition-all hover:-translate-y-1">
              <p className="text-[#342721] font-extrabold text-[28px]">
                <CountUp target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-[#8B7355] text-[11px] uppercase tracking-wider font-bold mt-1">{s.label}</p>
            </div>
          </ScaleIn>
        ))}
      </div>

      <div className="mb-24">
        <FadeIn>
          <h2 className="text-center text-[28px] font-extrabold text-[#342721] mb-3">How It Works</h2>
          <p className="text-center text-[#8B7355] text-[14px] mb-14">Three simple steps to a better community</p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.12}>
              <div className="text-center relative">
                <div className="w-14 h-14 bg-[#342721] text-white rounded-2xl flex items-center justify-center text-[18px] font-extrabold mx-auto mb-5 shadow-lg">
                  {s.num}
                </div>
                <h3 className="font-bold text-[17px] text-[#342721] mb-2">{s.title}</h3>
                <p className="text-[#8B7355] text-[13px] leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#342721]/20 to-transparent" />
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      <div className="mb-24">
        <FadeIn>
          <h2 className="text-center text-[28px] font-extrabold text-[#342721] mb-3">What You Can Report</h2>
          <p className="text-center text-[#8B7355] text-[14px] mb-12">Across 6 departments covering all civic services</p>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {issueTypes.map((t, i) => (
            <ScaleIn key={t.title} delay={i * 0.06}>
              <div className="bg-white/80 rounded-2xl p-5 border border-[#DDC5A3] flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1 cursor-default">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.color}`}>
                  {t.icon}
                </div>
                <span className="font-bold text-[14px] text-[#342721]">{t.title}</span>
              </div>
            </ScaleIn>
          ))}
        </div>
      </div>

      <div className="mb-24">
        <FadeIn>
          <h2 className="text-center text-[28px] font-extrabold text-[#342721] mb-3">Everything You Need</h2>
          <p className="text-center text-[#8B7355] text-[14px] mb-12">A complete civic issue management platform</p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div className="bg-white/80 rounded-2xl p-7 border border-[#DDC5A3] hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                <div className="w-10 h-10 bg-[#342721]/10 rounded-xl flex items-center justify-center text-[#342721] mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[15px] text-[#342721] mb-2">{f.title}</h3>
                <p className="text-[#8B7355] text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      <FadeIn>
        <div className="bg-[#342721] rounded-[2rem] p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="relative z-10">
            <h2 className="text-white text-[28px] font-extrabold mb-3">Ready to Make a Difference?</h2>
            <p className="text-white/70 text-[14px] mb-8 max-w-md mx-auto">
              Join thousands of citizens who are already improving their communities.
            </p>
            <button
              onClick={() => onGetStarted('signup')}
              className="bg-white text-[#342721] px-10 py-3.5 rounded-2xl font-bold text-[14px] hover:bg-gray-100 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              Create Your Account
            </button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
