import { useState, useEffect } from "react";
import {
  Bell,
  Bug,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  User,
  X,
} from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "report", label: "Report Issue", icon: PlusCircle },
  { id: "my", label: "My Issues", icon: User },
  { id: "public", label: "Public Issues", icon: ClipboardList },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "feedback", label: "Report Bug", icon: Bug },
];

function Logo({ onClick }) {
  return (
    <button className="flex items-center gap-4 text-left group" type="button" onClick={onClick}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 text-white shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-transform group-hover:scale-110">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </span>
      <div className="flex flex-col">
        <strong className="text-xl font-black tracking-tight text-white leading-none">
          CITIZEN <span className="text-teal-400">RESOLVER</span>
        </strong>
        <span className="mt-1 text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
          Empowering Communities
        </span>
      </div>
    </button>
  );
}

export default function Shell({
  activePage,
  setActivePage,
  currentUser,
  unreadCount,
  onLogout,
  children,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on page change or resize to desktop
  useEffect(() => {
    setDrawerOpen(false);
  }, [activePage]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navigate = (id) => {
    setActivePage(id);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-mesh text-slate-200 selection:bg-teal-500 selection:text-black">
      {/* ── Header ── */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "h-20 border-b border-white/10 bg-[#030303]/70 backdrop-blur-xl" 
            : "h-24 bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo onClick={() => navigate("home")} />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.filter(item => {
              if (item.id === "dashboard") return currentUser?.role === "admin";
              if (item.id === "report" || item.id === "my") return currentUser?.role === "citizen";
              return true;
            }).map((item) => {
              const active = activePage === item.id;
              return (
                <button
                  className={`relative py-2 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 group ${
                    active ? "text-teal-400" : "text-slate-400 hover:text-white"
                  }`}
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-teal-400" />
                  )}
                  {!active && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-teal-400 transition-all duration-300 group-hover:w-full" />
                  )}
                  {item.id === "my" && unreadCount > 0 && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-[10px] font-black text-black pulse-glow">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side: user actions + hamburger */}
          <div className="flex items-center gap-5">
            {currentUser ? (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-black text-white">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-teal-500/70 tracking-widest uppercase">
                    {currentUser.city}{currentUser.block ? ` • ${currentUser.block}` : ""}
                  </p>
                </div>
                
                <button
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-teal-400 transition-all duration-300 hover:border-teal-500/30"
                  onClick={() => navigate("my")}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 block h-2.5 w-2.5 rounded-full bg-teal-400 ring-4 ring-[#030303]" />
                  )}
                </button>

                <button
                  className="hidden lg:flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 transition-all duration-300 hover:border-rose-500/30 group"
                  title="Sign Out"
                  onClick={onLogout}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button
                className="hidden lg:block rounded-2xl bg-gradient-to-r from-teal-400 to-blue-500 px-8 py-3 text-xs font-black uppercase tracking-widest text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] active:scale-95"
                onClick={() => navigate("auth")}
              >
                Sign In
              </button>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-slate-300 hover:text-teal-400 transition-all duration-300"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer backdrop ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-80 bg-[#050505] border-l border-white/10 flex flex-col shadow-2xl transition-transform duration-500 ease-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-6 py-7 border-b border-white/5">
          <Logo onClick={() => navigate("home")} />
          <button
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-2">
          {navItems.filter(item => {
            if (item.id === "dashboard") return currentUser?.role === "admin";
            if (item.id === "report" || item.id === "my") return currentUser?.role === "citizen";
            return true;
          }).map((item) => {
            const active = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  active
                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                onClick={() => navigate(item.id)}
              >
                <Icon size={18} className={`shrink-0 ${active ? "text-teal-400" : "text-slate-500"}`} />
                <span className="flex-1">{item.label}</span>
                {item.id === "my" && unreadCount > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-[10px] font-black text-black">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-8 border-t border-white/5">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 text-black text-sm font-black">
                {currentUser.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentUser.role}</p>
              </div>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-all duration-300"
                title="Sign Out"
                onClick={() => { setDrawerOpen(false); onLogout(); }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              className="w-full rounded-2xl bg-gradient-to-r from-teal-400 to-blue-500 py-4 text-xs font-black uppercase tracking-widest text-black transition-all duration-300 active:scale-95"
              onClick={() => navigate("auth")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* ── Page content ── */}
      <main className={activePage === "home" ? "" : "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"}>
        {children}
      </main>
    </div>
  );
}