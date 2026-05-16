import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formattedRole = user?.role?.replace(/_/g, " ");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .sb-navbar { font-family: 'Poppins', sans-serif; }
        .sb-wordmark {
          background: linear-gradient(135deg, #6d28d9, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sb-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #a855f7; box-shadow: 0 0 0 2px #e9d5ff;
          flex-shrink: 0; animation: sb-pulse 2s infinite;
        }
        @keyframes sb-pulse {
          0%,100% { box-shadow: 0 0 0 2px #e9d5ff; }
          50%      { box-shadow: 0 0 0 4px #ddd6fe; }
        }
        .sb-nav-link { transition: color 0.2s, background 0.2s; }
        .sb-nav-link:hover { color: #7c3aed !important; background: #f5f3ff !important; }
        .sb-avatar { transition: border-color 0.2s, transform 0.2s; }
        .sb-avatar:hover { border-color: #a855f7 !important; transform: scale(1.05); }
        .sb-logout-btn { transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; }
        .sb-logout-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(124,58,237,0.35) !important; }
        .sb-logout-btn:active { transform: translateY(0); }
        .sb-hamburger-span {
          display: block; width: 22px; height: 2px;
          background: #7c3aed; border-radius: 2px;
          transition: transform 0.3s, opacity 0.3s; transform-origin: center;
        }
        .sb-ham-open .sb-hamburger-span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .sb-ham-open .sb-hamburger-span:nth-child(2) { opacity: 0; }
        .sb-ham-open .sb-hamburger-span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .sb-drawer { transition: transform 0.25s ease, opacity 0.25s ease; }
        .sb-drawer-link { transition: color 0.2s, background 0.2s; }
        .sb-drawer-link:hover { color: #7c3aed !important; background: #f5f3ff !important; }
        .sb-drawer-logout { transition: opacity 0.2s, box-shadow 0.2s; }
        .sb-drawer-logout:hover { opacity: 0.9; box-shadow: 0 4px 14px rgba(124,58,237,0.35) !important; }
      `}</style>

      {/* ── Navbar ── */}
      <nav
        className={`sb-navbar sticky top-0 z-[100] w-full border-b border-[#ede9fe] transition-all duration-300 ${scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_4px_24px_rgba(109,40,217,0.08)]"
            : "bg-white shadow-[0_1px_0_#ede9fe]"
          }`}
      >
        <div className="max-w-[1200px] mx-auto px-7 h-16 flex items-center justify-between gap-4 max-[480px]:px-4">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 no-underline flex-shrink-0">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center shadow-[0_2px_8px_rgba(124,58,237,0.25)]">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="sb-wordmark text-[1.15rem] font-bold tracking-tight">SkillBridge</span>
          </a>

          {/* Desktop right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-[#7c3aed] bg-[#f5f3ff] border border-[#ddd6fe] rounded-full px-3 py-1 capitalize tracking-wide whitespace-nowrap">
                <span className="sb-badge-dot" />
                {formattedRole}
              </span>
            )}

            {user && (
              <div className="sb-avatar hidden md:flex w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] items-center justify-center cursor-pointer border-2 border-[#ddd6fe] flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="sb-logout-btn hidden md:inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-white bg-gradient-to-br from-[#7c3aed] to-[#a855f7] border-none rounded-[10px] px-[18px] py-2 cursor-pointer shadow-[0_2px_8px_rgba(124,58,237,0.3)] whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            )}

            {/* Hamburger */}
            <button
              className={`md:hidden flex flex-col gap-[5px] cursor-pointer p-1 bg-transparent border-none rounded-md hover:bg-[#f5f3ff] ${menuOpen ? "sb-ham-open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className="sb-hamburger-span" />
              <span className="sb-hamburger-span" />
              <span className="sb-hamburger-span" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        className={`sb-drawer md:hidden fixed top-16 left-0 right-0 z-[99] bg-white/[0.98] backdrop-blur-md border-b border-[#ede9fe] shadow-[0_8px_24px_rgba(109,40,217,0.1)] px-6 pt-4 pb-6 ${menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
      >

        {user && (
          <>
            <div className="h-px bg-[#ede9fe] my-2 mb-4" />

            {/* User row */}
            <div className="flex items-center gap-3 pb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center border-2 border-[#ddd6fe] flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.9rem] font-semibold text-[#1f2937]">My Account</div>
                <div className="text-[0.75rem] text-[#7c3aed] capitalize font-medium">{formattedRole}</div>
              </div>
            </div>

            {/* Drawer logout */}
            <button
              onClick={handleLogout}
              className="sb-drawer-logout flex items-center justify-center gap-2 w-full text-[0.88rem] font-semibold text-white bg-gradient-to-br from-[#7c3aed] to-[#a855f7] border-none rounded-xl py-[11px] cursor-pointer shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;