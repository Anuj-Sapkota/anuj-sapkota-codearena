"use client";

import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import Image from "next/image";
import { FiChevronRight } from "react-icons/fi";

const PAGE_LABELS: Record<string, string> = {
  admin:       "Dashboard",
  problems:    "Problems",
  challenges:  "Challenges",
  categories:  "Categories",
  badges:      "Badges",
  moderation:  "Moderation",
  application: "Applications",
  users:       "Users",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);

  const parts = pathname.split("/").filter(Boolean);
  // parts[0] = "admin", parts[1] = section (optional)
  const section = parts[1];
  const pageLabel = section ? (PAGE_LABELS[section] ?? section) : "Dashboard";

  const profilePic = user?.profile_pic_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || "A"}`;

  return (
    <div className="flex w-full items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-400">Admin</span>
        {section && (
          <>
            <FiChevronRight size={10} className="text-slate-300" />
            <span className="text-slate-900">{pageLabel}</span>
          </>
        )}
      </div>

      {/* Right side — user info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-[11px] font-black text-slate-900 leading-none">{user?.full_name || "Admin"}</p>
          <p className="text-[9px] font-bold text-primary-1 uppercase tracking-widest mt-0.5">Administrator</p>
        </div>
        <div className="w-8 h-8 rounded-sm overflow-hidden border-2 border-slate-200 relative shrink-0">
          <Image src={profilePic} alt="avatar" fill className="object-cover" />
        </div>
      </div>
    </div>
  );
}
