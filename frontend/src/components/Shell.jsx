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
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-[900] tracking-tighter text-text-dark leading-none">
            Citizen
          </span>
          <span className="text-2xl font-[900] tracking-tighter text-primary leading-none">
            Resolver
          </span>
          <span className="text-sm font-black tracking-widest text-primary leading-none ml-1 opacity-60">
            SYSTEM
          </span>
        </div>
        <span className="mt-1 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
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

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navigate = (id) => {
    setActivePage(id);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f4eee0] text-[#1a1a1a] selection:bg-primary/20 selection:text-primary">
      {/* ── Header ── */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "h-20 border-b border-black/5 bg-white/80 backdrop-blur-xl" 
            : "h-28 bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <Logo onClick={() => navigate("home")} />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-2 rounded-full bg-black/5 p-1.5 border border-black/5">
            {navItems.filter(item => {
              if (item.id === "dashboard") return currentUser?.role === "admin";
              if (item.id === "report" || item.id === "my") return currentUser?.role === "citizen";
              return true;
            }).map((item) => {
              const active = activePage === item.id;
              return (
                <button
                  className={`relative px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-full ${
                    active ? "bg-white text-text-dark shadow-sm" : "text-slate-500 hover:text-text-dark"
                  }`}
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                >
                  {item.label}
                  {item.id === "my" && unreadCount > 0 && (
                    <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <button
                  className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white border border-black/5 text-slate-400 hover:text-primary transition-all duration-500 shadow-sm"
                  onClick={() => navigate("my")}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-3 right-3 block h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>

                <button
                  className="hidden sm:flex items-center gap-3 rounded-full bg-white pl-2 pr-5 py-2 border border-black/5 shadow-sm hover:border-primary/30 transition-all"
                  onClick={() => navigate("dashboard")}
                >
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-xs">
                    {currentUser.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] font-black text-text-dark leading-none">{currentUser.name}</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{currentUser.role}</p>
                  </div>
                </button>
                
                <button
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-black/5 text-slate-400 hover:text-red-500 transition-all shadow-sm"
                  onClick={onLogout}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button
                className="btn-premium px-8 py-3.5"
                onClick={() => navigate("auth")}
              >
                Sign In
              </button>
            )}

            <button
              className="lg:hidden flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-text-dark shadow-sm"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-[70] h-full w-80 bg-white border-l border-black/5 flex flex-col shadow-2xl transition-transform duration-500 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-8 py-8">
          <Logo onClick={() => navigate("home")} />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:text-text-dark hover:bg-black/5"
            onClick={() => setDrawerOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-6 py-6 flex flex-col gap-2">
          {navItems.filter(item => {
            if (item.id === "dashboard") return currentUser?.role === "admin";
            if (item.id === "report" || item.id === "my") return currentUser?.role === "citizen";
            return true;
          }).map((item) => {
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-4 rounded-2xl px-6 py-4 text-[12px] font-black uppercase tracking-[0.1em] transition-all ${
                  active ? "bg-primary text-white" : "text-slate-500 hover:bg-black/5 hover:text-text-dark"
                }`}
                onClick={() => navigate(item.id)}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-8 py-8 border-t border-black/5">
          {currentUser ? (
             <button className="w-full flex items-center gap-4 text-left" onClick={onLogout}>
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-black">
                   {currentUser.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                   <p className="font-black text-text-dark">{currentUser.name}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sign Out</p>
                </div>
                <LogOut size={18} className="text-slate-300" />
             </button>
          ) : (
            <button className="w-full btn-premium" onClick={() => navigate("auth")}>Sign In</button>
          )}
        </div>
      </div>

      <main className={activePage === "home" ? "" : "mx-auto max-w-7xl px-6 py-16 lg:px-8"}>
        {children}
      </main>
    </div>
  );
}