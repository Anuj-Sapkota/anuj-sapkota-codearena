"use client";

import { useState } from "react";
import { FaPlus, FaSearch, FaFilter, FaTrashAlt, FaFolderOpen, FaChartLine } from "react-icons/fa";
import CreateCategoryModal from "@/components/admin/modals/CreateCategoryModal";

export default function AdminCategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const categories = [
    { id: 1, name: "Dynamic Programming", slug: "dp", count: 42 },
    { id: 2, name: "Data Structures", slug: "ds", count: 18 },
    { id: 3, name: "Unused Tag", slug: "unused", count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Categories</h1>
          <p className="text-slate-500 text-sm">Organize and monitor problem tags</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary-1 text-white px-5 py-2.5 rounded-md font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary-1/20"
        >
          <FaPlus size={14} /> Create New
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center"><FaFolderOpen size={20}/></div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-black">Total Tags</p>
            <p className="text-2xl font-black text-slate-900">{categories.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-md flex items-center justify-center"><FaChartLine size={20}/></div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-black">Active Usage</p>
            <p className="text-2xl font-black text-slate-900">84%</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-md border border-slate-200 flex flex-col lg:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-md focus:bg-white focus:border-primary-1 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select className="flex-1 lg:w-48 bg-slate-50 border border-transparent rounded-md px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:bg-white focus:border-primary-1 transition-all">
            <option>Recently Added</option>
            <option>Most Problems</option>
            <option>Alphabetical</option>
          </select>
          <button className="p-3 bg-slate-50 text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
            <FaFilter size={14} />
          </button>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Category Detail</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Slug</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Usage</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700 block">{cat.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-500 font-mono">/{cat.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase ${
                        cat.count > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}>
                        {cat.count} Problems
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-300 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                      <FaTrashAlt size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateCategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}