import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function MobileNav({ currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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

  const navItems = [
    { to: "/", label: "Home", icon: "home" },
    { to: "/report", label: "Report Issue", icon: "add_circle" },
    { to: "/my-issues", label: "My Issues", icon: "assignment" },
    { to: "/public-issues", label: "Public Issues", icon: "public" },
    { to: "/report-bug", label: "Report Bug", icon: "bug_report" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#101826] shadow-sm border border-[#7E8AA9]/20 dark:border-white/10"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined text-[#1F345E] dark:text-[#EAF2FF]">
          menu
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white dark:bg-[#161d1a] z-50 md:hidden flex flex-col p-6 shadow-xl transform transition-transform duration-300 ease-out">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg text-[#1F345E] dark:text-[#EAF2FF]">Menu</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E0EDF8] dark:hover:bg-[#2a322e]"
              >
                <span className="material-symbols-outlined text-[#7E8AA9]">close</span>
              </button>
            </div>
            
            <nav className="flex flex-col gap-2">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#1F345E] text-white' 
                        : 'text-[#161d1a] dark:text-[#EAF2FF] hover:bg-[#E0EDF8] dark:hover:bg-[#2a322e]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              
              {currentUser?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#1F345E] text-white' 
                        : 'text-[#161d1a] dark:text-[#EAF2FF] hover:bg-[#E0EDF8] dark:hover:bg-[#2a322e]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  Dashboard
                </NavLink>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-[#7E8AA9]/20 space-y-2">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#161d1a] dark:text-[#EAF2FF] hover:bg-[#E0EDF8] dark:hover:bg-[#2a322e]"
              >
                <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <span className="material-symbols-outlined">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}