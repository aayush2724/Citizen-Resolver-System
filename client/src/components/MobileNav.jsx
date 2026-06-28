import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function MobileNav({ currentUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-[#8B7355]/20"
        aria-label="Open menu"
        data-testid="mobile-nav-open"
      >
        <span className="material-symbols-outlined text-[#342721]">
          menu
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 md:hidden flex flex-col p-6 shadow-xl transform transition-transform duration-300 ease-out" data-testid="mobile-nav-drawer">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg text-[#342721]">Menu</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#DDC5A3]"
              >
                <span className="material-symbols-outlined text-[#8B7355]">close</span>
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
                        ? 'bg-[#342721] text-white' 
                        : 'text-[#342721] hover:bg-[#DDC5A3]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              
              {currentUser?.role === 'admin' && (
                <>
                  <NavLink
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? 'bg-[#342721] text-white' 
                          : 'text-[#342721] hover:bg-[#DDC5A3]'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">dashboard</span>
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/analytics"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? 'bg-[#342721] text-white' 
                          : 'text-[#342721] hover:bg-[#DDC5A3]'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">analytics</span>
                    Analytics
                  </NavLink>
                </>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-[#8B7355]/20 space-y-2">
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
