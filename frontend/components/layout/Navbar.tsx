"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  FiSearch,
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";

import Logo from "@/public/logo.png";
import Modal from "@/components/ui/Modal";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { logoutThunk } from "@/lib/store/features/auth/auth.actions";
import { AppDispatch, RootState } from "@/lib/store/store";
import { NAV_ITEMS, ROUTES } from "@/constants/routes";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [activeModal, setActiveModal] = useState<"login" | "register" | null>(
    null,
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
    <nav className="bg-white border-b border-slate-200 px-8 flex items-center justify-between h-16 sticky top-0 z-50">
      {/* LEFT SIDE */}
      <div className="flex items-center h-full">
        <Link href={ROUTES.HOME} className="flex items-center">
          <Image
            src={Logo}
            alt="logo"
            className="w-20 object-contain brightness-90"
          />
        </Link>

        {/* Subtle Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 mx-8" />

        <ul className="flex items-center gap-8 h-full">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(`${item.path}/`);

            return (
              <li
                key={item.path}
                className="relative flex items-center h-full group"
              >
                <Link
                  href={item.path}
                  className={`text-[13px] font-bold transition-colors duration-200 ${
                    isActive
                      ? "text-primary-1"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {item.name}
                </Link>

                {/* Stylish Active Underline */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-1" />
                )}
                {/* Hover Underline */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-200 transition-all group-hover:w-full" />
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        {/* Modern Search Bar */}
        <div className="relative group hidden lg:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-1 transition-colors" />
          <input
            type="text"
            placeholder="Search problems..."
            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm py-1.5 pl-9 pr-4 w-44 focus:w-60 focus:outline-none focus:border-primary-1/50 focus:bg-white transition-all duration-300 rounded-sm"
          />
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <FiBell size={20} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-1 rounded-full"></span>
            </button>

            <div className="relative" ref={modalRef}>
              <button
                onClick={() => setShowProfileOptions(!showProfileOptions)}
                className={`flex items-center gap-2 px-2 py-1 transition-all border ${
                  showProfileOptions
                    ? "border-slate-300 bg-slate-50"
                    : "border-transparent hover:border-slate-200"
                } rounded-sm`}
              >
                <div className="w-7 h-7 bg-slate-100 rounded-sm overflow-hidden flex items-center justify-center border border-slate-200">
                  {user?.profile_pic_url ? (
                    <Image
                      src={user.profile_pic_url}
                      alt="profile"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <FiUser size={14} className="text-slate-400" />
                  )}
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {user?.username || "Account"}
                </span>
                <FiChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${showProfileOptions ? "rotate-180" : ""}`}
                />
              </button>

              {/* Clean Dropdown */}
              {showProfileOptions && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 shadow-xl py-1 z-60 rounded-sm">
                  <Link
                    href={ROUTES.MAIN.PROFILE}
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-primary-1 text-sm font-medium"
                  >
                    <FiUser size={16} /> My Profile
                  </Link>
                  <Link
                    href={ROUTES.MAIN.SETTINGS}
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-primary-1 text-sm font-medium"
                  >
                    <FiSettings size={16} /> Settings
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => dispatch(logoutThunk())}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-rose-500 hover:bg-rose-50 text-sm font-bold transition-colors text-left"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveModal("login")}
              className="text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors px-2"
            >
              Log In
            </button>
            <button
              onClick={() => setActiveModal("register")}
              className="bg-slate-900 text-white text-sm font-bold px-5 py-2 hover:bg-slate-800 transition-all rounded-sm shadow-sm active:scale-95"
            >
              Join
            </button>
          </div>
        )}
      </div>

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
