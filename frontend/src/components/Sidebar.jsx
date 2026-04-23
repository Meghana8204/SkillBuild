import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const sidebarLinks = {
  student: [
    { to: "/student/dashboard", label: "Dashboard" },
  ],
  trainer: [
    { to: "/trainer/dashboard", label: "Dashboard" },
    { to: "/trainer/sessions", label: "Sessions" },
  ],
  institution: [
    { to: "/institution/dashboard", label: "Dashboard" },
    { to: "/institution/batches", label: "Batches" },
    { to: "/institution/trainers", label: "Trainers" },
  ],
  programme_manager: [
    { to: "/manager/dashboard", label: "Dashboard" },
  ],
  monitoring_officer: [
    { to: "/monitor/dashboard", label: "Dashboard" },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;
  const links = sidebarLinks[user.role] || [];
  return (
    <aside className="w-64 bg-white shadow h-full p-6 hidden md:block">
      <div className="mb-8 text-xl font-bold text-purple-700">SkillBridge</div>
      <nav>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`block px-4 py-2 rounded mb-2 hover:bg-purple-50 transition ${location.pathname === link.to ? "bg-purple-100 font-semibold" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
