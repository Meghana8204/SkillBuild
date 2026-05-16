import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const sidebarLinks = {
  student: [
    {
      to: "/student/dashboard", label: "Dashboard",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
  ],
  trainer: [
    {
      to: "/trainer/dashboard", label: "Dashboard",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
    {
      to: "/trainer/sessions", label: "Sessions",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
  ],
  institution: [
    {
      to: "/institution/dashboard", label: "Dashboard",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
    {
      to: "/institution/batches", label: "Batches",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    },
    {
      to: "/institution/trainers", label: "Trainers",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    },
  ],
  programme_manager: [
    {
      to: "/manager/dashboard", label: "Dashboard",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
  ],
  monitoring_officer: [
    {
      to: "/monitor/dashboard", label: "Dashboard",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
  ],
};

const roleLabels = {
  student: "Student",
  trainer: "Trainer",
  institution: "Institution",
  programme_manager: "Programme Manager",
  monitoring_officer: "Monitoring Officer",
};

const roleColors = {
  student:            { bg: "#f5f3ff", color: "#6d28d9" },
  trainer:            { bg: "#eff6ff", color: "#1d4ed8" },
  institution:        { bg: "#f0fdf4", color: "#15803d" },
  programme_manager:  { bg: "#fffbeb", color: "#92400e" },
  monitoring_officer: { bg: "#fef2f2", color: "#b91c1c" },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .sb-root * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }

  .sb-root {
    width: 240px;
    background: white;
    height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #f0eeff;
    box-shadow: 2px 0 16px rgba(109, 40, 217, 0.06);
    flex-shrink: 0;
  }

  @media (max-width: 768px) { .sb-root { display: none; } }

  /* Logo area */
  .sb-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid #f3f0ff;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .sb-logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .sb-logo-name {
    font-size: 17px; font-weight: 800;
    color: #5b21b6; letter-spacing: -0.3px;
  }

  /* Nav section */
  .sb-nav {
    flex: 1;
    padding: 20px 12px;
    overflow-y: auto;
  }

  .sb-nav-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.9px; color: #c4b5fd;
    padding: 0 10px; margin-bottom: 8px;
  }

  .sb-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    margin-bottom: 2px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    transition: all 0.18s ease;
    position: relative;
  }

  .sb-link:hover {
    background: #f5f3ff;
    color: #5b21b6;
  }

  .sb-link.active {
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    color: #5b21b6;
    font-weight: 600;
  }

  .sb-link.active::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 20px;
    border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, #7c3aed, #a855f7);
  }

  .sb-link-icon {
    flex-shrink: 0;
    opacity: 0.6;
    transition: opacity 0.18s;
  }

  .sb-link:hover .sb-link-icon,
  .sb-link.active .sb-link-icon {
    opacity: 1;
  }

  /* Divider */
  .sb-divider {
    height: 1px;
    background: #f3f0ff;
    margin: 8px 12px 16px;
  }

  /* User profile footer */
  .sb-footer {
    padding: 16px 12px;
    border-top: 1px solid #f3f0ff;
    flex-shrink: 0;
  }

  .sb-user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 10px;
    border-radius: 12px;
    background: #f9f7ff;
    border: 1px solid #ede9fe;
  }

  .sb-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 14px; font-weight: 700; flex-shrink: 0;
  }

  .sb-user-name {
    font-size: 13px; font-weight: 600; color: #111827;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .sb-role-pill {
    display: inline-block;
    font-size: 10px; font-weight: 600;
    border-radius: 20px; padding: 2px 8px;
    margin-top: 2px;
  }
`;

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const links = sidebarLinks[user.role] || [];
  const roleColor = roleColors[user.role] || roleColors.student;
  const initial = (user.name || user.email || "U")[0].toUpperCase();

  return (
    <>
      <style>{styles}</style>
      <aside className="sb-root">
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/>
              <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M2 12l10 5 10-5" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span className="sb-logo-name">SkillBridge</span>
        </div>

        {/* Nav links */}
        <nav className="sb-nav">
          <p className="sb-nav-label">Navigation</p>
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`sb-link${isActive ? " active" : ""}`}
              >
                <span className="sb-link-icon">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="sb-footer">
          <div className="sb-user-card">
            <div className="sb-avatar">{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-user-name">{user.name || user.email}</div>
              <span
                className="sb-role-pill"
                style={{ background: roleColor.bg, color: roleColor.color }}
              >
                {roleLabels[user.role] || user.role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;