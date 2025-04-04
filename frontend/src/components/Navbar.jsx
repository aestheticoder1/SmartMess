import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-md bg-white sticky top-0 z-50">
      {/* Left: SmartMess Logo */}
      <h1
        className="text-2xl font-semibold cursor-pointer"
        onClick={() => navigate("/")}
      >
        SmartMess
      </h1>

      {/* Right: Profile Icon */}
      <FaUserCircle
        size={30}
        className="text-gray-700 cursor-pointer"
        onClick={handleProfileClick}
      />
    </nav>
  );
};

export default Navbar;
