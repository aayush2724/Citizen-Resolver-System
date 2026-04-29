import { useState, useEffect } from "react";
import {
  Bell,
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
];

function Logo({ onClick }) {
  return (
    <button className="flex items-center gap-3 text-left" type="button" onClick={onClick}>
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00b87c] text-white shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </span>
      <div>
        <strong className="block text-lg font-black text-white leading-tight">
          Citizen Resolver
        </strong>
        <span className="block text-[10px] font-bold tracking-wider text-[#00b87c] uppercase">
          Transparent civic tracking
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
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo onClick={() => navigate("home")} />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const active = activePage === item.id;
              return (
                <button
                  className={`text-sm font-semibold transition ${
                    active ? "text-[#00b87c]" : "text-slate-400 hover:text-white"
                  }`}
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                >
                  {item.label}
                  {item.id === "my" && unreadCount > 0 && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#00b87c] text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side: user actions + hamburger */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-white">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">
                    {currentUser.city}{currentUser.block ? `, ${currentUser.block}` : ""}
                  </p>
                </div>
                <button
                  className="relative text-slate-400 hover:text-white transition"
                  onClick={() => navigate("my")}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-[#00b87c] ring-2 ring-[#0a0a0a]" />
                  )}
                </button>
                <button
                  className="hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition group"
                  title="Sign Out"
                  onClick={onLogout}
                >
                  <LogOut size={18} className="group-hover:text-red-400" />
                </button>
              </>
            ) : (
              <button
                className="hidden lg:block rounded-lg bg-[#00b87c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#009665]"
                onClick={() => navigate("auth")}
              >
                Login
              </button>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white transition"
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#111111] border-l border-white/10 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Logo onClick={() => navigate("home")} />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-left transition ${
                  active
                    ? "bg-[#00b87c]/15 text-[#00b87c]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => navigate(item.id)}
              >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.id === "my" && unreadCount > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#00b87c] text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Drawer footer: user info + logout / login */}
        <div className="px-3 py-4 border-t border-white/10">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00b87c]/20 text-[#00b87c] text-sm font-black">
                {currentUser.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition"
                title="Sign Out"
                onClick={() => { setDrawerOpen(false); onLogout(); }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              className="w-full rounded-xl bg-[#00b87c] py-3 text-sm font-bold text-white transition hover:bg-[#009665]"
              onClick={() => navigate("auth")}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* ── Page content ── */}
      <main className={activePage === "home" ? "" : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"}>
        {children}
      </main>
    </div>
  );
}