import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from './services/api';
import IssueCard from './components/IssueCard';
import IssueModal from './components/IssueModal';
import MobileNav from './components/MobileNav';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { Shield, MapPin, Search, Filter } from 'lucide-react';
import { getRelevantImage } from './utils/image';
import LandingPage from './components/LandingPage';

const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};
// --- Global Styles ---
const globalStyles = `
  select {
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    appearance: none !important;
    background-image: none !important;
  }
  select::-ms-expand {
    display: none !important;
  }
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24 !important;
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
  }
  @keyframes kenBurns {
    0%   { transform: scale(1.0) translate(0%, 0%); }
    33%  { transform: scale(1.12) translate(-2%, -1%); }
    66%  { transform: scale(1.08) translate(2%, 1%); }
    100% { transform: scale(1.15) translate(-1%, 2%); }
  }
  @keyframes floatUp {
    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
    50% { transform: translateY(-28px) rotate(3deg); opacity: 1; }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-18px); }
  }
  @keyframes scanLine {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.85); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 0.4; }
    100% { transform: scale(0.85); opacity: 0.8; }
  }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 30px 8px rgba(33,61,118,0.35); }
    50% { box-shadow: 0 0 60px 18px rgba(33,61,118,0.6); }
  }
  @keyframes particleDrift {
    0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-10vh) translateX(40px); opacity: 0; }
  }
  .kb-image {
    animation: kenBurns 28s ease-in-out infinite alternate;
    will-change: transform;
  }
  .float-card {
    animation: floatUp 6s ease-in-out infinite;
  }
  .float-card-2 {
    animation: floatUp 8s ease-in-out infinite;
    animation-delay: -2s;
  }
  .float-card-3 {
    animation: floatUp 7s ease-in-out infinite;
    animation-delay: -4s;
  }
  .hero-text-1 { animation: fadeSlideUp 0.8s ease-out 0.1s both; }
  .hero-text-2 { animation: fadeSlideUp 0.8s ease-out 0.3s both; }
  .hero-text-3 { animation: fadeSlideUp 0.8s ease-out 0.5s both; }
  .hero-text-4 { animation: fadeSlideUp 0.8s ease-out 0.7s both; }
  .hero-text-5 { animation: fadeSlideUp 0.8s ease-out 0.9s both; }
  .ticker-track { animation: ticker 30s linear infinite; }
  .scan-line { animation: scanLine 6s linear infinite; }
  .glow-btn { animation: glowPulse 3s ease-in-out infinite; }

  @keyframes shimmer {
    0%   { transform: translateX(-120%) skewX(-15deg); }
    100% { transform: translateX(220%) skewX(-15deg); }
  }
  @keyframes rippleOut {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes btnBorderPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(96,165,250,0.5), 0 8px 32px rgba(29,78,216,0.35); }
    50%       { box-shadow: 0 0 0 6px rgba(96,165,250,0), 0 12px 40px rgba(29,78,216,0.55); }
  }
  @keyframes arrowBounce {
    0%, 100% { transform: translateX(0); }
    50%       { transform: translateX(5px); }
  }
  .btn-primary-shimmer::after {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 40%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
    transform: translateX(-120%) skewX(-15deg);
  }
  .btn-primary-shimmer:hover::after {
    animation: shimmer 0.7s ease-in-out;
  }
  .btn-primary-shimmer:hover {
    animation: btnBorderPulse 1.5s ease-in-out infinite;
  }
  .btn-primary-shimmer .arrow-icon {
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .btn-primary-shimmer:hover .arrow-icon {
    animation: arrowBounce 0.5s ease-in-out infinite;
  }
  .btn-ghost-shimmer::after {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 40%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    transform: translateX(-120%) skewX(-15deg);
  }
  .btn-ghost-shimmer:hover::after {
    animation: shimmer 0.7s ease-in-out;
  }
  .btn-ghost-shimmer:hover {
    background: rgba(255,255,255,0.14) !important;
    border-color: rgba(255,255,255,0.4) !important;
  }
  .ripple-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.35);
    pointer-events: none;
    animation: rippleOut 0.7s ease-out forwards;
  }
  @keyframes cinematicPop {
    0%   { opacity: 0; transform: scale(0.88) translateY(14px); }
    100% { opacity: 1; transform: scale(1)    translateY(0px);  }
  }
  @keyframes cinematicFadeIn {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  .cinematic-popup {
    animation: cinematicPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
`;

// --- Ripple Button ---
const RippleButton = ({ to, className, style, children, onClick }) => {
  const [ripples, setRipples] = React.useState([]);
  const ref = React.useRef(null);

  const handleClick = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y, size }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
    if (onClick) onClick(e);
  };

  const Tag = to ? NavLink : 'button';
  return (
    <Tag to={to} ref={ref} className={className} style={style} onClick={handleClick}>
      {children}
      {ripples.map(r => (
        <span
          key={r.id}
          className="ripple-circle"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </Tag>
  );
};

// --- Components ---

const Header = ({ currentUser, onLogout, notifications = [] }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleNotificationClick = async (n) => {
    try {
      if (!n.read) await api.markNotificationRead(n.id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3 max-w-container-max mx-auto bg-white/80 dark:bg-[#0c1422]/95 backdrop-blur-md rounded-full mt-4 w-[95%] shadow-sm flex-shrink-0 border border-[#7E8AA9]/30 dark:border-white/10">
      <div className="flex items-center gap-3">
        <div className="bg-[#213D76] p-2 rounded-xl flex items-center justify-center shadow-sm shadow-[#213D76]/20">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
        </div>
        <div className="flex flex-col">
          <span
            className="text-lg md:text-xl font-black text-[#161d1a] dark:text-[#E0EDF8] leading-none tracking-[-0.03em]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            CivicResolve
          </span>
          <span className="text-[9px] uppercase tracking-[0.28em] font-bold text-[#1F345E] opacity-80 dark:text-[#9DB4E6] dark:opacity-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Empowering Communities
          </span>
        </div>
      </div>
      <nav className="hidden md:flex items-center bg-[#E0EDF8] dark:bg-[#111b2d]/95 rounded-full p-1 ml-4 dark:border dark:border-white/10">
        <NavLink to="/" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#1F345E] dark:bg-[#284c9a] text-white shadow-md' : 'text-[#1F345E] dark:text-[#EAF2FF] hover:text-[#0f1e3d] dark:hover:text-white'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Home</NavLink>
        <NavLink to="/report" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#1F345E] dark:bg-[#284c9a] text-white shadow-md' : 'text-[#1F345E] dark:text-[#EAF2FF] hover:text-[#0f1e3d] dark:hover:text-white'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Report Issue</NavLink>
        <NavLink to="/my-issues" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#1F345E] dark:bg-[#284c9a] text-white shadow-md' : 'text-[#1F345E] dark:text-[#EAF2FF] hover:text-[#0f1e3d] dark:hover:text-white'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Issues</NavLink>
        <NavLink to="/public-issues" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#1F345E] dark:bg-[#284c9a] text-white shadow-md' : 'text-[#1F345E] dark:text-[#EAF2FF] hover:text-[#0f1e3d] dark:hover:text-white'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Public Issues</NavLink>
        {currentUser?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#1F345E] dark:bg-[#284c9a] text-white shadow-md' : 'text-[#1F345E] dark:text-[#EAF2FF] hover:text-[#0f1e3d] dark:hover:text-white'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dashboard</NavLink>
        )}
        {currentUser?.role === 'admin' && (
          <NavLink to="/analytics" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#1F345E] dark:bg-[#284c9a] text-white shadow-md' : 'text-[#1F345E] dark:text-[#EAF2FF] hover:text-[#0f1e3d] dark:hover:text-white'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Analytics</NavLink>
        )}
        <NavLink to="/report-bug" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#1F345E] dark:bg-[#284c9a] text-white shadow-md' : 'text-[#1F345E] dark:text-[#EAF2FF] hover:text-[#0f1e3d] dark:hover:text-white'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Report Bug</NavLink>
      </nav>

      <MobileNav currentUser={currentUser} onLogout={onLogout} />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 hidden md:flex items-center justify-center rounded-full bg-white dark:bg-[#101826] shadow-sm hover:bg-[#E0EDF8] dark:hover:bg-[#1a2740] transition-all border border-[#7E8AA9]/20 dark:border-white/10"
        >
          <span className="material-symbols-outlined text-[#1F345E] dark:text-[#EAF2FF] text-xl">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-10 h-10 hidden md:flex items-center justify-center rounded-full bg-white dark:bg-[#101826] shadow-sm hover:bg-[#E0EDF8] dark:hover:bg-[#1a2740] transition-all border border-[#7E8AA9]/20 dark:border-white/10 relative"
          >
            <span className="material-symbols-outlined text-[#1F345E] dark:text-[#EAF2FF] text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#d84315] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 dark:bg-[#101826]/98 backdrop-blur-md rounded-2xl shadow-premium border border-outline-variant/30 dark:border-white/10 flex flex-col overflow-hidden z-50">
              <div className="px-4 py-3 bg-[#E0EDF8] dark:bg-[#16233a] border-b border-[#7E8AA9]/20 dark:border-white/10 flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#1F345E] dark:text-[#EAF2FF] uppercase tracking-wider">Notifications</p>
                {unreadCount > 0 && (
                  <span className="bg-[#213D76] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount} new</span>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {(notifications || []).length === 0 ? (
                  <p className="text-center text-[#7E8AA9] dark:text-[#9DB4E6] text-sm py-6">No notifications</p>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        handleNotificationClick(n);
                        setNotifOpen(false);
                      }}
                      className={`w-full text-left flex items-start gap-3 p-3 border-b border-[#7E8AA9]/10 hover:bg-[#E0EDF8] dark:bg-[#2a322e] transition-all group ${
                        n.read ? 'opacity-50' : 'bg-white dark:bg-[#161d1a]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        n.read ? 'bg-[#7E8AA9]' : 'bg-[#213D76]'
                      }`}></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#161d1a] dark:text-[#E0EDF8] truncate group-hover:text-[#1F345E]">
                          {n.title || 'New Notification'}
                        </p>
                        <p className="text-[11px] text-[#7E8AA9] dark:text-[#9DB4E6] mt-0.5 line-clamp-2">
                          {n.message || n.body || ''}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Backdrop to close dropdown */}
          {notifOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setNotifOpen(false)}
            />
          )}
        </div>
        
        {currentUser && (
          <div className="relative group">
            <button className="flex items-center gap-3 bg-white dark:bg-[#101826] px-3 py-1.5 rounded-full shadow-sm border border-[#7E8AA9]/30 dark:border-white/10 hover:bg-[#E0EDF8] dark:hover:bg-[#1a2740] transition-all">
              <div className="w-8 h-8 rounded-full bg-[#213D76] flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-[#213D76]/20">
                {currentUser.name?.[0].toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:flex flex-col items-start text-left">
                <span className="text-[10px] font-bold text-[#161d1a] dark:text-[#EAF2FF] leading-tight">{currentUser.name}</span>
                <span className="text-[8px] uppercase text-[#7E8AA9] dark:text-[#9DB4E6] font-bold">{currentUser.role || 'Citizen'}</span>
              </div>
              <span className="material-symbols-outlined text-[#7E8AA9] dark:text-[#9DB4E6] text-sm ml-1 group-hover:text-[#1F345E] dark:group-hover:text-white">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-[#101826]/98 backdrop-blur-md rounded-2xl shadow-premium border border-outline-variant/30 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 flex flex-col overflow-hidden z-50">
              <div className="px-4 py-3 bg-[#E0EDF8] dark:bg-[#16233a] border-b border-[#7E8AA9]/20 dark:border-white/10">
                <p className="text-[10px] font-bold text-[#1F345E] dark:text-[#EAF2FF] uppercase tracking-wider">Active Accounts</p>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {(api.getSessions() || []).map(session => (
                  <div
                    key={session.email}
                    onClick={() => api.switchAccount(session.token)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      session.email === currentUser.email 
                        ? 'bg-[#1F345E]/5 cursor-default' 
                        : 'hover:bg-[#E0EDF8] cursor-pointer'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') api.switchAccount(session.token); }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      session.role === 'admin' ? 'bg-[#161d1a] text-white' : 'bg-[#213D76] text-white'
                    }`}>
                      {session.name?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-bold truncate ${session.email === currentUser.email ? 'text-[#1F345E] dark:text-[#EAF2FF]' : 'text-[#161d1a] dark:text-[#EAF2FF]'}`}>
                        {session.name}
                      </p>
                      <p className="text-[10px] text-[#7E8AA9] dark:text-[#9DB4E6] truncate">{session.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.email === currentUser.email && (
                        <span className="material-symbols-outlined text-[#213D76] dark:text-[#60a5fa] text-sm">check_circle</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); api.logoutSession(session.email); }}
                        title="Sign out this account"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-[#7E8AA9] dark:text-[#9DB4E6] hover:bg-[#ffecec] hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined">logout</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#7E8AA9]/20 dark:border-white/10 p-2">
                <button
                  onClick={() => window.dispatchEvent(new Event("trigger-add-account"))}
                  className="w-full text-left px-3 py-2 text-[12px] font-bold text-[#161d1a] dark:text-[#E0EDF8] hover:bg-[#E0EDF8] dark:bg-[#2a322e] rounded-xl flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  Add Another Account
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-[12px] font-bold text-error hover:bg-error-container rounded-xl flex items-center gap-2 transition-colors mt-1"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign Out All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="relative z-50 bg-[#E0EDF8] dark:bg-[#2a322e]/50 backdrop-blur-md border-t border-[#7E8AA9]/30 dark:border-white/10 py-6 mt-auto">
    <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center px-margin-desktop">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#213D76] flex items-center justify-center rounded">
            <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
          </div>
          <span className="font-bold text-[#1F345E] text-sm">CivicResolve</span>
        </div>
        <span className="hidden md:inline text-[11px] text-[#1F345E] dark:text-[#7E8AA9] opacity-60">© 2024 CivicResolve System</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex gap-4">
          <a className="text-[#1F345E] dark:text-[#7E8AA9] hover:text-[#1F345E] transition-colors font-label-bold text-[11px]" href="#">Privacy</a>
          <a className="text-[#1F345E] dark:text-[#7E8AA9] hover:text-[#1F345E] transition-colors font-label-bold text-[11px]" href="#">Terms</a>
          <a className="text-[#1F345E] dark:text-[#7E8AA9] hover:text-[#1F345E] transition-colors font-label-bold text-[11px]" href="#">Support</a>
        </div>
        <div className="flex gap-2">
          <a className="w-8 h-8 rounded-full bg-white dark:bg-[#161d1a] flex items-center justify-center hover:bg-[#213D76] hover:text-white transition-all shadow-sm" href="#">
            <span className="material-symbols-outlined text-sm">public</span>
          </a>
          <a className="w-8 h-8 rounded-full bg-white dark:bg-[#161d1a] flex items-center justify-center hover:bg-[#213D76] hover:text-white transition-all shadow-sm" href="#">
            <span className="material-symbols-outlined text-sm">mail</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

const ParallaxBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredBadge, setHoveredBadge] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const badgeInfo = {
    roads: {
      image: '/images/Roads/Roads.jpg',
      label: 'Roads & Potholes',
      icon: 'construction',
      color: '#fbbf24',
      glow: 'rgba(251,191,36,0.55)',
      desc: 'Crumbling road surfaces and deep potholes endangering commuters and vehicles across the city.',
      stat: '847 active reports',
      popupStyle: { top: '8%', left: '20%' },
    },
    water: {
      image: '/images/WaterSupply/WaterSupply.jpg',
      label: 'Water Supply',
      icon: 'water_drop',
      color: '#34d399',
      glow: 'rgba(52,211,153,0.55)',
      desc: 'Burst pipes, low pressure, and supply disruptions leaving neighbourhoods without clean water.',
      stat: '312 active reports',
      popupStyle: { top: '8%', right: '20%' },
    },
    lights: {
      image: '/images/StreetLights/StreetLights.jpg',
      label: 'Street Lights',
      icon: 'lightbulb',
      color: '#fde047',
      glow: 'rgba(253,224,71,0.55)',
      desc: 'Dark streets and non-functional lamps creating safety risks for pedestrians after sunset.',
      stat: '189 active reports',
      popupStyle: { bottom: '18%', right: '20%' },
    },
    drainage: {
      image: '/images/Drainage/Drainage.jpg',
      label: 'Drainage',
      icon: 'water',
      color: '#67e8f9',
      glow: 'rgba(103,232,249,0.55)',
      desc: 'Clogged drains causing waterlogging and flooding across streets and residential areas.',
      stat: '423 active reports',
      popupStyle: { bottom: '18%', left: '20%' },
    },
  };

  const badge = hoveredBadge ? badgeInfo[hoveredBadge] : null;

  const getParallaxStyle = (depth) => ({
    transform: `translate3d(${(window.innerWidth / 2 - mousePos.x) * depth * 0.06}px, ${(window.innerHeight / 2 - mousePos.y) * depth * 0.06}px, 0)`,
    transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
  });

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 5) % 95}%`,
    size: i % 3 === 0 ? 3 : i % 3 === 1 ? 5 : 2,
    delay: `${(i * 1.3) % 12}s`,
    duration: `${10 + (i * 1.7) % 14}s`,
  }));

  return (
    <>
      {/* ── Background layer (non-interactive) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* ── Single Full-screen Ken Burns Background Image ── */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/images/india-community_2.jpg"
            alt=""
            className="kb-image absolute inset-0 w-full h-full object-cover"
            style={{ transformOrigin: 'center center' }}
          />
          {/* Cinematic overlay — preserves image colours, darkens for readability */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.55) 100%)'
          }} />
          {/* Centre spotlight keeps hero text area bright */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, rgba(0,0,0,0.30) 100%)'
          }} />
        </div>

        {/* ── Animated scan line ── */}
        <div
          className="scan-line absolute left-0 right-0 h-px opacity-[0.08]"
          style={{ background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)' }}
        />

        {/* ── Grid overlay with parallax ── */}
        <div className="absolute inset-0 opacity-[0.07]" style={getParallaxStyle(0.08)}>
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="64" id="hero-grid" patternUnits="userSpaceOnUse" width="64">
                <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#60a5fa" strokeWidth="1"></path>
              </pattern>
            </defs>
            <rect fill="url(#hero-grid)" height="100%" width="100%"></rect>
          </svg>
        </div>

        {/* ── Floating blue glow orbs with parallax ── */}
        <div className="absolute top-1/4 left-[8%] w-56 h-56 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', ...getParallaxStyle(0.5) }} />
        <div className="absolute bottom-1/3 right-[10%] w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #1d4ed8, transparent)', ...getParallaxStyle(0.3) }} />
        <div className="absolute top-[60%] left-[45%] w-48 h-48 rounded-full blur-2xl opacity-25"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent)', ...getParallaxStyle(0.6) }} />

        {/* ── Floating particles ── */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-blue-300"
            style={{
              left: p.left,
              bottom: '-10px',
              width: p.size,
              height: p.size,
              opacity: 0,
              animation: `particleDrift ${p.duration} linear ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Floating badges — own layer above content so hover events work ── */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">

        {/* Roads & Potholes — top left */}
        <NavLink to="/report"
          className="float-card absolute top-[18%] left-[6%] hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl pointer-events-auto cursor-pointer group transition-all duration-300 hover:scale-110 hover:border-amber-300/60 hover:shadow-2xl"
          style={{ ...getParallaxStyle(0.55), textDecoration: 'none' }}
          onMouseEnter={e => { setHoveredBadge('roads'); e.currentTarget.style.background = 'rgba(251,191,36,0.18)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(251,191,36,0.35)'; }}
          onMouseLeave={e => { setHoveredBadge(null); e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = ''; }}
        >
          <span className="material-symbols-outlined text-amber-300 text-lg transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6" style={{ fontVariationSettings: "'FILL' 1" }}>construction</span>
          <div>
            <div className="text-[11px] font-bold text-white/90 group-hover:text-white transition-colors">Roads & Potholes</div>
            <div className="text-[9px] text-blue-200/70 group-hover:text-amber-200/80 font-semibold uppercase tracking-wider transition-colors">Dept. Active</div>
          </div>
          <span className="material-symbols-outlined text-amber-300/0 text-sm ml-0.5 group-hover:text-amber-300/80 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">arrow_forward</span>
        </NavLink>

        {/* Water Supply — top right */}
        <NavLink to="/report"
          className="float-card-2 absolute top-[22%] right-[6%] hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl pointer-events-auto cursor-pointer group transition-all duration-300 hover:scale-110 hover:border-emerald-300/60 hover:shadow-2xl"
          style={{ ...getParallaxStyle(0.45), textDecoration: 'none' }}
          onMouseEnter={e => { setHoveredBadge('water'); e.currentTarget.style.background = 'rgba(52,211,153,0.18)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(52,211,153,0.35)'; }}
          onMouseLeave={e => { setHoveredBadge(null); e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = ''; }}
        >
          <span className="material-symbols-outlined text-emerald-300 text-lg transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
          <div>
            <div className="text-[11px] font-bold text-white/90 group-hover:text-white transition-colors">Water Supply</div>
            <div className="text-[9px] text-blue-200/70 group-hover:text-emerald-200/80 font-semibold uppercase tracking-wider transition-colors">Monitoring</div>
          </div>
          <span className="material-symbols-outlined text-emerald-300/0 text-sm ml-0.5 group-hover:text-emerald-300/80 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">arrow_forward</span>
        </NavLink>

        {/* Street Lights — bottom right */}
        <NavLink to="/report"
          className="float-card-3 absolute bottom-[28%] right-[5%] hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl pointer-events-auto cursor-pointer group transition-all duration-300 hover:scale-110 hover:border-yellow-300/60 hover:shadow-2xl"
          style={{ ...getParallaxStyle(0.65), textDecoration: 'none' }}
          onMouseEnter={e => { setHoveredBadge('lights'); e.currentTarget.style.background = 'rgba(253,224,71,0.18)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(253,224,71,0.35)'; }}
          onMouseLeave={e => { setHoveredBadge(null); e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = ''; }}
        >
          <span className="material-symbols-outlined text-yellow-300 text-lg transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          <div>
            <div className="text-[11px] font-bold text-white/90 group-hover:text-white transition-colors">Street Lights</div>
            <div className="text-[9px] text-blue-200/70 group-hover:text-yellow-200/80 font-semibold uppercase tracking-wider transition-colors">12 Pending</div>
          </div>
          <span className="material-symbols-outlined text-yellow-300/0 text-sm ml-0.5 group-hover:text-yellow-300/80 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">arrow_forward</span>
        </NavLink>

        {/* Drainage — bottom left */}
        <NavLink to="/report"
          className="float-card absolute bottom-[30%] left-[5%] hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl pointer-events-auto cursor-pointer group transition-all duration-300 hover:scale-110 hover:border-cyan-300/60 hover:shadow-2xl"
          style={{ animationDelay: '-3s', ...getParallaxStyle(0.4), textDecoration: 'none' }}
          onMouseEnter={e => { setHoveredBadge('drainage'); e.currentTarget.style.background = 'rgba(103,232,249,0.18)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(103,232,249,0.35)'; }}
          onMouseLeave={e => { setHoveredBadge(null); e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = ''; }}
        >
          <span className="material-symbols-outlined text-cyan-300 text-lg transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" style={{ fontVariationSettings: "'FILL' 1" }}>water</span>
          <div>
            <div className="text-[11px] font-bold text-white/90 group-hover:text-white transition-colors">Drainage</div>
            <div className="text-[9px] text-blue-200/70 group-hover:text-cyan-200/80 font-semibold uppercase tracking-wider transition-colors">Resolved ✓</div>
          </div>
          <span className="material-symbols-outlined text-cyan-300/0 text-sm ml-0.5 group-hover:text-cyan-300/80 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100">arrow_forward</span>
        </NavLink>

        {/* ── Cinematic image popup ── */}
        {badge && (
          <div
            key={hoveredBadge}
            className="cinematic-popup absolute pointer-events-none hidden lg:block"
            style={{ ...badge.popupStyle, width: '340px', zIndex: 50 }}
          >
            {/* Outer glow ring */}
            <div className="absolute -inset-[3px] rounded-[22px] opacity-70 blur-sm pointer-events-none" style={{ background: `linear-gradient(135deg, ${badge.glow}, transparent 60%)` }} />

            <div className="relative rounded-[20px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.75)]" style={{ border: `1.5px solid ${badge.color}55` }}>
              {/* Neon top bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] z-10" style={{ background: `linear-gradient(90deg, transparent, ${badge.color}, transparent)` }} />

              {/* Cinematic image */}
              <div className="relative h-[200px] overflow-hidden">
                <img
                  src={badge.image}
                  alt={badge.label}
                  className="w-full h-full object-cover"
                  style={{ filter: 'saturate(1.15) contrast(1.05)' }}
                />
                {/* Cinematic letterbox bars */}
                <div className="absolute top-0 left-0 right-0 h-5 bg-black/60" />
                <div className="absolute bottom-0 left-0 right-0 h-5 bg-black/60" />
                {/* Gradient bottom fade */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
                {/* Department name over image */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base" style={{ color: badge.color, fontVariationSettings: "'FILL' 1" }}>{badge.icon}</span>
                  <span className="font-extrabold text-white text-[15px] tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", textShadow: `0 0 20px ${badge.glow}` }}>{badge.label}</span>
                </div>
              </div>

              {/* Info panel */}
              <div className="px-5 py-4" style={{ background: 'rgba(6,10,20,0.92)', backdropFilter: 'blur(24px)' }}>
                <p className="text-white/65 text-[12px] leading-relaxed mb-3">{badge.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: badge.color, boxShadow: `0 0 6px ${badge.color}` }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: badge.color }}>{badge.stat}</span>
                  </div>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Tap to report →</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const NonHomeBackground = () => {
  const cards = [
    { src: '/images/Sanitation/Sanitation.jpg',    label: 'Sanitation',    icon: 'delete',       pos: 'top-[8%]  right-[3%]',   rot: 'rotate-[8deg]',  size: 'w-60 h-44', delay: '0s',  neon: 'rgba(251,113,133,0.9)', neonShadow: 'rgba(251,113,133,0.5)' },
    { src: '/images/Roads/Roads.jpg',              label: 'Roads',         icon: 'construction', pos: 'bottom-[14%] left-[2%]', rot: '-rotate-[6deg]', size: 'w-56 h-40', delay: '-2s', neon: 'rgba(251,191,36,0.9)',  neonShadow: 'rgba(251,191,36,0.5)'  },
    { src: '/images/Drainage/Drainage.jpg',        label: 'Drainage',      icon: 'water',        pos: 'top-[40%] left-[2%]',    rot: 'rotate-[4deg]',  size: 'w-52 h-36', delay: '-4s', neon: 'rgba(103,232,249,0.9)', neonShadow: 'rgba(103,232,249,0.5)' },
    { src: '/images/StreetLights/StreetLights.jpg',label: 'Street Lights', icon: 'lightbulb',   pos: 'bottom-[8%]  right-[2%]', rot: '-rotate-[8deg]', size: 'w-56 h-40', delay: '-1s', neon: 'rgba(253,224,71,0.9)',  neonShadow: 'rgba(253,224,71,0.5)'  },
    { src: '/images/WaterSupply/WaterSupply.jpg',  label: 'Water Supply',  icon: 'water_drop',  pos: 'top-[16%] left-[3%]',    rot: '-rotate-[5deg]', size: 'w-48 h-36', delay: '-3s', neon: 'rgba(52,211,153,0.9)',  neonShadow: 'rgba(52,211,153,0.5)'  },
    { src: '/images/PublicParks/PublicParks.jpg',  label: 'Public Parks',  icon: 'park',        pos: 'top-[38%] right-[2%]',   rot: 'rotate-[6deg]',  size: 'w-48 h-36', delay: '-5s', neon: 'rgba(163,230,53,0.9)',  neonShadow: 'rgba(163,230,53,0.5)'  },
  ];

  return (
    <>
      {/* ── Static background layer ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* ── India street photo, lightly blurred for depth ── */}
        <div className="absolute inset-0">
          <img
            src="/images/india-road-issue_1.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'blur(2px) brightness(0.55) saturate(0.85)', transform: 'scale(1.06)' }}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg, rgba(240,246,255,0.72) 0%, rgba(255,255,255,0.65) 50%, rgba(232,242,255,0.72) 100%)'
          }} />
        </div>

        {/* ── Grid texture ── */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="48" id="route-grid" patternUnits="userSpaceOnUse" width="48">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1F345E" strokeWidth="0.9"></path>
              </pattern>
            </defs>
            <rect fill="url(#route-grid)" height="100%" width="100%"></rect>
          </svg>
        </div>

        {/* ── Soft colour glow blobs ── */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[100px] opacity-20" style={{ background: '#1d4ed8' }} />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15" style={{ background: '#0ea5e9' }} />
      </div>

      {/* ── Civic photo cards — own layer, pointer-events active, fully static ── */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`absolute ${c.pos} ${c.size} ${c.rot} rounded-2xl overflow-hidden shadow-2xl border-[3px] border-white/80 hidden ${i < 2 ? 'md:block' : 'lg:block'} pointer-events-auto cursor-pointer group`}
            style={{ opacity: 0.85, transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.35s ease, opacity 0.35s ease' }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.10) rotate(0deg)';
              e.currentTarget.style.boxShadow = `0 0 0 3px ${c.neon}, 0 0 30px ${c.neonShadow}, 0 0 60px ${c.neonShadow.replace('0.5','0.25')}`;
              e.currentTarget.style.borderColor = c.neon;
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
              e.currentTarget.style.opacity = '0.85';
            }}
          >
            <img alt={c.label} src={c.src} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {/* Neon overlay shimmer on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${c.neonShadow.replace('0.5','0.12')} 0%, transparent 60%)` }}
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 px-3 py-2.5">
              <span className="material-symbols-outlined text-white text-sm transition-all duration-300 group-hover:scale-110" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>{c.icon}</span>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{c.label}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const Home = ({ issues = [] }) => {
  const stats = {
    total: issues.length,
    resolved: issues.filter(i => i.status === 'Resolved' || i.status === 'Completed').length
  };

  const animatedTotal = useCountUp(stats.total);
  const animatedResolved = useCountUp(2400);
  const animatedActive = useCountUp(stats.total - stats.resolved);

  const formatNumber = (num) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
  };

  const tickerItems = [
    { icon: 'construction', label: 'Roads & Potholes' },
    { icon: 'water_drop', label: 'Water Supply' },
    { icon: 'lightbulb', label: 'Street Lights' },
    { icon: 'water', label: 'Drainage' },
    { icon: 'delete', label: 'Sanitation' },
    { icon: 'park', label: 'Public Parks' },
    { icon: 'construction', label: 'Roads & Potholes' },
    { icon: 'water_drop', label: 'Water Supply' },
    { icon: 'lightbulb', label: 'Street Lights' },
    { icon: 'water', label: 'Drainage' },
    { icon: 'delete', label: 'Sanitation' },
    { icon: 'park', label: 'Public Parks' },
  ];

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden py-16 md:py-24">

      {/* ── Hero Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-5xl mx-auto">

        {/* Live status badge */}
        <div className="hero-text-1 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-6 md:mb-8"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)' }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/80">Live Civic Platform</span>
          <span className="w-px h-3 bg-white/20"></span>
          <span className="text-[11px] font-semibold text-blue-300">System Active</span>
        </div>

        {/* Main headline */}
        <h1 className="hero-text-2 font-extrabold leading-[1.0] mb-4 md:mb-6 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <span className="block text-[46px] md:text-[68px] lg:text-[90px] text-white drop-shadow-2xl">
            Citizen
          </span>
          <span className="block text-[46px] md:text-[68px] lg:text-[90px]"
            style={{ background: 'linear-gradient(90deg, #60a5fa, #93c5fd, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Resolver System
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-text-3 text-[15px] md:text-[18px] text-white/60 max-w-xl mx-auto mb-10 md:mb-12 leading-relaxed font-medium">
          Bridging citizens and administration with real-time transparency, smart assignment, and verifiable resolution tracking.
        </p>

        {/* CTA Buttons */}
        <div className="hero-text-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-16 w-full">
          <RippleButton
            to="/report"
            className="btn-primary-shimmer relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 rounded-full font-bold text-[14px] uppercase tracking-wider text-white active:scale-95 transition-transform duration-150"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 60%, #60a5fa 100%)', border: '1px solid rgba(96,165,250,0.5)' }}
          >
            <span className="material-symbols-outlined text-lg relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            <span className="relative z-10">Report an Issue</span>
            <span className="arrow-icon material-symbols-outlined text-base relative z-10">arrow_forward</span>
          </RippleButton>

          <RippleButton
            to="/public-issues"
            className="btn-ghost-shimmer relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 rounded-full font-bold text-[14px] uppercase tracking-wider text-white/90 active:scale-95 transition-all duration-200 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(16px)' }}
          >
            <span className="material-symbols-outlined text-lg relative z-10">public</span>
            <span className="relative z-10">Public Board</span>
          </RippleButton>
        </div>

        {/* Stats Row */}
        <div className="hero-text-5 w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch px-0 md:px-4">
          {/* Solved */}
          <div className="group relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-default order-2 md:order-1"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Solved Cases</span>
              <span className="material-symbols-outlined text-emerald-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="text-[42px] md:text-[52px] font-extrabold text-white leading-none">{formatNumber(animatedResolved)}</div>
            <div className="mt-3 h-0.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full bg-emerald-400 rounded-full group-hover:w-full transition-all duration-1000" style={{ width: '72%' }}></div>
            </div>
          </div>

          {/* Total — center, featured */}
          <div className="group relative overflow-hidden rounded-2xl p-7 flex flex-col justify-between transition-all hover:scale-[1.03] cursor-default order-1 md:order-2"
            style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.6), rgba(59,130,246,0.4))', border: '1px solid rgba(96,165,250,0.35)', backdropFilter: 'blur(16px)', boxShadow: '0 0 40px rgba(59,130,246,0.2)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/60">Total Reports</span>
              <span className="material-symbols-outlined text-blue-300 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
            </div>
            <div className="text-[56px] md:text-[68px] font-extrabold text-white leading-none">{animatedTotal}</div>
            <div className="flex gap-1.5 mt-3">
              {[40, 60, 50, 80, 65, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-blue-300/30 group-hover:bg-blue-300/50 transition-all duration-300"
                  style={{ height: `${h * 0.28}px`, alignSelf: 'flex-end', transitionDelay: `${i * 40}ms` }}></div>
              ))}
            </div>
          </div>

          {/* Active */}
          <div className="group relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-default order-3 md:order-3"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Active Tasks</span>
              <span className="material-symbols-outlined text-amber-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            </div>
            <div className="text-[42px] md:text-[52px] font-extrabold text-white leading-none">{animatedActive}</div>
            <div className="mt-3 flex gap-1">
              {[1,2,3,4,5,6,7,8].map((_, i) => (
                <span key={i} className={`flex-1 h-1.5 rounded-full ${i < 5 ? 'bg-amber-400' : 'bg-white/10'}`}></span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Department Quick Access Grid ── */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-24 mt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35 text-center mb-4">Report by Category</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: 'construction',  label: 'Roads',        sub: 'Potholes',    color: 'text-amber-300',  hoverBg: 'rgba(251,191,36,0.15)',  hoverBorder: 'rgba(251,191,36,0.45)',  hoverShadow: 'rgba(251,191,36,0.3)'  },
            { icon: 'water_drop',    label: 'Water Supply', sub: 'Leaks',       color: 'text-emerald-300',hoverBg: 'rgba(52,211,153,0.15)',   hoverBorder: 'rgba(52,211,153,0.45)',  hoverShadow: 'rgba(52,211,153,0.3)'  },
            { icon: 'lightbulb',     label: 'Lights',       sub: 'Street',      color: 'text-yellow-300', hoverBg: 'rgba(253,224,71,0.15)',   hoverBorder: 'rgba(253,224,71,0.45)',  hoverShadow: 'rgba(253,224,71,0.3)'  },
            { icon: 'water',         label: 'Drainage',     sub: 'Flooding',    color: 'text-cyan-300',   hoverBg: 'rgba(103,232,249,0.15)',  hoverBorder: 'rgba(103,232,249,0.45)', hoverShadow: 'rgba(103,232,249,0.3)' },
            { icon: 'delete',        label: 'Sanitation',   sub: 'Waste',       color: 'text-rose-300',   hoverBg: 'rgba(253,164,175,0.15)',  hoverBorder: 'rgba(253,164,175,0.45)', hoverShadow: 'rgba(253,164,175,0.3)' },
            { icon: 'park',          label: 'Parks',        sub: 'Public',      color: 'text-lime-300',   hoverBg: 'rgba(163,230,53,0.15)',   hoverBorder: 'rgba(163,230,53,0.45)',  hoverShadow: 'rgba(163,230,53,0.3)'  },
          ].map((dept) => (
            <NavLink
              key={dept.label}
              to="/report"
              className="dept-quick-card group relative flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-300 hover:scale-[1.08] active:scale-95 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = dept.hoverBg;
                e.currentTarget.style.borderColor = dept.hoverBorder;
                e.currentTarget.style.boxShadow = `0 8px 32px ${dept.hoverShadow}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className={`material-symbols-outlined ${dept.color} text-2xl transition-all duration-300 group-hover:scale-125 group-hover:-translate-y-0.5 group-hover:drop-shadow-lg`} style={{ fontVariationSettings: "'FILL' 1" }}>{dept.icon}</span>
              <div className="text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/80 group-hover:text-white transition-colors leading-tight">{dept.label}</div>
                <div className="text-[8px] text-white/35 group-hover:text-white/60 transition-colors uppercase tracking-wider font-semibold mt-0.5">{dept.sub}</div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── Issue Category Ticker ── */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden py-3"
        style={{ background: 'rgba(0,0,0,0.35)', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
        <div className="ticker-track flex items-center gap-0" style={{ width: 'max-content' }}>
          {tickerItems.map((item, i) => (
            <NavLink key={i} to="/report" className="flex items-center gap-2 px-6 shrink-0 group cursor-pointer transition-all duration-200 hover:opacity-100">
              <span className="material-symbols-outlined text-blue-300/70 text-sm group-hover:text-blue-300 transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 group-hover:text-white/80 transition-colors">{item.label}</span>
              <span className="mx-3 text-white/10">·</span>
            </NavLink>
          ))}
        </div>
      </div>

    </div>
  );
};

const ReportIssue = ({ areas = [], departments = [], currentUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Normal",
    department: "",
    area: "",
    city: currentUser?.city || "",
    block: currentUser?.block || "",
    imageUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageMode, setImageMode] = useState('url');
  const [uploadLoading, setUploadLoading] = useState(false);
  const aiTimerRef = useRef(null);
  const departmentImages = {
    "Roads": "/images/Roads/Roads.jpg",
    "Sanitation": "/images/Sanitation/Sanitation.jpg",
    "Street Lights": "/images/StreetLights/StreetLights.jpg",
    "Water Supply": "/images/WaterSupply/WaterSupply.jpg",
    "Drainage": "/images/Drainage/Drainage.jpg",
    "Public Parks": "/images/PublicParks/PublicParks.jpg"
  };

  const getDepartmentImageUrl = (department, title, description) => {
    // Use getRelevantImage to pick a deterministic image from the department pool
    if (!department) return "";
    const text = `${title} ${description}`.toLowerCase();
    if (department === "Roads" && text.includes("pothole")) return "/images/Roads/Potholes.jpg";
    return getRelevantImage(title || "", description || "", department, `preview:${department}:${title}:${description}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'city') {
        newData.block = "";
        newData.area = "";
      } else if (name === 'block') {
        newData.area = "";
      }
      if (name === 'department' || name === 'title' || name === 'description') {
        const autoImage = getDepartmentImageUrl(newData.department, newData.title, newData.description);
        if (autoImage) {
          newData.imageUrl = autoImage;
        } else if (`${newData.title} ${newData.description}`.toLowerCase().includes("pothole")) {
          newData.imageUrl = "/images/Roads/Potholes.jpg";
        }
      }
      return newData;
    });
    if (name === 'title' || name === 'description') {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = setTimeout(async () => {
        const t = name === 'title' ? value : formData.title;
        const d = name === 'description' ? value : formData.description;
        if ((t + d).trim().length > 8) {
          setAiLoading(true);
          try { const result = await api.classifyIssue(t, d); setAiSuggestion(result); } catch {}
          setAiLoading(false);
        }
      }, 700);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createIssue({ ...formData, lat: gpsCoords?.lat, lng: gpsCoords?.lng });
      setSubmitted(true);
      window.dispatchEvent(new Event("portal-state-change"));
    } catch (err) {
      alert(err.message || "Failed to report issue");
    } finally {
      setLoading(false);
    }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) { alert('Geolocation is not supported by your browser.'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsCoords({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }); setGpsLoading(false); },
      (err) => { alert('Unable to get location: ' + err.message); setGpsLoading(false); },
      { timeout: 10000 }
    );
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      const { url } = await api.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-[#213D76] text-white rounded-full flex items-center justify-center mb-8 shadow-lg shadow-[#213D76]/20">
          <span className="material-symbols-outlined text-5xl">check</span>
        </div>
        <h2 className="text-display-lg text-[#161d1a] dark:text-[#E0EDF8] mb-4">Report Submitted!</h2>
        <p className="text-body-lg text-[#1F345E] dark:text-[#7E8AA9] max-w-md mx-auto mb-10 opacity-70">
          Your case has been recorded. Our team will review and assign it to the appropriate department shortly.
        </p>
        <div className="flex gap-4">
          <button onClick={() => setSubmitted(false)} className="bg-[#E0EDF8] dark:bg-[#2a322e] text-[#1F345E] px-10 py-4 rounded-full font-label-bold hover:bg-[#213D76] hover:text-white transition-all">
            Submit Another
          </button>
          <button onClick={() => navigate('/my-issues')} className="bg-[#1F345E] text-white px-10 py-4 rounded-full font-label-bold hover:shadow-lg transition-all">
            View My Issues
          </button>
        </div>
      </div>
    );
  }

  const locationData = {
    "Bengaluru": {
      "North Bengaluru": ["Hebbal", "Yelahanka", "RT Nagar", "Sadahalli", "Jakkur"],
      "South Bengaluru": ["Jayanagar", "JP Nagar", "BTM Layout", "Banashankari", "Hulimavu"],
      "East Bengaluru": ["Whitefield", "Indiranagar", "Marathahalli", "KR Puram", "Domlur"],
      "West Bengaluru": ["Rajajinagar", "Vijayanagar", "Malleshwaram", "Magadi Road", "Yeshwanthpur"],
      "Central Bengaluru": ["MG Road", "Brigade Road", "Shivajinagar", "Cubbon Park", "Ulsoor"]
    },
    "Mysore": {
      "North Mysore": ["Hebbal", "Hootagalli", "Bogadi", "Vijayanagar 1st Stage", "Srirampura"],
      "South Mysore": ["Yadavagiri", "Kuvempunagar", "JP Nagar", "Chamundipuram", "Rajendranagar"],
      "East Mysore": ["Jayalakshmipuram", "Vidyaranyapuram", "Saraswathipuram", "Ramakrishnanagar", "Lakshmipuram"],
      "West Mysore": ["Hebbal Industrial Area", "Nanjangud Road", "Bannimantap", "Metagalli", "Ashokapuram"],
      "Central Mysore": ["Devaraja", "Nazarbad", "Krishnamurthypuram", "Gokulam", "Vontikoppal"]
    },
    "Mumbai": {
      "South Mumbai": ["Colaba", "Malabar Hill", "Worli", "Churchgate", "Nariman Point"],
      "Western Suburbs": ["Andheri", "Bandra", "Borivali", "Goregaon", "Malad", "Kandivali"],
      "Eastern Suburbs": ["Powai", "Ghatkopar", "Mulund", "Vikhroli", "Kurla", "Chembur"],
      "Navi Mumbai": ["Vashi", "Nerul", "Belapur", "Kharghar", "Panvel"]
    },
    "Delhi": {
      "North Delhi": ["Civil Lines", "Rohini", "Model Town", "Pitampura", "Burari"],
      "South Delhi": ["Saket", "Hauz Khas", "Greater Kailash", "Vasant Kunj", "Mehrauli"],
      "East Delhi": ["Laxmi Nagar", "Mayur Vihar", "Preet Vihar", "Vivek Vihar", "Shahdara"],
      "West Delhi": ["Dwarka", "Janakpuri", "Punjabi Bagh", "Tilak Nagar", "Palam"],
      "Central Delhi": ["Connaught Place", "Karol Bagh", "Paharganj", "Daryaganj", "Chandni Chowk"]
    },
    "Hyderabad": {
      "Secunderabad": ["Trimulgherry", "Marredpally", "Begumpet", "Bowenpally", "Karkhana"],
      "Cyberabad": ["Gachibowli", "Madhapur", "Kondapur", "Hitech City", "Nanakramguda"],
      "Old City": ["Charminar", "Falaknuma", "Mehdipatnam", "Malakpet", "Santoshnagar"],
      "East Hyderabad": ["LB Nagar", "Uppal", "Nacharam", "Hayathnagar", "Vanasthalipuram"]
    },
    "Chennai": {
      "North Chennai": ["Tondiarpet", "Perambur", "Kolathur", "Villivakkam", "Sembiam"],
      "South Chennai": ["Adyar", "Velachery", "Sholinganallur", "Perungudi", "Thoraipakkam"],
      "Central Chennai": ["T. Nagar", "Nungambakkam", "Anna Nagar", "Kilpauk", "Egmore"],
      "West Chennai": ["Porur", "Valasaravakkam", "Ramapuram", "Virugambakkam", "Ashok Nagar"]
    },
    "Pune": {
      "Central Pune": ["Shivajinagar", "Deccan", "FC Road", "Camp", "Koregaon Park"],
      "East Pune": ["Viman Nagar", "Kalyani Nagar", "Kharadi", "Hadapsar", "Magarpatta"],
      "West Pune": ["Baner", "Balewadi", "Aundh", "Wakad", "Pimple Saudagar"],
      "South Pune": ["Katraj", "Kondhwa", "Bibwewadi", "Sinhagad Road", "Dhayari"]
    }
  };

  const cities = Object.keys(locationData);
  const blocks = formData.city ? Object.keys(locationData[formData.city] || {}) : [];
  const areasList = (formData.city && formData.block) ? (locationData[formData.city][formData.block] || []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 w-full items-start animate-fade-in-up">
      {/* Form Section */}
      <section className="lg:col-span-7 bg-white/95 dark:bg-[#161d1a]/95 backdrop-blur-md rounded-[2.5rem] p-4 sm:p-6 md:p-8 md:p-12 shadow-premium border border-white/50 dark:border-white/10">
        <div className="mb-8">
          <span className="text-[#1F345E] font-label-bold text-[12px] uppercase tracking-widest mb-1 block">Citizen Reporting</span>
          <h1 className="font-display-lg text-[32px] md:text-[40px] text-[#161d1a] dark:text-[#E0EDF8]">New Case Record</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide px-1">City</label>
              <div className="relative">
                <select 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] text-[#161d1a] dark:text-[#E0EDF8] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#1F345E] text-body-md pr-12"
                >
                  <option value="">Select city</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] dark:text-[#E0EDF8] brightness-200">expand_more</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide px-1">Block</label>
              <div className="relative">
                <select 
                  name="block"
                  value={formData.block}
                  onChange={handleChange}
                  required
                  disabled={!formData.city}
                  className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#1F345E] text-body-md pr-12 disabled:opacity-50"
                >
                  <option value="">Select block</option>
                  {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] dark:text-[#E0EDF8]">expand_more</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide px-1">Area</label>
              <div className="relative">
                <select 
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  disabled={!formData.block}
                  className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#1F345E] text-body-md pr-12 disabled:opacity-50"
                >
                  <option value="">Select area</option>
                  {areasList.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] dark:text-[#E0EDF8]">expand_more</span>
              </div>
            </div>
          </div>

          {/* GPS Location */}
          <div className="flex items-center gap-3 p-3 bg-[#E0EDF8]/60 dark:bg-[#2a322e]/60 rounded-2xl border border-[#7E8AA9]/20">
            <button type="button" onClick={handleGetGPS} disabled={gpsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#213D76] text-white rounded-xl text-[12px] font-bold hover:bg-[#1F345E] transition-all disabled:opacity-50 flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">my_location</span>
              {gpsLoading ? 'Locating...' : 'GPS Location'}
            </button>
            {gpsCoords ? (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">📍 {gpsCoords.lat}, {gpsCoords.lng}</span>
            ) : (
              <span className="text-[11px] text-[#7E8AA9]">Optional — tags your report with GPS coordinates</span>
            )}
            {gpsCoords && (
              <button type="button" onClick={() => setGpsCoords(null)} className="ml-auto text-[#7E8AA9] hover:text-red-500">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Issue Title */}
          <div className="space-y-1">
            <label className="font-label-bold text-[12px] text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide px-1">Issue Title</label>
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#1F345E] text-body-md placeholder:text-[#7E8AA9] transition-all"
              placeholder="e.g. Major pothole on Sector 4 main road"
            />
          </div>

          {/* Priority & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide px-1">Priority Level</label>
              <div className="relative">
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#1F345E] text-body-md pr-12"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] dark:text-[#E0EDF8]">expand_more</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide px-1">Department</label>
              <div className="relative">
                <select 
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#1F345E] text-body-md pr-12"
                >
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id || d._id} value={d.name}>{d.name}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] dark:text-[#E0EDF8]">expand_more</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-label-bold text-[12px] text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide px-1">Description of Problem</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#1F345E] text-body-md placeholder:text-[#7E8AA9] resize-none transition-all"
              placeholder="Please provide specific landmarks and severity details..."
            ></textarea>
          </div>

          {/* AI Classification Suggestion */}
          {(aiSuggestion?.department || aiLoading) && (
            <div className="flex items-start gap-3 p-4 bg-[#213D76]/5 dark:bg-[#213D76]/15 rounded-2xl border border-[#213D76]/20">
              <span className="material-symbols-outlined text-[#213D76] dark:text-[#9DB4E6] text-xl mt-0.5">smart_toy</span>
              <div className="flex-1">
                {aiLoading ? (
                  <span className="text-[12px] text-[#7E8AA9] animate-pulse">Analyzing issue...</span>
                ) : (
                  <>
                    <p className="text-[12px] font-bold text-[#1F345E] dark:text-[#9DB4E6]">
                      AI Suggestion — <span className="text-[#213D76]">{aiSuggestion.confidence}% match</span>
                    </p>
                    <p className="text-[11px] text-[#7E8AA9] mt-0.5">
                      Dept: <b className="text-[#161d1a] dark:text-[#E0EDF8]">{aiSuggestion.department}</b>
                      {aiSuggestion.priority !== 'Normal' && <> · Priority: <b className="text-orange-600">{aiSuggestion.priority}</b></>}
                    </p>
                    <button type="button"
                      onClick={() => setFormData(prev => ({ ...prev, department: aiSuggestion.department || prev.department, priority: aiSuggestion.priority || prev.priority }))}
                      className="mt-2 text-[11px] font-bold text-[#213D76] dark:text-[#9DB4E6] underline">
                      Apply suggestion
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Visual Evidence */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <label className="font-label-bold text-[12px] text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide">Visual Evidence</label>
              <div className="flex gap-1 bg-[#E0EDF8] dark:bg-[#2a322e] rounded-xl p-1">
                <button type="button" onClick={() => setImageMode('url')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${imageMode === 'url' ? 'bg-white dark:bg-[#161d1a] text-[#1F345E] shadow-sm' : 'text-[#7E8AA9]'}`}>
                  URL
                </button>
                <button type="button" onClick={() => setImageMode('upload')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${imageMode === 'upload' ? 'bg-white dark:bg-[#161d1a] text-[#1F345E] shadow-sm' : 'text-[#7E8AA9]'}`}>
                  Upload
                </button>
              </div>
            </div>
            {imageMode === 'url' ? (
              <div className="relative">
                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                  className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#1F345E] text-body-md pr-12"
                  placeholder="https://image-url.com/photo.jpg" />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#7E8AA9]">link</span>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 p-6 bg-[#E0EDF8] dark:bg-[#2a322e] rounded-2xl cursor-pointer hover:bg-[#D0E0F0] transition-all border-2 border-dashed border-[#7E8AA9]/40">
                <span className="material-symbols-outlined text-[#1F345E] text-3xl">upload_file</span>
                <span className="text-[12px] font-semibold text-[#7E8AA9]">
                  {uploadLoading ? 'Uploading...' : (formData.imageUrl.startsWith('/uploads/') ? '✅ Image uploaded' : 'Click to upload image (max 10MB)')}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadLoading} />
              </label>
            )}
          </div>

          <div className="pt-6 border-t border-[#7E8AA9]/30 dark:border-white/10 flex flex-col sm:flex-row justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-full border border-[#7E8AA9] text-[#1F345E] dark:text-[#7E8AA9] font-label-bold hover:bg-[#E0EDF8] transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-4 rounded-full bg-[#213D76] text-[#E0EDF8] font-label-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Report"}
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </form>
      </section>

      {/* Preview Section */}
      <aside className="lg:col-span-5 flex flex-col gap-8 h-full lg:max-h-[calc(100vh-120px)] lg:sticky lg:top-28">
        <div className="bg-[#E0EDF8] dark:bg-[#2a322e]/80 backdrop-blur-md rounded-[2.5rem] p-4 sm:p-6 md:p-8 md:p-10 border border-white shadow-premium flex flex-col h-full">
          <div className="mb-6 flex justify-between items-center">
            <span className="text-[#1F345E] dark:text-[#7E8AA9] font-label-bold text-[12px] uppercase tracking-widest">Case Preview</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#1F345E]/20"></div>
              <div className="w-2 h-2 rounded-full bg-[#1F345E]"></div>
              <div className="w-2 h-2 rounded-full bg-[#1F345E]/20"></div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-white dark:bg-[#161d1a] rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col flex-grow">
            <div className="relative h-48 w-full bg-[#E0EDF8] dark:bg-[#2a322e] flex items-center justify-center overflow-hidden">
              {formData.imageUrl ? (
                <img className="w-full h-full object-cover" src={formData.imageUrl} alt="Preview" />
              ) : (
                <div className="flex flex-col items-center text-[#7E8AA9]">
                  <span className="material-symbols-outlined text-6xl">image</span>
                  <span className="text-[10px] uppercase font-bold mt-2">No Image Provided</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className={`backdrop-blur-md text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest ${
                  formData.priority === 'Urgent' ? 'bg-error/90' : formData.priority === 'High' ? 'bg-orange-500/90' : 'bg-[#213D76]/90'
                }`}>
                  {formData.priority}
                </span>
              </div>
            </div>
            <div className="p-4 sm:p-6 md:p-8 space-y-4 flex-grow flex flex-col">
              <h3 className="font-display-lg text-xl sm:text-2xl text-[#161d1a] dark:text-[#E0EDF8] leading-tight line-clamp-2">
                {formData.title || "Report title will appear here"}
              </h3>
              <p className="text-[#1F345E] dark:text-[#7E8AA9] text-sm leading-relaxed line-clamp-4 opacity-70 flex-grow">
                {formData.description || "Enter details to see how your report will look to the administration."}
              </p>
              <div className="pt-6 border-t border-[#7E8AA9]/20 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E0EDF8] dark:bg-[#2a322e] flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg text-[#1F345E]">location_on</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#7E8AA9] dark:text-[#7E8AA9] uppercase tracking-wider">
                    {formData.city || "Location Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#213D76] animate-pulse"></span>
                  <span className="text-[10px] font-bold text-[#213D76] uppercase tracking-wider text-right">Draft</span>
                </div>
              </div>
            </div>
          </div>

{/* Tip */}
           <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white/40 rounded-2xl border border-dashed border-[#7E8AA9] flex items-start gap-3 sm:gap-4">
             <span className="material-symbols-outlined text-[#1F345E] text-xl sm:text-2xl">lightbulb</span>
             <p className="text-[11px] sm:text-[13px] text-[#1F345E] dark:text-[#7E8AA9] leading-relaxed">
               Adding a clear photo and precise location helps local authorities resolve your issue up to <b className="text-[#1F345E]">40% faster</b>.
             </p>
           </div>
         </div>
       </aside>
     </div>
   );
};

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'citizen', phone: ''
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup' && form.password !== form.confirmPassword) {
      alert('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await api.login({ email: form.email, password: form.password, role: form.role });
      } else {
        await api.signup({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
      }
    } catch (err) {
      alert(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-2xl px-4 py-3.5 text-[14px] text-[#161d1a] dark:text-[#E0EDF8] placeholder:text-[#7E8AA9] focus:ring-2 focus:ring-[#1F345E] transition-all outline-none";
  const labelClass = "block text-[11px] font-bold text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wider mb-1.5 px-1";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white/95 dark:bg-[#161d1a]/95 backdrop-blur-md rounded-[2.5rem] shadow-premium border border-white/60 overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* Left Branding Panel */}
        <div className="bg-[#1F345E] p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden hidden lg:flex">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5"></div>
          <div className="absolute bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5"></div>
          <div className="absolute top-1/2 right-4 w-24 h-24 rounded-full bg-[#213D76]/20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-[#213D76] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
              </div>
              <div>
                <p className="text-white font-extrabold text-lg leading-none">CivicResolve</p>
                <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Official Civic Platform</p>
              </div>
            </div>

            <h2 className="text-white font-display-lg text-[36px] leading-tight font-extrabold mb-4">
              Empowering<br/>Communities<br/><span className="text-[#213D76]">Together.</span>
            </h2>
            <p className="text-white/70 text-[14px] leading-relaxed">
              Report civic issues, track resolutions, and hold authorities accountable — all in one place.
            </p>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-10">
            {[
              { value: '2.4k+', label: 'Issues Resolved' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '7', label: 'Departments' },
              { value: '24h', label: 'Avg. Response' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-[#213D76] font-extrabold text-[22px] leading-none">{s.value}</p>
                <p className="text-white/60 text-[10px] uppercase tracking-wide font-bold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          {/* Logo for mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#1F345E] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
            </div>
            <span className="font-extrabold text-[#1F345E]">CivicResolve</span>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-[#E0EDF8] dark:bg-[#2a322e] rounded-2xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${mode === 'login' ? 'bg-white dark:bg-[#161d1a] text-[#1F345E] shadow-sm' : 'text-[#7E8AA9] dark:text-[#7E8AA9] hover:text-[#1F345E]'}`}
            >Sign In</button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${mode === 'signup' ? 'bg-white dark:bg-[#161d1a] text-[#1F345E] shadow-sm' : 'text-[#7E8AA9] dark:text-[#7E8AA9] hover:text-[#1F345E]'}`}
            >Create Account</button>
          </div>

          <div className="mb-6">
            <h3 className="font-display-lg text-[26px] text-[#161d1a] dark:text-[#E0EDF8] font-extrabold">
              {mode === 'login' ? 'Welcome back' : 'Join the platform'}
            </h3>
            <p className="text-[#7E8AA9] dark:text-[#7E8AA9] text-[13px] mt-1">
              {mode === 'login' ? 'Sign in to your account to continue.' : 'Create your account to start reporting issues.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className={labelClass}>Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['citizen', 'admin'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: r }))}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-[13px] font-bold transition-all ${
                      form.role === r
                        ? 'border-[#1F345E] bg-[#E0EDF8] dark:bg-[#2a322e] text-[#1F345E]'
                        : 'border-[#e0ebe3] text-[#7E8AA9] dark:text-[#7E8AA9] hover:border-[#1F345E]/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: `'FILL' ${form.role === r ? 1 : 0}` }}>
                      {r === 'citizen' ? 'person' : 'admin_panel_settings'}
                    </span>
                    {r === 'citizen' ? 'Citizen' : 'Administrator'}
                  </button>
                ))}
              </div>
            </div>

            {/* Name — signup only */}
            {mode === 'signup' && (
              <div>
                <label className={labelClass}>Full Name</label>
                <input name="name" type="text" value={form.name} onChange={handleChange} required
                  className={inputClass} placeholder="John Doe" />
              </div>
            )}

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className={inputClass} placeholder="your@email.com" />
            </div>

            {/* Phone — signup only */}
            {mode === 'signup' && (
              <div>
                <label className={labelClass}>Phone Number <span className="text-[#7E8AA9] normal-case font-normal">(optional)</span></label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  className={inputClass} placeholder="+91 98765 43210" />
              </div>
            )}

            {/* Password */}
            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} required className={`${inputClass} pr-12`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7E8AA9] hover:text-[#1F345E] transition-colors">
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password — signup only */}
            {mode === 'signup' && (
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={handleChange} required className={inputClass} placeholder="••••••••" />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F345E] hover:bg-[#005040] text-white py-4 rounded-2xl font-bold text-[14px] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'}<span className="material-symbols-outlined text-lg">arrow_forward</span></>
              )}
            </button>

            <p className="text-center text-[12px] text-[#7E8AA9] dark:text-[#7E8AA9] pt-2">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[#1F345E] font-bold hover:underline">
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
// Render decorative background only when on Home route (uses hooks correctly inside component)
function BackgroundController() {
  const location = useLocation();
  return (
    location.pathname === '/' ? <ParallaxBackground /> : <NonHomeBackground />
  );
}

export default function App() {
  const [portalState, setPortalState] = useState({
    issues: [],
    areas: [],
    departments: [],
    labour: [],
    notifications: [],
    currentUser: null,
    loading: true,
    error: null
  });

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [authView, setAuthView] = useState(window.location.pathname === '/' ? 'landing' : 'login');

  useEffect(() => {
    const fetchState = async () => {
      try {
        const data = await api.getState();
        // Multi-level sort: Priority (Urgent > High > Normal) then Date (Latest First)
        const priorityMap = { 'Urgent': 3, 'High': 2, 'Normal': 1 };
        const sortedIssues = (data.issues || []).sort((a, b) => {
          const priorityDiff = (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setPortalState({ ...data, issues: sortedIssues, loading: false, error: null });
        setIsAddingAccount(false);
      } catch (err) {
        setPortalState(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };

    const handleAddAccount = () => setIsAddingAccount(true);

    fetchState();
    window.addEventListener("portal-state-change", fetchState);
    window.addEventListener("trigger-add-account", handleAddAccount);
    
    return () => {
      window.removeEventListener("portal-state-change", fetchState);
      window.removeEventListener("trigger-add-account", handleAddAccount);
    };
  }, []);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("citizen-user") || "null");
    if (!currentUser?.id) return;
    const socket = io({ query: { userId: currentUser.id } });
    socket.on("notification", () => {
      window.dispatchEvent(new Event("portal-state-change"));
    });
    return () => socket.disconnect();
  }, [portalState.currentUser?.id]);

  if (portalState.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-label-bold animate-pulse">Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (portalState.error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9F7F2] p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#161d1a] rounded-[2.5rem] shadow-premium p-10 text-center border border-error/10">
          <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">cloud_off</span>
          </div>
          <h2 className="text-headline-md font-display-lg text-on-surface mb-2">Connection Failed</h2>
          <p className="text-on-surface-variant mb-8 font-body-md">We couldn't connect to the civic infrastructure network. Please check your internet or try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white py-4 rounded-full font-label-bold shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    api.logout();
  };

  return (
    <Router>
      <style>{globalStyles}</style>
      <div className="font-body-md text-on-surface bg-[#F9F7F2] dark:bg-[#0f1410] dark:text-[#E0EDF8] min-h-screen flex flex-col">
        <Header currentUser={portalState.currentUser} onLogout={handleLogout} notifications={portalState.notifications} />

        <main className="relative flex-1 pt-24 md:pt-32 pb-24 w-full overflow-x-hidden">
          {/* BackgroundController renders decorative background only on Home route */}
          <BackgroundController />

          {!portalState.currentUser || isAddingAccount ? (
            <div className="relative z-20">
              {isAddingAccount && (
                <div className="max-w-container-max mx-auto px-margin-desktop">
                  <button 
                    onClick={() => setIsAddingAccount(false)}
                    className="flex items-center gap-2 text-[#1F345E] dark:text-[#7E8AA9] hover:text-[#1F345E] font-bold text-sm transition-colors mb-4"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Dashboard
                  </button>
                </div>
              )}
              {authView === 'landing' ? (
                <LandingPage onGetStarted={(mode) => setAuthView(mode)} />
              ) : (
                <div className="max-w-container-max mx-auto px-margin-desktop">
                  <button
                    onClick={() => setAuthView('landing')}
                    className="flex items-center gap-2 text-[#1F345E] dark:text-[#7E8AA9] hover:text-[#1F345E] font-bold text-sm transition-colors mb-4"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back
                  </button>
                  <Login />
                </div>
              )}
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home issues={portalState.issues} />} />
              <Route 
                path="/report" 
                element={
                  <div className="max-w-container-max mx-auto px-margin-desktop">
                    <ReportIssue 
                      areas={portalState.areas} 
                      departments={portalState.departments} 
                      currentUser={portalState.currentUser} 
                    />
                  </div>
                } 
              />
              <Route 
                path="/my-issues" 
                element={
                  <div className="max-w-container-max mx-auto px-margin-desktop">
                    <MyIssues 
                      issues={portalState.issues} 
                      currentUser={portalState.currentUser} 
                      onOpenIssue={setSelectedIssue}
                    />
                  </div>
                } 
              />
              <Route 
                path="/public-issues" 
                element={
                  <div className="max-w-container-max mx-auto px-margin-desktop">
                    <PublicIssues 
                      issues={portalState.issues} 
                      onOpenIssue={setSelectedIssue}
                    />
                  </div>
                } 
              />
              <Route path="/report-bug" element={
                <div className="max-w-container-max mx-auto px-margin-desktop">
                  <ReportBug />
                </div>
              } />
              {portalState.currentUser?.role === 'admin' && (
                <Route path="/admin" element={
                  <div className="max-w-container-max mx-auto px-margin-desktop">
                    <AdminDashboard
                      issues={portalState.issues}
                      departments={portalState.departments}
                      labour={portalState.labour}
                      notifications={portalState.notifications}
                      dashboardStats={portalState.dashboardStats}
                      currentUser={portalState.currentUser}
                    />
                  </div>
                } />
              )}
              {portalState.currentUser?.role === 'admin' && (
                <Route path="/analytics" element={
                  <div className="max-w-container-max mx-auto px-margin-desktop">
                    <AnalyticsDashboard />
                  </div>
                } />
              )}
            </Routes>
          )}
        </main>

        <Footer onLogout={handleLogout} />

        <IssueModal 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
        />
      </div>
    </Router>
  );
}



const PublicIssues = ({ issues, onOpenIssue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredIssues = issues.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
        <div>
          <h2 className="text-headline-lg font-display-lg text-on-surface tracking-tighter">Public Issues</h2>
          <p className="text-body-md text-on-surface-variant">Browse issues reported by the community in your area.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            type="text" 
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#161d1a] border border-outline-variant/30 rounded-full py-3 pl-12 pr-6 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {filteredIssues.length > 0 ? (
          filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onOpen={onOpenIssue} />
          ))
        ) : (
          <div className="col-span-full relative overflow-hidden rounded-[2rem] border border-[#E0EDF8] dark:border-white/10">
            <div className="absolute inset-0 grid grid-cols-4">
              {['/images/Roads/Roads.jpg', '/images/Sanitation/Sanitation.jpg', '/images/Drainage/Drainage.jpg', '/images/PublicParks/PublicParks.jpg'].map((src, i) => (
                <img key={i} src={src} alt="" className="w-full h-full object-cover opacity-15 dark:opacity-10" style={{ filter: 'saturate(0.4)' }} />
              ))}
            </div>
            <div className="absolute inset-0 bg-white/85 dark:bg-[#161d1a]/88 backdrop-blur-sm" />
            <div className="relative z-10 py-16 text-center">
              <div className="w-16 h-16 bg-[#E0EDF8] dark:bg-[#2a322e] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[#1F345E] dark:text-[#7E8AA9] text-3xl">search_off</span>
              </div>
              <h3 className="text-[18px] font-extrabold text-[#161d1a] dark:text-[#E0EDF8] mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>No issues found</h3>
              <p className="text-[13px] text-[#7E8AA9]">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MyIssues = ({ issues, currentUser, onOpenIssue }) => {
  const myIssues = issues.filter(i => i.citizenId === currentUser.id);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-headline-lg font-display-lg text-on-surface tracking-tighter">My Reported Issues</h2>
        <p className="text-body-md text-on-surface-variant">Track the progress of issues you've submitted.</p>
      </div>

      {myIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {myIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onOpen={onOpenIssue} />
          ))}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[2rem] border border-[#E0EDF8] dark:border-white/10">
          {/* Background collage */}
          <div className="absolute inset-0 grid grid-cols-3">
            {['/images/Roads/Roads.jpg', '/images/Drainage/Drainage.jpg', '/images/StreetLights/StreetLights.jpg'].map((src, i) => (
              <img key={i} src={src} alt="" className="w-full h-full object-cover opacity-20 dark:opacity-10" style={{ filter: 'saturate(0.5)' }} />
            ))}
          </div>
          <div className="absolute inset-0 bg-white/80 dark:bg-[#161d1a]/85 backdrop-blur-sm" />
          <div className="relative z-10 py-20 text-center px-6">
            <div className="w-20 h-20 bg-[#E0EDF8] dark:bg-[#2a322e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="material-symbols-outlined text-[#1F345E] dark:text-[#7E8AA9] text-4xl">shield_person</span>
            </div>
            <h3 className="text-[22px] font-extrabold text-[#161d1a] dark:text-[#E0EDF8] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>No reports yet</h3>
            <p className="text-[14px] text-[#7E8AA9] mb-8 max-w-xs mx-auto">You haven't submitted any civic issues. Be the first to make a difference in your community.</p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Potholes', 'Street Lights', 'Drainage', 'Sanitation'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-[#E0EDF8] dark:bg-[#2a322e] text-[#1F345E] dark:text-[#7E8AA9] text-[11px] font-bold uppercase tracking-wider">{tag}</span>
              ))}
            </div>
            <NavLink to="/report" className="inline-flex items-center gap-2 bg-[#213D76] text-white px-10 py-4 rounded-full font-bold text-[13px] uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              Submit Your First Report
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportBug = () => {
  const [formData, setFormData] = useState({ subject: '', category: 'ui', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.submitBugReport(formData);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || "Failed to submit bug report");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#161d1a] rounded-[2.5rem] p-12 text-center shadow-premium border border-outline-variant/20">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="text-primary" size={40} />
        </div>
        <h2 className="text-headline-md font-display-lg text-on-surface mb-4">Report Received!</h2>
        <p className="text-body-lg text-on-surface-variant mb-10">Thank you for helping us improve. Our technical team will review your report shortly.</p>
        <button onClick={() => setSubmitted(false)} className="bg-primary text-white px-12 py-4 rounded-full font-label-bold">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white/95 dark:bg-[#161d1a]/95 backdrop-blur-md rounded-[2.5rem] shadow-premium border border-outline-variant/20 overflow-hidden">
      <div className="bg-primary p-10 text-white">
        <h2 className="text-headline-md font-display-lg tracking-tight">Report a System Bug</h2>
        <p className="opacity-80 font-body-md">Encountered a technical issue? Let us know and we'll squash it.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block font-label-bold text-label-sm text-on-surface mb-2">Subject</label>
            <input 
              required
              className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-body-md"
              placeholder="Brief summary of the issue"
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>
          <div>
            <label className="block font-label-bold text-label-sm text-on-surface mb-2">Category</label>
            <select 
              className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-body-md"
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="ui">User Interface</option>
              <option value="bug">Functional Bug</option>
              <option value="performance">Performance</option>
              <option value="feature">Feature Request</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block font-label-bold text-label-sm text-on-surface mb-2">Details</label>
            <textarea 
              required
              rows="5"
              className="w-full bg-surface-container-low border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary transition-all font-body-md"
              placeholder="Step by step instructions to reproduce the issue..."
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
        </div>
        <button type="submit" className="w-full bg-primary text-white py-5 rounded-full font-label-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all">
          Submit Bug Report
        </button>
      </form>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const AdminDashboard = ({ issues, departments, labour, notifications, dashboardStats, currentUser }) => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [localIssues, setLocalIssues] = useState(issues);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignForm, setAssignForm] = useState({ labourId: '', note: '' });
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' | 'history' | 'chat'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    setLocalIssues(issues);
  }, [issues]);

  useEffect(() => {
    if (selectedIssue && activeTab === 'chat') {
      const fetchMessages = async () => {
        setLoadingChat(true);
        try {
          const data = await api.getMessages(selectedIssue.id);
          setMessages(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingChat(false);
        }
      };
      fetchMessages();
    }
  }, [selectedIssue, activeTab]);

  const handleNotificationClick = async (n) => {
    try {
      if (!n.read) await api.markNotificationRead(n.id);
      if (n.issue_id) {
        const issue = localIssues.find(i => i.originalId === n.issue_id);
        if (issue) setSelectedIssue(issue);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedIssue) return;
    try {
      const sent = await api.sendMessage(selectedIssue.id, newMessage);
      setMessages(prev => [...prev, { ...sent, senderName: currentUser.name, senderRole: currentUser.role }]);
      setNewMessage('');
    } catch (err) {
      alert(err.message);
    }
  };

  const statuses = ['All', 'Pending', 'In Progress', 'Resolved', 'Completed', 'Rejected'];

  const filtered = localIssues.filter(i => {
    const matchStatus = filterStatus === 'All' || i.status === filterStatus;
    const matchSearch = i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = dashboardStats || {
    total: localIssues.length,
    pending: localIssues.filter(i => i.status === 'Pending').length,
    inProgress: localIssues.filter(i => i.status === 'In Progress').length,
    resolved: localIssues.filter(i => i.status === 'Resolved' || i.status === 'Completed').length,
    completed: localIssues.filter(i => i.status === 'Completed').length,
  };

  const handleStatusUpdate = async (issueId, status) => {
    setUpdating(true);
    try {
      await api.updateIssue(issueId, { status });
      setLocalIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, status } : issue));
      setSelectedIssue(prev => prev && prev.id === issueId ? { ...prev, status } : prev);
      if (status === 'Completed') {
        setSelectedIssue(null);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setUpdating(true);
    try {
      await api.updateIssue(selectedIssue.id, {
        labourId: assignForm.labourId,
        adminNote: assignForm.note,
        status: 'In Progress',
      });
      setLocalIssues(prev => prev.map(issue => issue.id === selectedIssue.id ? { ...issue, status: 'In Progress' } : issue));
      setAssignForm({ labourId: '', note: '' });
      setSelectedIssue(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const statusColor = (status) => {
    if (status === 'Resolved' || status === 'Completed') return 'bg-[#213D76]/15 text-[#1F345E]';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700';
    if (status === 'Rejected') return 'bg-red-100 text-red-700';
    return 'bg-[#E0EDF8] dark:bg-[#2a322e] text-[#1F345E] dark:text-[#7E8AA9]';
  };

  const priorityColor = (p) => {
    if (p === 'Urgent') return 'text-red-600 bg-red-50';
    if (p === 'High') return 'text-orange-600 bg-orange-50';
    return 'text-[#1F345E] bg-[#E0EDF8] dark:bg-[#2a322e]';
  };

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[#1F345E] font-label-bold text-[11px] uppercase tracking-widest block mb-1">Administration</span>
          <h1 className="font-display-lg text-[34px] md:text-[44px] text-[#161d1a] dark:text-[#E0EDF8] leading-[1] tracking-[-0.04em]">Admin Dashboard</h1>
          <p className="text-[#1F345E] dark:text-[#7E8AA9] text-sm opacity-70 mt-2 font-medium tracking-[-0.01em]">Manage civic issues, assign labour, and monitor resolutions.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/80 dark:bg-[#161d1a]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#7E8AA9]/30 dark:border-white/10 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#1F345E] flex items-center justify-center text-white font-bold text-xs">
            {currentUser?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#161d1a] dark:text-[#E0EDF8] leading-none">{currentUser?.name}</p>
            <p className="text-[10px] text-[#1F345E] font-bold uppercase tracking-wider">Administrator</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: stats.total, icon: 'folder_open', color: 'text-[#1F345E]', bg: 'bg-[#E0EDF8] dark:bg-[#2a322e]' },
          { label: 'Pending', value: stats.pending, icon: 'schedule', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'In Progress', value: stats.inProgress, icon: 'engineering', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resolved', value: stats.resolved, icon: 'check_circle', color: 'text-[#213D76]', bg: 'bg-[#213D76]/10' },
        ].map(s => (
          <div key={s.label} className="bg-white/90 backdrop-blur-md rounded-[1.75rem] p-6 shadow-sm border border-white/60 hover:shadow-lg transition-all group">
            <div className={`w-11 h-11 ${s.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <span className={`material-symbols-outlined ${s.color} text-xl`}>{s.icon}</span>
            </div>
            <p className="text-[36px] font-display-lg font-black text-[#161d1a] dark:text-[#E0EDF8] leading-none tracking-[-0.05em]">{s.value}</p>
            <p className="text-[11px] font-semibold text-[#7E8AA9] dark:text-[#7E8AA9] uppercase tracking-[0.28em] mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Issues Table */}
        <div className="xl:col-span-2 bg-white/90 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/60 overflow-hidden">
          <div className="p-6 border-b border-[#E0EDF8] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <h2 className="font-display-lg text-[18px] text-[#161d1a] dark:text-[#E0EDF8] font-extrabold tracking-[-0.03em]">Issue Reports</h2>
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7E8AA9] text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-xl pl-9 pr-4 py-2 text-sm text-[#161d1a] dark:text-[#E0EDF8] focus:ring-2 focus:ring-[#1F345E] w-48"
                />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-xl px-4 py-2 text-sm text-[#161d1a] dark:text-[#E0EDF8] pr-8 focus:ring-2 focus:ring-[#1F345E]"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] dark:text-[#E0EDF8] text-sm">expand_more</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#E0EDF8] max-h-[520px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-14 h-14 bg-[#E0EDF8] dark:bg-[#2a322e] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[#1F345E] dark:text-[#7E8AA9] text-2xl">inbox</span>
                </div>
                <p className="text-sm font-bold text-[#7E8AA9]">No issues match your filter</p>
                <p className="text-[11px] text-[#7E8AA9]/60 mt-1">Try a different status or search term</p>
              </div>
            ) : filtered.map((issue, index) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`p-5 flex items-start gap-4 cursor-pointer hover:bg-[#E0EDF8] transition-all ${selectedIssue?.id === issue.id ? 'bg-[#E0EDF8] dark:bg-[#2a322e]' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#E0EDF8] dark:bg-[#2a322e] flex-shrink-0 overflow-hidden ring-1 ring-[#7E8AA9]/20 relative">
                  <img src={getRelevantImage(issue.title, issue.description, issue.department, `thumb:${issue.id}`)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center rounded-full bg-[#1F345E]/10 text-[#1F345E] text-[10px] font-black px-2 py-0.5 tracking-[0.22em] flex-shrink-0">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="font-bold text-[#161d1a] dark:text-[#E0EDF8] text-sm truncate tracking-[-0.02em]">{issue.title}</p>
                  </div>
                  <p className="text-[11px] text-[#7E8AA9] dark:text-[#7E8AA9] mt-0.5 font-medium">{issue.area} · {issue.department} · {issue.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${statusColor(issue.status)}`}>{issue.status}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor(issue.priority)}`}>{issue.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-6">

          {/* Assign Labour Panel */}
          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/60 p-6">
            <h2 className="font-display-lg text-[16px] text-[#161d1a] dark:text-[#E0EDF8] font-extrabold tracking-[-0.03em] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1F345E]">engineering</span>
              Assign Labour
            </h2>
            {selectedIssue ? (
              <div className="space-y-4">
                <div className="flex bg-[#E0EDF8] dark:bg-[#2a322e] rounded-xl p-1">
                  <button onClick={() => setActiveTab('assign')} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'assign' ? 'bg-white dark:bg-[#161d1a] text-[#1F345E] shadow-sm' : 'text-[#7E8AA9] dark:text-[#7E8AA9]'}`}>Update Status</button>
                  <button onClick={() => setActiveTab('history')} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-[#161d1a] text-[#1F345E] shadow-sm' : 'text-[#7E8AA9] dark:text-[#7E8AA9]'}`}>Audit Trail</button>
                  <button onClick={() => setActiveTab('chat')} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-[#161d1a] text-[#1F345E] shadow-sm' : 'text-[#7E8AA9] dark:text-[#7E8AA9]'}`}>Conversation</button>
                </div>

                {activeTab === 'assign' ? (
                  <form onSubmit={handleAssign} className="space-y-4">
                    <div className="bg-[#E0EDF8] dark:bg-[#2a322e] rounded-2xl p-4">
                      <p className="font-bold text-[#161d1a] dark:text-[#E0EDF8] text-sm line-clamp-2 tracking-[-0.02em]">{selectedIssue.title}</p>
                      <p className="text-[11px] text-[#7E8AA9] dark:text-[#7E8AA9] mt-1 font-medium">{selectedIssue.area} · {selectedIssue.department} · {selectedIssue.id}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide">Assign Worker</label>
                      <div className="relative">
                        <select
                          required
                          value={assignForm.labourId}
                          onChange={e => setAssignForm(p => ({ ...p, labourId: e.target.value }))}
                          className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-xl p-3 text-sm pr-8 focus:ring-2 focus:ring-[#1F345E]"
                        >
                          <option value="">Select worker...</option>
                          {(labour || []).map(l => (
                            <option key={l.id} value={l.id}>{l.name} {l.phone ? `(${l.phone})` : ''} — {l.department}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] dark:text-[#E0EDF8] text-sm">expand_more</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide">Admin Note</label>
                      <textarea
                        rows="3"
                        value={assignForm.note}
                        onChange={e => setAssignForm(p => ({ ...p, note: e.target.value }))}
                        className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-[#1F345E]"
                        placeholder="Add a note for the field worker..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1F345E] dark:text-[#7E8AA9] uppercase tracking-wide">Quick Status Update</label>
                      <div className="relative">
                        <select
                          onChange={e => handleStatusUpdate(selectedIssue.id, e.target.value)}
                          value={selectedIssue.status}
                          className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-xl p-3 text-sm pr-8 focus:ring-2 focus:ring-[#1F345E]"
                        >
                          {['Pending', 'In Progress', 'Resolved', 'Completed', 'Rejected'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] dark:text-[#E0EDF8] text-sm">expand_more</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSelectedIssue(null)} className="flex-1 py-3 rounded-xl border border-[#7E8AA9] text-[#1F345E] dark:text-[#7E8AA9] text-sm font-bold hover:bg-[#E0EDF8] transition-all">Cancel</button>
                      <button type="submit" disabled={updating} className="flex-1 py-3 rounded-xl bg-[#1F345E] text-white text-sm font-bold hover:bg-[#005040] transition-all disabled:opacity-50">{updating ? 'Saving...' : 'Assign & Save'}</button>
                    </div>
                  </form>
                ) : activeTab === 'history' ? (
                  <div className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                      {(selectedIssue.history || []).length === 0 ? (
                        <div className="py-8 text-center text-[#7E8AA9]">
                          <span className="material-symbols-outlined text-3xl block mb-2">history</span>
                          <p className="text-[11px] font-bold">No assignment history yet</p>
                        </div>
                      ) : selectedIssue.history.map((h, idx) => (
                        <div key={idx} className="relative pl-6 pb-4 border-l-2 border-[#E0EDF8] last:pb-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-[#161d1a] border-2 border-[#213D76]"></div>
                          <p className="text-[10px] font-bold text-[#1F345E] uppercase tracking-wider leading-none">{new Date(h.assigned_at).toLocaleString()}</p>
                          <p className="text-[12px] font-bold text-[#161d1a] dark:text-[#E0EDF8] mt-1">
                            {h.labourName ? `Assigned to ${h.labourName}` : 'Status Changed'}
                            {h.labourPhone && <span className="ml-2 text-[#1F345E] font-normal text-[11px]">— {h.labourPhone}</span>}
                          </p>
                          <p className="text-[11px] text-[#7E8AA9] dark:text-[#7E8AA9] mt-1 italic">"{h.note}"</p>
                          <p className="text-[9px] text-[#7E8AA9] mt-1">Updated by {h.adminName}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('assign')} className="w-full py-3 rounded-xl border border-[#1F345E] text-[#1F345E] text-sm font-bold hover:bg-[#E0EDF8] dark:bg-[#2a322e] transition-all">Back to Actions</button>
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                      {loadingChat ? (
                        <p className="text-center text-[#7E8AA9] py-10 text-[11px] animate-pulse">Loading conversation...</p>
                      ) : messages.length === 0 ? (
                        <div className="py-12 text-center text-[#7E8AA9]">
                          <span className="material-symbols-outlined text-4xl block mb-2">forum</span>
                          <p className="text-[11px] font-bold">No messages yet. Start the conversation!</p>
                        </div>
                      ) : messages.map((m, idx) => (
                        <div key={idx} className={`flex flex-col ${m.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] ${
                            m.sender_id === currentUser.id ? 'bg-[#1F345E] text-white rounded-tr-none' : 'bg-[#E0EDF8] dark:bg-[#2a322e] text-[#161d1a] dark:text-[#E0EDF8] rounded-tl-none'
                          }`}>
                            <p className="font-medium leading-relaxed">{m.message}</p>
                          </div>
                          <p className="text-[9px] text-[#7E8AA9] mt-1 px-1">
                            {m.sender_id === currentUser.id ? 'You' : m.senderName} · {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="relative mt-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-[#E0EDF8] dark:bg-[#2a322e] border-none rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-[#1F345E] outline-none"
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#1F345E] text-white rounded-xl flex items-center justify-center hover:bg-[#005040] transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-[#7E8AA9]">
                <span className="material-symbols-outlined text-4xl block mb-2">touch_app</span>
                <p className="text-sm font-bold">Select an issue from the list to assign a worker</p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/60 p-6">
            <h2 className="font-display-lg text-[16px] text-[#161d1a] dark:text-[#E0EDF8] font-extrabold tracking-[-0.03em] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1F345E]">notifications</span>
              Recent Alerts
              {notifications?.filter(n => !n.read).length > 0 && (
                <span className="ml-auto bg-[#213D76] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{notifications.filter(n => !n.read).length} new</span>
              )}
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(notifications || []).length === 0 ? (
                <p className="text-center text-[#7E8AA9] text-sm py-6">No notifications</p>
              ) : notifications.slice(0, 8).map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white dark:bg-[#161d1a] hover:shadow-sm group ${n.read ? 'opacity-50' : 'bg-[#E0EDF8] dark:bg-[#2a322e]'}`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-[#7E8AA9]' : 'bg-[#213D76]'}`}></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#161d1a] dark:text-[#E0EDF8] truncate group-hover:text-[#1F345E]">{n.title || 'New Issue Submitted'}</p>
                    <p className="text-[11px] text-[#7E8AA9] dark:text-[#7E8AA9] mt-0.5">{n.message || n.body || ''}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};