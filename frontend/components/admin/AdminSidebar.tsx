"use client";

import { logoutThunk } from "@/lib/store/features/auth/auth.actions";
import { AppDispatch } from "@/lib/store/store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaColumns,
  FaCode,
  FaTags,
  FaUsers,
  FaChartBar,
  FaTimes,
  FaShieldAlt, // Added for Moderation
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { LuSwords } from "react-icons/lu";
import { useDispatch } from "react-redux";

interface AdminSidebarProps {
  onClose?: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: FaChartBar },
  { name: "Categories", href: "/admin/categories", icon: FaTags },
  { name: "Problems", href: "/admin/problems", icon: FaCode },
  { name: "Challenges", href: "/admin/challenges", icon: LuSwords },
  { name: "Moderation", href: "/admin/moderation", icon: FaShieldAlt }, // Completed this
  { name: "Users", href: "/admin/users", icon: FaUsers },
];

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  return (
    <aside className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      <div className="p-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary-1 font-bold text-xl"
        >
          <FaColumns />
          <span>
            CodeArena{" "}
            <span className="text-[10px] font-normal text-slate-400">
              ADMIN
            </span>
          </span>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="md:hidden text-slate-400 hover:text-slate-600"
        >
          <FaTimes size={18} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          // Check if the current pathname starts with the item href to keep it active
          // when viewing sub-pages (like /admin/moderation/logs)
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-primary-1 text-white shadow-md shadow-primary-1/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary-1"
              }`}
            >
              <item.icon
                className={isActive ? "text-white" : "text-slate-400"}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mt-3 pt-3 border-t border-gray-100 mb-14">
        <button
          onClick={() => dispatch(logoutThunk())}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all text-sm font-black cursor-pointer"
        >
          <FiLogOut size={18} /> LOGOUT
        </button>
      </div>
    </aside>
  );
}
