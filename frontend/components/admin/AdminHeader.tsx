"use client";

import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();

  // 1. Split path and remove empty strings
  // Example: /admin/categories -> ["admin", "categories"]
  const pathParts = pathname.split("/").filter(Boolean);

  // 2. Identify the "Context" (usually the first part after /admin) and the "Current Page"
  // If the path is just /admin, we'll default to "Dashboard"
  const context = pathParts.length > 1 ? pathParts[0] : "System";
  const rawTitle = pathParts[pathParts.length - 1] || "Dashboard";

  // 3. Format the title (e.g., "problem-sets" -> "Problem Sets")
  const pageTitle = rawTitle
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char: string) => char.toUpperCase());

  const contextTitle = context
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char: string) => char.toUpperCase());

  return (
    <div className="flex w-full items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 bg-indigo-600 rounded-full" /> {/* Accent bar */}
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {contextTitle}
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-bold text-slate-900 tracking-tight">
          {pageTitle}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-slate-900">Anuj Sapkota</span>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
            Internal Admin
          </span>
        </div>
        <div className="h-9 w-9 bg-slate-900 ring-2 ring-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-white">
          AS
        </div>
      </div>
    </div>
  );
}