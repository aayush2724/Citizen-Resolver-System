import {
  Bell,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogIn,
  PlusCircle,
  User,
} from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "report", label: "Report Issue", icon: PlusCircle },
  { id: "my", label: "My Issues", icon: User },
  { id: "public", label: "Public Issues", icon: ClipboardList },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Shell({
  activePage,
  setActivePage,
  currentUser,
  unreadCount,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button
            className="flex items-center gap-3 text-left"
            type="button"
            onClick={() => setActivePage("home")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00b87c] text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
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
                  onClick={() => setActivePage(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-6">
            {currentUser ? (
              <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-white">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentUser.city}{currentUser.block ? `, ${currentUser.block}` : ""}
                  </p>
                </div>
                <button
                  className="relative text-slate-400 hover:text-white transition"
                  onClick={() => setActivePage("my")}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-[#00b87c] ring-2 ring-[#0a0a0a]"></span>
                  )}
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition">
                  <User size={20} />
                </button>
              </div>
            ) : (
              <button
                className="rounded-lg bg-[#00b87c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#009665]"
                onClick={() => setActivePage("auth")}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={activePage === "home" ? "" : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"}>
        {children}
      </main>
    </div>
  );
}

