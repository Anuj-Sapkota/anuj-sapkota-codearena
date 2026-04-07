"use client";

import Link from "next/link";
import { SETTINGS_MENU_ITEMS } from "@/constants/routes";

interface SettingsSidebarProps {
  activeId: string;
}

const SettingsSidebar = ({ activeId }: SettingsSidebarProps) => (
  <aside className="w-56 shrink-0 sticky top-24">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 mb-3">
      Settings
    </p>
    <nav className="flex flex-col gap-0.5">
      {SETTINGS_MENU_ITEMS.map(({ icon: Icon, id, name, path }) => {
        const active = activeId === id;
        return (
          <Link
            key={id}
            href={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all relative ${
              active
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-1 rounded-r-full" />
            )}
            <Icon size={13} className={active ? "text-primary-1" : "text-slate-400"} />
            {name}
          </Link>
        );
      })}
    </nav>
  </aside>
);

export default SettingsSidebar;
