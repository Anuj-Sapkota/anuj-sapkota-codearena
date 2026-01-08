"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../lib/store/store";
import { setLogout as logoutAction } from "../../lib/store/features/authSlice";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { FiSearch, FiBell, FiUser, FiSettings, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const pathname = usePathname();

  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowProfileOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-dark border-b border-muted px-6 flex items-center justify-between h-16 relative z-50">
      {/* LEFT SIDE */}
      <div className="flex items-center h-full">
        <Link href="/">
          <Image src={Logo} alt="logo" className="w-28 object-contain" />
        </Link>
        <div className="h-6 w-px bg-muted mx-6" />
        <ul className="flex items-center gap-8 h-full">
          {["Arena", "Problems", "Learn"].map((name) => {
            const href = `/${name.toLowerCase()}`;
            const isActive = pathname === href;
            return (
              <li key={name} className="relative flex items-center h-full">
                <Link
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-light hover:text-primary"
                  }`}
                >
                  {name}
                </Link>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">
        <div className="relative group hidden lg:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-muted/30 border border-muted/50 text-white text-xs rounded-full py-2 pl-10 pr-4 w-40 focus:w-56 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-5">
            <button className="text-light hover:text-primary transition-colors">
              <FiBell size={20} />
            </button>

            {/* PROFILE GROUP */}
            <div className="relative" ref={modalRef}>
              <button
                onClick={() => setShowProfileOptions(!showProfileOptions)}
                className="w-9 h-9 rounded-full overflow-hidden border border-muted hover:border-primary transition-all flex items-center justify-center bg-muted/50"
              >
                {user?.profile_pic_url ? (
                  <Image
                    src={user.profile_pic_url}
                    alt="profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <FiUser size={20} className="text-light" />
                )}
              </button>

              {/* DROPDOWN MODAL */}
              {showProfileOptions && (
                <div className="absolute right-0 mt-3 w-64 bg-[#1a1a1a] border border-muted rounded-xl shadow-2xl py-4 overflow-hidden animate-in fade-in zoom-in duration-150">
                  {/* User Info Header */}
                  <div className="px-5 pb-3 border-b border-muted/50">
                    <p className="text-white text-sm font-bold truncate">
                      {user?.full_name}
                    </p>
                    <p className="font-code text-primary text-[10px] uppercase tracking-wider">
                      {user?.role || "user"}
                    </p>
                  </div>

                  {/* Menu Links */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-5 py-2.5 text-light hover:bg-muted/30 hover:text-white transition-colors text-sm"
                    >
                      <FiUser size={16} /> My Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-5 py-2.5 text-light hover:bg-muted/30 hover:text-white transition-colors text-sm"
                    >
                      <FiSettings size={16} /> Settings
                    </Link>
                  </div>

                  {/* Logout Action */}
                  <div className="px-2 pt-2 border-t border-muted/50">
                    <button
                      onClick={() => dispatch(logoutAction())}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                    >
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-light text-sm">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-primary text-darkest font-bold px-4 py-2 rounded text-sm hover:brightness-110 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
