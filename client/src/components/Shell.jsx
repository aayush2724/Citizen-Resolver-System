import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "report", label: "Report Issue", citizenOnly: true },
  { id: "my", label: "My Issues", citizenOnly: true },
  { id: "public", label: "Public Issues" },
  { id: "dashboard", label: "Dashboard", adminOnly: true },
  { id: "feedback", label: "Report Bug" },
];

function AppHeader({ activePage, setActivePage, currentUser, unreadCount, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-10 py-4 shadow-xl rounded-full flex justify-between items-center w-[90%] max-w-[1200px] h-16 transition-all duration-500 ${
      scrolled
        ? 'bg-[#FAF7F2]/92 backdrop-blur-xl border border-[#342721]/10 shadow-[0_8px_32px_rgba(52,39,33,0.12)]'
        : 'bg-transparent border border-transparent shadow-none'
    }`}>
      <div className="flex items-center gap-12">
        <button
          className="flex items-center gap-2"
          onClick={() => setActivePage("home")}
          type="button"
        >
          <span
            className={`font-extrabold text-lg transition-colors duration-500 ${scrolled ? 'text-[#342721]' : 'text-white'}`}
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Citizen Resolver System
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.filter((item) => {
            if (item.adminOnly) return currentUser?.role === "admin";
            if (item.citizenOnly) return currentUser?.role === "citizen";
            return true;
          }).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              className={`text-sm font-bold tracking-tight transition-all relative ${
                scrolled ? 'text-[#342721]' : 'text-white/80'
              } ${activePage === item.id ? 'after:absolute after:-bottom-[10px] after:left-0 after:right-0 after:h-[2px] after:bg-[#E8C97A]' : ''}`}
            >
              {item.label}
              {item.id === "my" && unreadCount > 0 && (
                <span className="bg-primary text-white text-[11px] px-2 py-0.5 rounded-full leading-none font-black shadow-sm ml-2">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          className={`relative transition-colors ${scrolled ? 'text-[#342721]' : 'text-white/80'}`}
          onClick={() => setActivePage("my")}
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full border border-white"></span>
          )}
        </button>

        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-xs border border-outline-variant/30">
              {currentUser.name?.[0]?.toUpperCase()}
            </div>
            <button
              className="text-on-surface-variant hover:text-error transition-colors"
              onClick={onLogout}
              title="Sign Out"
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>logout</span>
            </button>
          </div>
        ) : (
          <button
            className={`text-sm font-bold transition-colors ${scrolled ? 'text-[#342721]' : 'text-white'}`}
            onClick={() => setActivePage("auth")}
            type="button"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

function AppFooter() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/30 py-12 px-margin-desktop mt-auto">
      <div className="max-w-max-width mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-headline-md font-extrabold text-on-surface tracking-tighter text-lg">Citizen Resolver System</p>
          <p className="font-body-md text-label-md text-on-surface-variant">© 2024 Citizen Resolver System. Empowering communities through transparency.</p>
        </div>
        <div className="flex gap-8">
          <a className="text-on-surface-variant hover:text-primary transition-all text-label-md font-black uppercase tracking-widest" href="#">Privacy Policy</a>
          <a className="text-on-surface-variant hover:text-primary transition-all text-label-md font-black uppercase tracking-widest" href="#">Terms of Service</a>
          <a className="text-on-surface-variant hover:text-primary transition-all text-label-md font-black uppercase tracking-widest" href="#">Support</a>
        </div>
      </div>
    </footer>
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

  useEffect(() => { setDrawerOpen(false); }, [activePage]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-body-md text-on-surface selection:bg-primary-container">
      <AppHeader
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        unreadCount={unreadCount}
        onLogout={onLogout}
      />

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-72 bg-surface-container-lowest border-l border-outline-variant/30 flex flex-col shadow-2xl transition-transform duration-500 ${drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-outline-variant/20">
          <span className="font-extrabold text-on-surface" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Navigation
          </span>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container"
            onClick={() => setDrawerOpen(false)}
          >
            <X size={18} className="text-on-surface-variant" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
          {NAV_ITEMS.filter((item) => {
            if (item.adminOnly) return currentUser?.role === "admin";
            if (item.citizenOnly) return currentUser?.role === "citizen";
            return true;
          }).map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all text-left ${activePage === item.id
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-outline-variant/20">
          {currentUser ? (
            <button
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-error hover:bg-red-50 transition-all"
              onClick={onLogout}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
              Sign Out
            </button>
          ) : (
            <button
              className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all"
              onClick={() => setActivePage("auth")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Page content */}
      <main className="flex-grow pt-16 relative">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
