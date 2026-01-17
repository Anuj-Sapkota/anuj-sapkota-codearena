"use client";

import Link from "next/link";

import type { SettingsSidebarProps } from "@/types/settings.types";
import { SETTINGS_MENU_ITEMS } from "@/constants/routes";

const SettingsSidebar = ({ activeTab }: SettingsSidebarProps) => {

  return (
    <aside className="w-72 -mt-8 bg-white border border-gray-200 rounded-md shadow-xl shadow-gray-200/50 overflow-hidden z-30">
      <nav className="flex flex-col py-3">
        {SETTINGS_MENU_ITEMS.map(({icon:Icon, id, name, path}) => (
          <Link
            key={id}
            href={path}
            className={`flex items-center gap-4 px-6 py-5 text-sm font-bold transition-all relative ${
              activeTab === id
                ? "text-primary-1 bg-primary-1/5"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            {/* Active Indicator Bar */}
            {activeTab === id && (
              <div className="absolute left-0 w-1.5 h-8 bg-primary-1 rounded-r-full" />
            )}

            <span
              className={`text-xl ${
                activeTab === id ? "text-primary-1" : "text-gray-400"
              }`}
            >
              <Icon/>
            </span>
            {name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
