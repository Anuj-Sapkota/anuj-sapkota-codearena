"use client";

import { logout } from "@/app/lib/auth";
import { setLogout } from "@/app/lib/store/features/authSlice";
import { useDispatch } from "react-redux";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    await logout();
    dispatch(setLogout());

    window.location.href = "/login";
  };

  return (
    <button onClick={handleLogout} className="text-red-500 hover:underline">
      Logout
    </button>
  );
};

export default LogoutButton;
