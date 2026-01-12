"use client";

import Link from "next/link";
import { FiUser, FiSettings, FiBell } from "react-icons/fi";
import { SettingsSidebarProps } from "@/app/types/settings";

const SettingsSidebar = ({ activeTab }: SettingsSidebarProps) => {
  const menuItems = [
    { id: "Basic", name: "Basic Info", icon: <FiUser />, path: "/settings" },
    {
      id: "Account and Security",
      name: "Account and Security",
      icon: <FiSettings />,
      path: "/settings/accounts-security",
    },
    {
      id: "Notifications",
      name: "Notifications",
      icon: <FiBell />,
      path: "/settings/notifications",
    },
  ];

  return (
    <aside className="w-72 -mt-8 bg-white border border-gray-200 rounded-md shadow-xl shadow-gray-200/50 overflow-hidden z-30">
      <nav className="flex flex-col py-3">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className={`flex items-center gap-4 px-6 py-5 text-sm font-bold transition-all relative ${
              activeTab === item.id
                ? "text-primary-1 bg-primary-1/5"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            {/* Active Indicator Bar */}
            {activeTab === item.id && (
              <div className="absolute left-0 w-1.5 h-8 bg-primary-1 rounded-r-full" />
            )}

            <span
              className={`text-xl ${
                activeTab === item.id ? "text-primary-1" : "text-gray-400"
              }`}
            >
              {item.icon}
            </span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
