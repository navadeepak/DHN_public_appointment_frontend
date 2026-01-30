import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState("Name");

  useEffect(() => {
    sessionStorage.getItem("token");
    setUser(JSON.parse(sessionStorage.getItem("user")))
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
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="w-full h-[8vh] flex flex-row items-center justify-between p-5">
      <h1 className="font-bold text-2xl text-white max-lg:hidden">
        Dental Health Net
      </h1>
      <h1 className="font-bold text-2xl text-white hidden max-lg:flex">DHN</h1>
      <div className="h-full w-fit flex flex-row items-center gap-5 rounded-md p-2 text-white">
        <p className="text-xl cursor-default">
          Hello, <span className="font-bold">{user?.name}</span>
        </p>
        <button
          onClick={handleLogout}
          className="rounded-full bg-white text-teal-500 p-2 hover:text-red-500 cursor-pointer transition-colors"
          title="Logout"
          aria-label="Logout"
        >
          <Icon icon="tabler:logout" width="30" height="30" />
        </button>
      </div>
    </div>
  );
}

export default Navbar;
