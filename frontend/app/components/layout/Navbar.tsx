"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../lib/store/store";
import { setLogout as logoutAction } from "../../lib/store/features/authSlice";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { FiSearch, FiBell, FiUser, FiLogOut, FiSettings } from "react-icons/fi";

import Modal from "@/app/components/ui/Modal";
import LoginForm from "@/app/components/auth/LoginForm";
import RegisterForm from "@/app/components/auth/RegisterForm";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  //---------------------Hooks-----------------------
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [activeModal, setActiveModal] = useState<"login" | "register" | null>(
    null
  );

  const modalRef = useRef<HTMLDivElement>(null);

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

  const closeModals = () => setActiveModal(null);

  return (
    <nav className="bg-white/90 border-b border-gray-100 px-8 flex items-center justify-between h-16 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
      {/* LEFT SIDE */}
      <div className="flex items-center h-full">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <Image src={Logo} alt="logo" className="w-24 object-contain" />
        </Link>

        <div className="h-4 w-px bg-gray-200 mx-8" />
        {/* Pages names */}
        <ul className="flex items-center gap-10 h-full">
          {["Explore", "Problems", "Learn"].map((name) => {
            const href = `/${name.toLowerCase()}`;
            const isActive = pathname.startsWith(href);
            return (
              <li key={name} className="relative flex items-center h-full">
                <Link
                  href={href}
                  className={`text-sm font-bold tracking-tight transition-all duration-300 ${
                    isActive
                      ? "text-primary-1 scale-105"
                      : "text-slate-500 hover:text-primary-1"
                  }`}
                >
                  {name}
                </Link>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-1 rounded-t-full shadow-[0_-4px_10px_rgba(var(--primary-rgb),0.4)] animate-in slide-in-from-bottom-1" />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        {/* Search Bar - Elevated Shadow */}
        <div className="relative group hidden lg:block">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-1 transition-colors" />
          <input
            type="text"
            placeholder="Search everything..."
            className="bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-2xl py-2 pl-10 pr-4 w-48 focus:w-64 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-1/10 focus:border-primary-1/50 transition-all duration-500 shadow-inner"
          />
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            {/* Notification Bell - Gold/Yellow Theme */}
            <button className="relative p-2.5 rounded-xl text-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all duration-300 group">
              <FiBell
                size={22}
                className="fill-current group-hover:rotate-12 transition-transform"
              />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="relative" ref={modalRef}>
              <button
                onClick={() => setShowProfileOptions(!showProfileOptions)}
                className={`flex items-center gap-2 p-1 pr-3 rounded-full transition-all duration-300 border ${
                  showProfileOptions
                    ? "bg-white border-primary-1/20 shadow-lg -translate-y-px" // elevate when profile options is shown
                    : "bg-gray-50 border-transparent hover:border-gray-200 shadow-sm"
                }`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.profile_pic_url ? (
                    <Image
                      src={user.profile_pic_url}
                      alt="profile"
                      width={256}
                      height={256}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FiUser
                      size={18}
                      className="m-auto mt-1.5 text-slate-500"
                    />
                  )}
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                    Account
                  </span>
                  <span className="text-xs font-bold text-slate-700">Menu</span>
                </div>
              </button>

              {/* Enhanced Dropdown with Premium Shadow */}
              {showProfileOptions && (
                <div className="absolute right-0 mt-4 w-64 bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-3 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
                  <div className="px-3 space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-primary-1/5 hover:text-primary-1 rounded-2xl transition-all text-sm font-bold"
                    >
                      <FiUser size={18} className="opacity-70" /> My Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-primary-1/5 hover:text-primary-1 rounded-2xl transition-all text-sm font-bold"
                    >
                      <FiSettings size={18} className="opacity-70" /> Settings
                    </Link>
                  </div>

                  <div className="mx-4 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => dispatch(logoutAction())} //logout
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-sm font-black"
                    >
                      <FiLogOut size={18} /> LOGOUT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal("login")}
              className="text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveModal("register")}
              className="bg-primary-1 text-white font-extrabold px-6 py-2.5 rounded-2xl text-sm shadow-[0_10px_20px_-5px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_15px_25px_-5px_rgba(var(--primary-rgb),0.4)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      {/* AUTH MODALS */}
      <Modal isOpen={activeModal === "login"} onClose={closeModals}>
        <LoginForm
          onSuccess={closeModals}
          onSwitch={() => setActiveModal("register")}
        />
      </Modal>

      <Modal isOpen={activeModal === "register"} onClose={closeModals}>
        <RegisterForm
          onSuccess={closeModals}
          onSwitch={() => setActiveModal("login")}
        />
      </Modal>
    </nav>
  );
}
