import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-6 py-3">
      <div className="font-bold text-lg text-purple-700">SkillBridge</div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-gray-700 capitalize">{user.role.replace("_", " ")}</span>
        )}
        {user && (
          <button
            onClick={logout}
            className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
