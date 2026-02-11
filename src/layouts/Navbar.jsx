import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(sessionStorage.getItem("user"));
      setUser(userData);
    } catch (e) {
      console.error("Failed to parse user data", e);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch((err) => console.warn("Server logout failed:", err));
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg z-50">
      {/* Logo Section */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate("/starter")}
      >
        <div className="bg-white p-2 rounded-xl shadow-lg shadow-teal-900/10 group-hover:scale-105 transition-transform duration-300">
          <Icon icon="fluent:tooth-24-filled" className="text-teal-600 w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-xl text-white tracking-tight leading-none">
            Dental Health Net
          </h1>
          <span className="text-[10px] text-blue-50 tracking-wider uppercase font-medium mt-0.5">
            Your Smile, Our Priority
          </span>
        </div>
      </div>

      {/* User / Actions Section */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4 pl-6 border-l border-white/20">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs text-blue-100 font-medium tracking-wide">Welcome back</span>
              <span className="text-sm font-bold text-white max-w-[150px] truncate leading-tight">{user.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-white font-bold shadow-inner">
                {user.name ? user.name.charAt(0).toUpperCase() : <Icon icon="mdi:account" />}
              </div>

              <button
                onClick={handleLogout}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-white text-teal-600 hover:bg-red-50 hover:text-red-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                title="Logout"
                aria-label="Logout"
              >
                <Icon icon="tabler:logout" width="20" height="20" className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-white text-teal-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all transform hover:-translate-y-0.5"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
