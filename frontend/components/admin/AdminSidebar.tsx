"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { logoutThunk } from "@/lib/store/features/auth/auth.actions";
import { tokenStore } from "@/lib/token";
import { ROUTES } from "@/constants/routes";
import {
  FiGrid, FiCode, FiTag, FiShield, FiMail,
  FiAward, FiLogOut, FiX, FiExternalLink, FiUsers,
} from "react-icons/fi";
import { LuSwords } from "react-icons/lu";

const NAV = [
  { label: "Dashboard",    href: ROUTES.ADMIN.DASHBOARD,   icon: FiGrid },
  { label: "Problems",     href: ROUTES.ADMIN.PROBLEMS,    icon: FiCode },
  { label: "Challenges",   href: ROUTES.ADMIN.CHALLENGES,  icon: LuSwords },
  { label: "Categories",   href: ROUTES.ADMIN.CATEGORIES,  icon: FiTag },
  { label: "Badges",       href: ROUTES.ADMIN.BADGES,      icon: FiAward },
  { label: "Moderation",   href: ROUTES.ADMIN.MODERATION,  icon: FiShield },
  { label: "Applications", href: ROUTES.ADMIN.APPLICATION, icon: FiMail },
  { label: "Users",        href: ROUTES.ADMIN.USERS,       icon: FiUsers },
];

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const profilePic = user?.profile_pic_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || "A"}`;

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    tokenStore.clear();
    router.replace(ROUTES.MAIN.EXPLORE);
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      {/* Brand */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
        <Link href={ROUTES.ADMIN.DASHBOARD} className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-slate-900 rounded-sm flex items-center justify-center shrink-0">
            <FiGrid size={13} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">CodeArena</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Admin Panel</p>
          </div>
        </Link>
        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-700 transition-colors">
          <FiX size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em] px-3 mb-3">Navigation</p>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href ||
            (href !== ROUTES.ADMIN.DASHBOARD && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all relative ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-1 rounded-r-full" />
              )}
              <Icon size={13} className={active ? "text-primary-1" : "text-slate-400"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        <button
          onClick={() => { router.push(ROUTES.MAIN.EXPLORE); onClose?.(); }}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
        >
          <FiExternalLink size={12} />
          User View
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-sm bg-slate-50 border border-slate-100">
          <div className="w-7 h-7 rounded-sm overflow-hidden border border-slate-200 shrink-0 relative">
            <Image src={profilePic} alt="avatar" fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-900 truncate">{user?.full_name || "Admin"}</p>
            <p className="text-[8px] font-bold text-slate-400 truncate">@{user?.username}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
        >
          <FiLogOut size={12} />
          Logout
        </button>
      </div>
    </aside>
  );
}
