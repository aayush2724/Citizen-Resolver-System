import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { api } from './services/api';
import IssueCard from './components/IssueCard';
import IssueModal from './components/IssueModal';
import { Shield, MapPin, Search, Filter } from 'lucide-react';
import { getRelevantImage } from './utils/image';

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
`;

// --- Components ---

const Header = ({ currentUser, onLogout, notifications = [] }) => {
  const [notifOpen, setNotifOpen] = useState(false);

  const handleNotificationClick = async (n) => {
    try {
      if (!n.read) await api.markNotificationRead(n.id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3 max-w-container-max mx-auto bg-white/80 backdrop-blur-md dark:bg-surface-dim rounded-full mt-4 w-[95%] shadow-sm flex-shrink-0 border border-[#bbcac1]/30">
      <div className="flex items-center gap-3">
        <div className="bg-[#00c896] p-2 rounded-xl flex items-center justify-center shadow-sm shadow-[#00c896]/20">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
        </div>
        <div className="flex flex-col">
          <span
            className="text-lg md:text-xl font-black text-[#161d1a] leading-none tracking-[-0.03em]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Citizen Resolver
          </span>
          <span className="text-[9px] uppercase tracking-[0.28em] font-bold text-[#006c4f] opacity-80" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Empowering Communities
          </span>
        </div>
      </div>
      <nav className="hidden md:flex items-center bg-[#e8f0e9]/50 rounded-full p-1 ml-4">
        <NavLink to="/" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#006c4f] text-white shadow-md' : 'text-[#3c4a43] hover:text-[#006c4f]'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Home</NavLink>
        <NavLink to="/report" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#006c4f] text-white shadow-md' : 'text-[#3c4a43] hover:text-[#006c4f]'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Report Issue</NavLink>
        <NavLink to="/my-issues" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#006c4f] text-white shadow-md' : 'text-[#3c4a43] hover:text-[#006c4f]'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Issues</NavLink>
        <NavLink to="/public-issues" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#006c4f] text-white shadow-md' : 'text-[#3c4a43] hover:text-[#006c4f]'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Public Issues</NavLink>
        {currentUser?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#006c4f] text-white shadow-md' : 'text-[#3c4a43] hover:text-[#006c4f]'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dashboard</NavLink>
        )}
        <NavLink to="/report-bug" className={({ isActive }) => `px-6 py-2 transition-all text-[13px] font-semibold rounded-full tracking-[-0.01em] ${isActive ? 'bg-[#006c4f] text-white shadow-md' : 'text-[#3c4a43] hover:text-[#006c4f]'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Report Bug</NavLink>
      </nav>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-10 h-10 hidden md:flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-[#eef6ef] transition-all border border-[#bbcac1]/20 relative"
          >
            <span className="material-symbols-outlined text-[#3c4a43] text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#d84315] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-premium border border-outline-variant/30 flex flex-col overflow-hidden z-50">
              <div className="px-4 py-3 bg-[#eef6ef]/50 border-b border-[#bbcac1]/20 flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#3c4a43] uppercase tracking-wider">Notifications</p>
                {unreadCount > 0 && (
                  <span className="bg-[#00c896] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount} new</span>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {(notifications || []).length === 0 ? (
                  <p className="text-center text-[#bbcac1] text-sm py-6">No notifications</p>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        handleNotificationClick(n);
                        setNotifOpen(false);
                      }}
                      className={`w-full text-left flex items-start gap-3 p-3 border-b border-[#bbcac1]/10 hover:bg-[#eef6ef] transition-all group ${
                        n.read ? 'opacity-50' : 'bg-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        n.read ? 'bg-[#bbcac1]' : 'bg-[#00c896]'
                      }`}></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#161d1a] truncate group-hover:text-[#006c4f]">
                          {n.title || 'New Notification'}
                        </p>
                        <p className="text-[11px] text-[#6c7a72] mt-0.5 line-clamp-2">
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
            <button className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#bbcac1]/30 hover:bg-[#eef6ef] transition-all">
              <div className="w-8 h-8 rounded-full bg-[#00c896] flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-[#00c896]/20">
                {currentUser.name?.[0].toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:flex flex-col items-start text-left">
                <span className="text-[10px] font-bold text-[#161d1a] leading-tight">{currentUser.name}</span>
                <span className="text-[8px] uppercase text-[#6c7a72] font-bold">{currentUser.role || 'Citizen'}</span>
              </div>
              <span className="material-symbols-outlined text-[#bbcac1] text-sm ml-1 group-hover:text-[#006c4f]">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-premium border border-outline-variant/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 flex flex-col overflow-hidden z-50">
              <div className="px-4 py-3 bg-[#eef6ef]/50 border-b border-[#bbcac1]/20">
                <p className="text-[10px] font-bold text-[#3c4a43] uppercase tracking-wider">Active Accounts</p>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {(api.getSessions() || []).map(session => (
                  <div
                    key={session.email}
                    onClick={() => api.switchAccount(session.token)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      session.email === currentUser.email 
                        ? 'bg-[#006c4f]/5 cursor-default' 
                        : 'hover:bg-[#f3fbf5] cursor-pointer'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') api.switchAccount(session.token); }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      session.role === 'admin' ? 'bg-[#161d1a] text-white' : 'bg-[#00c896] text-white'
                    }`}>
                      {session.name?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-bold truncate ${session.email === currentUser.email ? 'text-[#006c4f]' : 'text-[#161d1a]'}`}>
                        {session.name}
                      </p>
                      <p className="text-[10px] text-[#6c7a72] truncate">{session.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.email === currentUser.email && (
                        <span className="material-symbols-outlined text-[#00c896] text-sm">check_circle</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); api.logoutSession(session.email); }}
                        title="Sign out this account"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-[#6c7a72] hover:bg-[#ffecec] hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined">logout</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#bbcac1]/20 p-2">
                <button
                  onClick={() => window.dispatchEvent(new Event("trigger-add-account"))}
                  className="w-full text-left px-3 py-2 text-[12px] font-bold text-[#161d1a] hover:bg-[#eef6ef] rounded-xl flex items-center gap-2 transition-colors"
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
  <footer className="relative z-50 bg-[#eef6ef]/50 backdrop-blur-md border-t border-[#bbcac1]/30 py-6 mt-auto">
    <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center px-margin-desktop">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#00c896] flex items-center justify-center rounded">
            <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
          </div>
          <span className="font-bold text-[#006c4f] text-sm">Citizen Resolver</span>
        </div>
        <span className="hidden md:inline text-[11px] text-[#3c4a43] opacity-60">© 2024 Citizen Resolver System</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex gap-4">
          <a className="text-[#3c4a43] hover:text-[#006c4f] transition-colors font-label-bold text-[11px]" href="#">Privacy</a>
          <a className="text-[#3c4a43] hover:text-[#006c4f] transition-colors font-label-bold text-[11px]" href="#">Terms</a>
          <a className="text-[#3c4a43] hover:text-[#006c4f] transition-colors font-label-bold text-[11px]" href="#">Support</a>
        </div>
        <div className="flex gap-2">
          <a className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#00c896] hover:text-white transition-all shadow-sm" href="#">
            <span className="material-symbols-outlined text-sm">public</span>
          </a>
          <a className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#00c896] hover:text-white transition-all shadow-sm" href="#">
            <span className="material-symbols-outlined text-sm">mail</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

const ParallaxBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });


  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getParallaxStyle = (depth) => ({
    transform: `translate3d(${(window.innerWidth / 2 - mousePos.x) * depth * 0.1}px, ${(window.innerHeight / 2 - mousePos.y) * depth * 0.1}px, 0)`,
    transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)'
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <div className="absolute inset-0 opacity-[0.12]" style={getParallaxStyle(0.1)}>
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="60" id="hero-grid" patternUnits="userSpaceOnUse" width="60">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#006c4f" strokeWidth="1.5"></path>
            </pattern>
          </defs>
          <rect fill="url(#hero-grid)" height="100%" width="100%"></rect>
        </svg>
      </div>

      <div className="absolute top-1/4 left-10 w-40 h-40 rounded-full bg-[#00c896]/20 blur-xl" style={getParallaxStyle(0.6)}></div>
      <div className="absolute top-2/3 right-20 w-56 h-56 rounded-full bg-[#00c896]/15 blur-2xl" style={getParallaxStyle(0.3)}></div>
      <div className="absolute hidden lg:block top-1/3 right-1/4 w-32 h-32 border-4 border-[#00c896]/20 rounded-full" style={getParallaxStyle(0.8)}></div>

      {/* Additional green blush accents for Home */}
      <div className="absolute -top-6 left-1/3 w-56 h-56 rounded-full bg-[#00c896]/18 blur-3xl opacity-90" style={getParallaxStyle(0.5)}></div>
      <div className="absolute top-20 left-1/6 w-28 h-28 rounded-full bg-[#00c896]/25 blur-2xl opacity-90" style={getParallaxStyle(0.7)}></div>
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-[#00c896]/20 to-transparent blur-2xl opacity-90" style={getParallaxStyle(0.4)}></div>
      <div className="absolute top-10 right-1/3 w-44 h-44 rounded-full bg-[#00c896]/10 blur-3xl opacity-85" style={getParallaxStyle(0.35)}></div>
      <div className="absolute hidden md:block top-40 right-10 w-32 h-32 rounded-full bg-[#00c896]/12 blur-xl opacity-80" style={getParallaxStyle(0.25)}></div>

      {/* ── Scattered Photo Collage ── */}

      {/* Top-right: tilted strongly clockwise */}
      <div className="absolute top-[6%] right-[5%] w-80 h-56 rounded-2xl overflow-hidden shadow-2xl border-[5px] border-white rotate-[14deg] opacity-75 hidden md:block transition-transform duration-700 hover:scale-105" style={getParallaxStyle(0.45)}>
        <img alt="Sanitation" className="w-full h-full object-cover" src="/images/Sanitation/Sanitation.jpg"/>
      </div>



      {/* Top-left: counter-clockwise lean */}
      <div className="absolute top-[12%] left-[3%] w-72 h-52 rounded-2xl overflow-hidden shadow-2xl border-[5px] border-white -rotate-[10deg] opacity-70 hidden md:block transition-transform duration-700 hover:scale-105" style={getParallaxStyle(0.6)}>
        <img alt="Urban Roads" className="w-full h-full object-cover" src="/images/Roads/Potholes.jpg"/>
      </div>

      {/* Mid-left: slightly tilted, peeking from bottom-left edge */}
      <div className="absolute bottom-[42%] -left-[4%] w-72 h-52 rounded-2xl overflow-hidden shadow-xl border-[5px] border-white -rotate-[8deg] opacity-65 hidden lg:block transition-transform duration-700 hover:scale-105" style={getParallaxStyle(0.7)}>
        <img alt="Drainage" className="w-full h-full object-cover" src="/images/Drainage/Drainage.jpg"/>
      </div>

      {/* Mid-right: steep tilt going left */}
      <div className="absolute top-[38%] right-[2%] w-64 h-48 rounded-2xl overflow-hidden shadow-xl border-[5px] border-white -rotate-[18deg] opacity-65 hidden lg:block transition-transform duration-700 hover:scale-105" style={getParallaxStyle(0.5)}>
        <img alt="Public Parks" className="w-full h-full object-cover" src="/images/PublicParks/PublicParks.jpg"/>
      </div>

      {/* Bottom-left: large, gently rotated */}
      <div className="absolute bottom-[8%] left-[4%] w-96 h-64 rounded-2xl overflow-hidden shadow-2xl border-[5px] border-white -rotate-[8deg] opacity-70 hidden md:block transition-transform duration-700 hover:scale-105" style={getParallaxStyle(0.55)}>
        <img alt="City" className="w-full h-full object-cover" src="/images/Roads/Roads.jpg"/>
      </div>

      {/* Bottom-right: punchy tilt right */}
      <div className="absolute bottom-[10%] right-[3%] w-80 h-56 rounded-2xl overflow-hidden shadow-2xl border-[5px] border-white rotate-[12deg] opacity-70 hidden md:block transition-transform duration-700 hover:scale-105" style={getParallaxStyle(0.4)}>
        <img alt="Street Lights" className="w-full h-full object-cover" src="/images/StreetLights/StreetLights.jpg"/>
      </div>



    </div>
  );
};

const NonHomeBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const getParallaxStyle = (depth) => ({
    transform: `translate3d(${(window.innerWidth / 2 - mousePos.x) * depth * 0.05}px, ${(window.innerHeight / 2 - mousePos.y) * depth * 0.05}px, 0)`,
    transition: "transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <div className="absolute inset-0 opacity-[0.14]" style={getParallaxStyle(0.08)}>
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="56" id="route-grid" patternUnits="userSpaceOnUse" width="56">
              <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#006c4f" strokeWidth="1.2"></path>
            </pattern>
          </defs>
          <rect fill="url(#route-grid)" height="100%" width="100%"></rect>
        </svg>
      </div>

      <div className="absolute top-[10%] right-[8%] w-72 h-52 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/10 rotate-12 floating-img opacity-45 grayscale hover:grayscale-0 hover:opacity-70 transition-all duration-700" style={getParallaxStyle(0.35)}>
        <img alt="Sanitation" className="w-full h-full object-cover" src="/images/Sanitation/Sanitation.jpg" />
      </div>
      <div className="absolute bottom-[14%] left-[7%] w-64 h-48 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/10 -rotate-6 floating-img opacity-45 grayscale hover:grayscale-0 hover:opacity-70 transition-all duration-700" style={getParallaxStyle(0.5)}>
        <img alt="Roads" className="w-full h-full object-cover" src="/images/Roads/Roads.jpg" />
      </div>
      <div className="absolute top-[38%] left-[12%] w-60 h-44 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/10 rotate-[8deg] floating-img opacity-40 grayscale hover:grayscale-0 hover:opacity-65 transition-all duration-700 hidden md:block" style={getParallaxStyle(0.45)}>
        <img alt="Drainage" className="w-full h-full object-cover" src="/images/Drainage/Drainage.jpg" />
      </div>
      <div className="absolute bottom-[8%] right-[6%] w-72 h-52 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/10 -rotate-[10deg] floating-img opacity-40 grayscale hover:grayscale-0 hover:opacity-65 transition-all duration-700 hidden md:block" style={getParallaxStyle(0.4)}>
        <img alt="Street Lights" className="w-full h-full object-cover" src="/images/StreetLights/StreetLights.jpg" />
      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" style={getParallaxStyle(0.12)}></div>
      <div className="absolute bottom-1/3 right-1/4 w-[520px] h-[520px] rounded-full bg-primary/5 blur-[150px]" style={getParallaxStyle(0.18)}></div>
    </div>
  );
};

const Home = ({ issues = [] }) => {
  const stats = {
    total: issues.length,
    resolved: issues.filter(i => i.status === 'Resolved' || i.status === 'Completed').length
  };

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-160px)] flex flex-col items-center justify-center overflow-hidden font-body-md py-12 md:py-20 animate-fade-in">
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-5xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8f0e9] border border-[#6c7a72]/50 mb-4 md:mb-6 scale-75 md:scale-90">
          <span className="w-2 h-2 rounded-full bg-[#00c896] animate-pulse"></span>
          <span className="font-label-bold text-xs md:text-[14px] uppercase tracking-widest text-[#3c4a43]">Official Civic Platform</span>
        </div>

        <h1 className="font-display-lg text-[40px] md:text-[56px] lg:text-[80px] leading-[1.05] mb-4 md:mb-6 font-extrabold text-[#161d1a] px-4">
          Citizen <span className="text-[#00c896]">Resolver</span> System
        </h1>

        <p className="font-body-lg text-[16px] md:text-[18px] text-[#3c4a43] max-w-2xl mx-auto mb-8 md:mb-10 opacity-80 leading-relaxed px-4">
          Bridging the gap between citizens and administration with unprecedented transparency and efficiency.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12 w-full px-4">
          <NavLink to="/report" className="w-full sm:w-auto bg-[#00c896] text-[#004d38] font-label-bold text-sm md:text-[14px] px-8 md:px-10 py-4 md:py-5 rounded-full hover:shadow-lg hover:scale-105 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 group">
            REPORT AN ISSUE
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </NavLink>
          <NavLink to="/public-issues" className="w-full sm:w-auto bg-white text-[#161d1a] font-label-bold text-sm md:text-[14px] px-8 md:px-10 py-4 md:py-5 rounded-full hover:shadow-md border border-[#6c7a72]/30 transition-all active:scale-95 hover:-translate-y-1 hover:bg-[#e2eae4]">
            PUBLIC BOARD
          </NavLink>
        </div>

        {/* Stats Section - Stack on mobile, grid on desktop */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch px-4">
          <div className="bg-white/80 backdrop-blur-sm shadow-sm p-5 md:p-6 rounded-xl flex flex-col justify-center items-center group transition-all hover:shadow-xl border border-white/50 order-2 md:order-1">
            <div className="text-[32px] md:text-[42px] font-display-lg font-extrabold text-[#161d1a] leading-none mb-1">2.4k</div>
            <div className="font-label-bold text-[10px] md:text-[12px] text-[#3c4a43] uppercase tracking-widest">Solved Cases</div>
            <div className="mt-3 w-8 md:w-10 h-1 bg-[#00c896]/20 group-hover:w-16 transition-all duration-500 rounded-full"></div>
          </div>

          <div className="bg-[#00c896] shadow-xl p-6 md:p-8 rounded-xl flex flex-col justify-center items-center group hover:scale-[1.02] transition-all text-[#004d38] order-1 md:order-2">
            <div className="text-[48px] md:text-[64px] font-display-lg font-extrabold leading-none mb-1">{stats.total}</div>
            <div className="font-label-bold text-[10px] md:text-[12px] uppercase tracking-widest">Total Reports</div>
            <div className="mt-4 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-black/20"></span>
              <span className="w-2 h-2 rounded-full bg-black/20"></span>
              <span className="w-2 h-2 rounded-full bg-black/40"></span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-sm p-5 md:p-6 rounded-xl flex flex-col justify-center items-center group transition-all hover:shadow-xl border border-white/50 order-3 md:order-3">
            <div className="text-[32px] md:text-[42px] font-display-lg font-extrabold text-[#161d1a] leading-none mb-1">{stats.total - stats.resolved}</div>
            <div className="font-label-bold text-[10px] md:text-[12px] text-[#3c4a43] uppercase tracking-widest">Active Tasks</div>
            <div className="mt-3 w-8 md:w-10 h-1 bg-[#00c896]/20 group-hover:w-16 transition-all duration-500 rounded-full"></div>
          </div>
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createIssue(formData);
      setSubmitted(true);
      window.dispatchEvent(new Event("portal-state-change"));
    } catch (err) {
      alert(err.message || "Failed to report issue");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-[#00c896] text-white rounded-full flex items-center justify-center mb-8 shadow-lg shadow-[#00c896]/20">
          <span className="material-symbols-outlined text-5xl">check</span>
        </div>
        <h2 className="text-display-lg text-[#161d1a] mb-4">Report Submitted!</h2>
        <p className="text-body-lg text-[#3c4a43] max-w-md mx-auto mb-10 opacity-70">
          Your case has been recorded. Our team will review and assign it to the appropriate department shortly.
        </p>
        <div className="flex gap-4">
          <button onClick={() => setSubmitted(false)} className="bg-[#e8f0e9] text-[#006c4f] px-10 py-4 rounded-full font-label-bold hover:bg-[#00c896] hover:text-white transition-all">
            Submit Another
          </button>
          <button onClick={() => navigate('/my-issues')} className="bg-[#006c4f] text-white px-10 py-4 rounded-full font-label-bold hover:shadow-lg transition-all">
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start animate-fade-in-up">
      {/* Form Section */}
      <section className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 shadow-premium border border-white/50">
        <div className="mb-8">
          <span className="text-[#006c4f] font-label-bold text-[12px] uppercase tracking-widest mb-1 block">Citizen Reporting</span>
          <h1 className="font-display-lg text-[32px] md:text-[40px] text-[#161d1a]">New Case Record</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">City</label>
              <div className="relative">
                <select 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#161d1a] text-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12"
                >
                  <option value="">Select city</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] brightness-200">expand_more</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Block</label>
              <div className="relative">
                <select 
                  name="block"
                  value={formData.block}
                  onChange={handleChange}
                  required
                  disabled={!formData.city}
                  className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12 disabled:opacity-50"
                >
                  <option value="">Select block</option>
                  {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a]">expand_more</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Area</label>
              <div className="relative">
                <select 
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  disabled={!formData.block}
                  className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12 disabled:opacity-50"
                >
                  <option value="">Select area</option>
                  {areasList.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a]">expand_more</span>
              </div>
            </div>
          </div>

          {/* Issue Title */}
          <div className="space-y-1">
            <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Issue Title</label>
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md placeholder:text-[#bbcac1] transition-all"
              placeholder="e.g. Major pothole on Sector 4 main road"
            />
          </div>

          {/* Priority & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Priority Level</label>
              <div className="relative">
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a]">expand_more</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Department</label>
              <div className="relative">
                <select 
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12"
                >
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id || d._id} value={d.name}>{d.name}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a]">expand_more</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Description of Problem</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md placeholder:text-[#bbcac1] resize-none transition-all"
              placeholder="Please provide specific landmarks and severity details..."
            ></textarea>
          </div>

          {/* Visual Evidence */}
          <div className="space-y-1">
            <label className="font-label-bold text-[12px] text-[#3c4a43] uppercase tracking-wide px-1">Visual Evidence URL</label>
            <div className="relative">
              <input 
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full bg-[#eef6ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#006c4f] text-body-md pr-12"
                placeholder="https://image-url.com/photo.jpg"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#bbcac1]">link</span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#bbcac1]/30 flex flex-col sm:flex-row justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-full border border-[#6c7a72] text-[#3c4a43] font-label-bold hover:bg-[#f3fbf5] transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-4 rounded-full bg-[#00c896] text-[#004d38] font-label-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Report"}
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </form>
      </section>

      {/* Preview Section */}
      <aside className="lg:col-span-5 flex flex-col gap-8 h-full">
        <div className="bg-[#e8f0e9]/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-white shadow-premium flex flex-col h-full">
          <div className="mb-6 flex justify-between items-center">
            <span className="text-[#3c4a43] font-label-bold text-[12px] uppercase tracking-widest">Case Preview</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#006c4f]/20"></div>
              <div className="w-2 h-2 rounded-full bg-[#006c4f]"></div>
              <div className="w-2 h-2 rounded-full bg-[#006c4f]/20"></div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col flex-grow">
            <div className="relative h-48 w-full bg-[#eef6ef] flex items-center justify-center overflow-hidden">
              {formData.imageUrl ? (
                <img className="w-full h-full object-cover" src={formData.imageUrl} alt="Preview" />
              ) : (
                <div className="flex flex-col items-center text-[#bbcac1]">
                  <span className="material-symbols-outlined text-6xl">image</span>
                  <span className="text-[10px] uppercase font-bold mt-2">No Image Provided</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className={`backdrop-blur-md text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest ${
                  formData.priority === 'Urgent' ? 'bg-error/90' : formData.priority === 'High' ? 'bg-orange-500/90' : 'bg-[#00c896]/90'
                }`}>
                  {formData.priority}
                </span>
              </div>
            </div>
            <div className="p-8 space-y-4 flex-grow flex flex-col">
              <h3 className="font-display-lg text-2xl text-[#161d1a] leading-tight line-clamp-2">
                {formData.title || "Report title will appear here"}
              </h3>
              <p className="text-[#3c4a43] text-sm leading-relaxed line-clamp-4 opacity-70 flex-grow">
                {formData.description || "Enter details to see how your report will look to the administration."}
              </p>
              <div className="pt-6 border-t border-[#bbcac1]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#eef6ef] flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg text-[#006c4f]">location_on</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#6c7a72] uppercase tracking-wider">
                    {formData.city || "Location Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00c896] animate-pulse"></span>
                  <span className="text-[10px] font-bold text-[#00c896] uppercase tracking-wider text-right">Draft</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-8 p-6 bg-white/40 rounded-2xl border border-dashed border-[#bbcac1] flex items-start gap-4">
            <span className="material-symbols-outlined text-[#006c4f] text-2xl">lightbulb</span>
            <p className="text-[13px] text-[#3c4a43] leading-relaxed">
              Adding a clear photo and precise location helps local authorities resolve your issue up to <b className="text-[#006c4f]">40% faster</b>.
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

  const inputClass = "w-full bg-[#eef6ef] border-none rounded-2xl px-4 py-3.5 text-[14px] text-[#161d1a] placeholder:text-[#bbcac1] focus:ring-2 focus:ring-[#006c4f] transition-all outline-none";
  const labelClass = "block text-[11px] font-bold text-[#3c4a43] uppercase tracking-wider mb-1.5 px-1";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-premium border border-white/60 overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* Left Branding Panel */}
        <div className="bg-[#006c4f] p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden hidden lg:flex">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5"></div>
          <div className="absolute bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5"></div>
          <div className="absolute top-1/2 right-4 w-24 h-24 rounded-full bg-[#00c896]/20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-[#00c896] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
              </div>
              <div>
                <p className="text-white font-extrabold text-lg leading-none">Citizen Resolver</p>
                <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Official Civic Platform</p>
              </div>
            </div>

            <h2 className="text-white font-display-lg text-[36px] leading-tight font-extrabold mb-4">
              Empowering<br/>Communities<br/><span className="text-[#00c896]">Together.</span>
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
                <p className="text-[#00c896] font-extrabold text-[22px] leading-none">{s.value}</p>
                <p className="text-white/60 text-[10px] uppercase tracking-wide font-bold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          {/* Logo for mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#006c4f] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
            </div>
            <span className="font-extrabold text-[#006c4f]">Citizen Resolver</span>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-[#eef6ef] rounded-2xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${mode === 'login' ? 'bg-white text-[#006c4f] shadow-sm' : 'text-[#6c7a72] hover:text-[#006c4f]'}`}
            >Sign In</button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${mode === 'signup' ? 'bg-white text-[#006c4f] shadow-sm' : 'text-[#6c7a72] hover:text-[#006c4f]'}`}
            >Create Account</button>
          </div>

          <div className="mb-6">
            <h3 className="font-display-lg text-[26px] text-[#161d1a] font-extrabold">
              {mode === 'login' ? 'Welcome back' : 'Join the platform'}
            </h3>
            <p className="text-[#6c7a72] text-[13px] mt-1">
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
                        ? 'border-[#006c4f] bg-[#eef6ef] text-[#006c4f]'
                        : 'border-[#e0ebe3] text-[#6c7a72] hover:border-[#006c4f]/40'
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
                <label className={labelClass}>Phone Number <span className="text-[#bbcac1] normal-case font-normal">(optional)</span></label>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bbcac1] hover:text-[#006c4f] transition-colors">
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
              className="w-full bg-[#006c4f] hover:bg-[#005040] text-white py-4 rounded-2xl font-bold text-[14px] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'}<span className="material-symbols-outlined text-lg">arrow_forward</span></>
              )}
            </button>

            <p className="text-center text-[12px] text-[#6c7a72] pt-2">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[#006c4f] font-bold hover:underline">
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
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium p-10 text-center border border-error/10">
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
      <div className="font-body-md text-on-surface bg-[#F9F7F2] min-h-screen flex flex-col">
        <Header currentUser={portalState.currentUser} onLogout={handleLogout} notifications={portalState.notifications} />

        <main className="relative flex-1 pt-24 md:pt-32 pb-24 w-full overflow-x-hidden">
          {/* BackgroundController renders decorative background only on Home route */}
          <BackgroundController />

          {!portalState.currentUser || isAddingAccount ? (
            <div className="max-w-container-max mx-auto px-margin-desktop relative z-20">
              {isAddingAccount && (
                <button 
                  onClick={() => setIsAddingAccount(false)}
                  className="absolute -top-12 left-margin-desktop flex items-center gap-2 text-[#3c4a43] hover:text-[#006c4f] font-bold text-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to Dashboard
                </button>
              )}
              <Login />
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
            className="w-full bg-white border border-outline-variant/30 rounded-full py-3 pl-12 pr-6 focus:ring-2 focus:ring-primary transition-all font-body-md text-on-surface shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {filteredIssues.length > 0 ? (
          filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onOpen={onOpenIssue} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-outline-variant/20">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-on-surface-variant" size={32} />
            </div>
            <h3 className="text-headline-sm font-display-lg text-on-surface">No issues found</h3>
            <p className="text-body-md text-on-surface-variant">Try adjusting your search or filters.</p>
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
        <div className="py-20 text-center bg-white rounded-[2rem] border border-outline-variant/20">
          <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-on-surface-variant" size={32} />
          </div>
          <h3 className="text-headline-sm font-display-lg text-on-surface">No reports yet</h3>
          <p className="text-body-md text-on-surface-variant mb-8">You haven't submitted any issues yet.</p>
          <NavLink to="/report" className="bg-primary text-white px-10 py-4 rounded-full font-label-bold shadow-lg hover:shadow-xl transition-all">
            Submit Your First Report
          </NavLink>
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
      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-12 text-center shadow-premium border border-outline-variant/20">
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
    <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-premium border border-outline-variant/20 overflow-hidden">
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
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignForm, setAssignForm] = useState({ labourId: '', note: '' });
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' | 'history' | 'chat'
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

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
        const issue = issues.find(i => i.originalId === n.issue_id);
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

  const filtered = issues.filter(i => {
    const matchStatus = filterStatus === 'All' || i.status === filterStatus;
    const matchSearch = i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = dashboardStats || {
    total: issues.length,
    pending: issues.filter(i => i.status === 'Pending').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved' || i.status === 'Completed').length,
    completed: issues.filter(i => i.status === 'Completed').length,
  };

  const handleStatusUpdate = async (issueId, status) => {
    setUpdating(true);
    try {
      await api.updateIssue(issueId, { status });
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
      setAssignForm({ labourId: '', note: '' });
      setSelectedIssue(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const statusColor = (status) => {
    if (status === 'Resolved' || status === 'Completed') return 'bg-[#00c896]/15 text-[#006c4f]';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700';
    if (status === 'Rejected') return 'bg-red-100 text-red-700';
    return 'bg-[#eef6ef] text-[#3c4a43]';
  };

  const priorityColor = (p) => {
    if (p === 'Urgent') return 'text-red-600 bg-red-50';
    if (p === 'High') return 'text-orange-600 bg-orange-50';
    return 'text-[#006c4f] bg-[#eef6ef]';
  };

  return (
    <div className="space-y-8 animate-fade-in-up" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[#006c4f] font-label-bold text-[11px] uppercase tracking-widest block mb-1">Administration</span>
          <h1 className="font-display-lg text-[34px] md:text-[44px] text-[#161d1a] leading-[1] tracking-[-0.04em]">Admin Dashboard</h1>
          <p className="text-[#3c4a43] text-sm opacity-70 mt-2 font-medium tracking-[-0.01em]">Manage civic issues, assign labour, and monitor resolutions.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#bbcac1]/30 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#006c4f] flex items-center justify-center text-white font-bold text-xs">
            {currentUser?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#161d1a] leading-none">{currentUser?.name}</p>
            <p className="text-[10px] text-[#006c4f] font-bold uppercase tracking-wider">Administrator</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: stats.total, icon: 'folder_open', color: 'text-[#006c4f]', bg: 'bg-[#eef6ef]' },
          { label: 'Pending', value: stats.pending, icon: 'schedule', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'In Progress', value: stats.inProgress, icon: 'engineering', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resolved', value: stats.resolved, icon: 'check_circle', color: 'text-[#00c896]', bg: 'bg-[#00c896]/10' },
        ].map(s => (
          <div key={s.label} className="bg-white/90 backdrop-blur-md rounded-[1.75rem] p-6 shadow-sm border border-white/60 hover:shadow-lg transition-all group">
            <div className={`w-11 h-11 ${s.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <span className={`material-symbols-outlined ${s.color} text-xl`}>{s.icon}</span>
            </div>
            <p className="text-[36px] font-display-lg font-black text-[#161d1a] leading-none tracking-[-0.05em]">{s.value}</p>
            <p className="text-[11px] font-semibold text-[#6c7a72] uppercase tracking-[0.28em] mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Issues Table */}
        <div className="xl:col-span-2 bg-white/90 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/60 overflow-hidden">
          <div className="p-6 border-b border-[#eef6ef] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <h2 className="font-display-lg text-[18px] text-[#161d1a] font-extrabold tracking-[-0.03em]">Issue Reports</h2>
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#bbcac1] text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-[#eef6ef] border-none rounded-xl pl-9 pr-4 py-2 text-sm text-[#161d1a] focus:ring-2 focus:ring-[#006c4f] w-48"
                />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-[#eef6ef] border-none rounded-xl px-4 py-2 text-sm text-[#161d1a] pr-8 focus:ring-2 focus:ring-[#006c4f]"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] text-sm">expand_more</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#eef6ef] max-h-[520px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-[#bbcac1]">
                <span className="material-symbols-outlined text-5xl block mb-2">inbox</span>
                <p className="text-sm font-bold">No issues match your filter</p>
              </div>
            ) : filtered.map((issue, index) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`p-5 flex items-start gap-4 cursor-pointer hover:bg-[#f3fbf5] transition-all ${selectedIssue?.id === issue.id ? 'bg-[#eef6ef]' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#eef6ef] flex-shrink-0 overflow-hidden ring-1 ring-[#bbcac1]/20 relative">
                  <img src={getRelevantImage(issue.title, issue.description, issue.department, `thumb:${issue.id}`)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center rounded-full bg-[#006c4f]/10 text-[#006c4f] text-[10px] font-black px-2 py-0.5 tracking-[0.22em] flex-shrink-0">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="font-bold text-[#161d1a] text-sm truncate tracking-[-0.02em]">{issue.title}</p>
                  </div>
                  <p className="text-[11px] text-[#6c7a72] mt-0.5 font-medium">{issue.area} · {issue.department} · {issue.id}</p>
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
            <h2 className="font-display-lg text-[16px] text-[#161d1a] font-extrabold tracking-[-0.03em] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4f]">engineering</span>
              Assign Labour
            </h2>
            {selectedIssue ? (
              <div className="space-y-4">
                <div className="flex bg-[#eef6ef] rounded-xl p-1">
                  <button onClick={() => setActiveTab('assign')} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'assign' ? 'bg-white text-[#006c4f] shadow-sm' : 'text-[#6c7a72]'}`}>Update Status</button>
                  <button onClick={() => setActiveTab('history')} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'history' ? 'bg-white text-[#006c4f] shadow-sm' : 'text-[#6c7a72]'}`}>Audit Trail</button>
                  <button onClick={() => setActiveTab('chat')} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'chat' ? 'bg-white text-[#006c4f] shadow-sm' : 'text-[#6c7a72]'}`}>Conversation</button>
                </div>

                {activeTab === 'assign' ? (
                  <form onSubmit={handleAssign} className="space-y-4">
                    <div className="bg-[#eef6ef] rounded-2xl p-4">
                      <p className="font-bold text-[#161d1a] text-sm line-clamp-2 tracking-[-0.02em]">{selectedIssue.title}</p>
                      <p className="text-[11px] text-[#6c7a72] mt-1 font-medium">{selectedIssue.area} · {selectedIssue.department} · {selectedIssue.id}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#3c4a43] uppercase tracking-wide">Assign Worker</label>
                      <div className="relative">
                        <select
                          required
                          value={assignForm.labourId}
                          onChange={e => setAssignForm(p => ({ ...p, labourId: e.target.value }))}
                          className="w-full bg-[#eef6ef] border-none rounded-xl p-3 text-sm pr-8 focus:ring-2 focus:ring-[#006c4f]"
                        >
                          <option value="">Select worker...</option>
                          {(labour || []).map(l => (
                            <option key={l.id} value={l.id}>{l.name} {l.phone ? `(${l.phone})` : ''} — {l.department}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] text-sm">expand_more</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#3c4a43] uppercase tracking-wide">Admin Note</label>
                      <textarea
                        rows="3"
                        value={assignForm.note}
                        onChange={e => setAssignForm(p => ({ ...p, note: e.target.value }))}
                        className="w-full bg-[#eef6ef] border-none rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-[#006c4f]"
                        placeholder="Add a note for the field worker..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#3c4a43] uppercase tracking-wide">Quick Status Update</label>
                      <div className="relative">
                        <select
                          onChange={e => handleStatusUpdate(selectedIssue.id, e.target.value)}
                          value={selectedIssue.status}
                          className="w-full bg-[#eef6ef] border-none rounded-xl p-3 text-sm pr-8 focus:ring-2 focus:ring-[#006c4f]"
                        >
                          {['Pending', 'In Progress', 'Resolved', 'Completed', 'Rejected'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#161d1a] text-sm">expand_more</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSelectedIssue(null)} className="flex-1 py-3 rounded-xl border border-[#bbcac1] text-[#3c4a43] text-sm font-bold hover:bg-[#f3fbf5] transition-all">Cancel</button>
                      <button type="submit" disabled={updating} className="flex-1 py-3 rounded-xl bg-[#006c4f] text-white text-sm font-bold hover:bg-[#005040] transition-all disabled:opacity-50">{updating ? 'Saving...' : 'Assign & Save'}</button>
                    </div>
                  </form>
                ) : activeTab === 'history' ? (
                  <div className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                      {(selectedIssue.history || []).length === 0 ? (
                        <div className="py-8 text-center text-[#bbcac1]">
                          <span className="material-symbols-outlined text-3xl block mb-2">history</span>
                          <p className="text-[11px] font-bold">No assignment history yet</p>
                        </div>
                      ) : selectedIssue.history.map((h, idx) => (
                        <div key={idx} className="relative pl-6 pb-4 border-l-2 border-[#eef6ef] last:pb-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#00c896]"></div>
                          <p className="text-[10px] font-bold text-[#006c4f] uppercase tracking-wider leading-none">{new Date(h.assigned_at).toLocaleString()}</p>
                          <p className="text-[12px] font-bold text-[#161d1a] mt-1">
                            {h.labourName ? `Assigned to ${h.labourName}` : 'Status Changed'}
                            {h.labourPhone && <span className="ml-2 text-[#006c4f] font-normal text-[11px]">— {h.labourPhone}</span>}
                          </p>
                          <p className="text-[11px] text-[#6c7a72] mt-1 italic">"{h.note}"</p>
                          <p className="text-[9px] text-[#bbcac1] mt-1">Updated by {h.adminName}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('assign')} className="w-full py-3 rounded-xl border border-[#006c4f] text-[#006c4f] text-sm font-bold hover:bg-[#eef6ef] transition-all">Back to Actions</button>
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                      {loadingChat ? (
                        <p className="text-center text-[#bbcac1] py-10 text-[11px] animate-pulse">Loading conversation...</p>
                      ) : messages.length === 0 ? (
                        <div className="py-12 text-center text-[#bbcac1]">
                          <span className="material-symbols-outlined text-4xl block mb-2">forum</span>
                          <p className="text-[11px] font-bold">No messages yet. Start the conversation!</p>
                        </div>
                      ) : messages.map((m, idx) => (
                        <div key={idx} className={`flex flex-col ${m.sender_id === currentUser.id ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl text-[12px] ${
                            m.sender_id === currentUser.id ? 'bg-[#006c4f] text-white rounded-tr-none' : 'bg-[#eef6ef] text-[#161d1a] rounded-tl-none'
                          }`}>
                            <p className="font-medium leading-relaxed">{m.message}</p>
                          </div>
                          <p className="text-[9px] text-[#bbcac1] mt-1 px-1">
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
                        className="w-full bg-[#eef6ef] border-none rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-[#006c4f] outline-none"
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#006c4f] text-white rounded-xl flex items-center justify-center hover:bg-[#005040] transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-[#bbcac1]">
                <span className="material-symbols-outlined text-4xl block mb-2">touch_app</span>
                <p className="text-sm font-bold">Select an issue from the list to assign a worker</p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/60 p-6">
            <h2 className="font-display-lg text-[16px] text-[#161d1a] font-extrabold tracking-[-0.03em] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4f]">notifications</span>
              Recent Alerts
              {notifications?.filter(n => !n.read).length > 0 && (
                <span className="ml-auto bg-[#00c896] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{notifications.filter(n => !n.read).length} new</span>
              )}
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(notifications || []).length === 0 ? (
                <p className="text-center text-[#bbcac1] text-sm py-6">No notifications</p>
              ) : notifications.slice(0, 8).map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white hover:shadow-sm group ${n.read ? 'opacity-50' : 'bg-[#eef6ef]'}`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-[#bbcac1]' : 'bg-[#00c896]'}`}></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#161d1a] truncate group-hover:text-[#006c4f]">{n.title || 'New Issue Submitted'}</p>
                    <p className="text-[11px] text-[#6c7a72] mt-0.5">{n.message || n.body || ''}</p>
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