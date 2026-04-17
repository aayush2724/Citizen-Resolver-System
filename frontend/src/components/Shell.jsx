import {
  Bell,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogIn,
  Megaphone,
  PlusCircle,
  UserRound,
} from "lucide-react";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "auth", label: "Login / Signup", icon: LogIn },
  { id: "report", label: "Report Issue", icon: PlusCircle },
  { id: "my", label: "My Issues", icon: UserRound },
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <button
            className="flex w-fit items-center gap-3 text-left"
            type="button"
            onClick={() => setActivePage("home")}
          >
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-700 font-black text-white text-lg">
              ✓
            </span>
            <span>
              <strong className="block text-lg font-black text-teal-700">
                Citizen Resolver System
              </strong>
              <span className="block text-xs font-semibold text-slate-500">
                Transparent civic issue tracking
              </span>
            </span>
          </button>

          <nav
            className="flex gap-2 overflow-x-auto pb-1"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;
              return (
                <button
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-black transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
              <Megaphone size={20} />
            </span>
            <div>
              <p className="text-sm font-black text-slate-950">
                Signed in as {currentUser?.name}
              </p>
              <p className="text-sm text-slate-500">
                {currentUser?.role} account · {currentUser?.city}{" "}
                {currentUser?.block && `> ${currentUser.block}`}{" "}
                {currentUser?.area && `> ${currentUser.area}`}
              </p>
            </div>
          </div>
          <button
            className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-700"
            type="button"
            onClick={() => setActivePage("my")}
          >
            <Bell size={16} />
            {unreadCount} unread notifications
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
