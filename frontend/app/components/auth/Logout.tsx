"use client";

import { logout } from "@/app/lib/auth";

const LogoutButton = () => {


  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-500 hover:underline"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
