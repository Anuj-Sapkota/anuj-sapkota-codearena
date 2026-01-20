"use client";

import { FaTimes, FaFolderPlus, FaHashtag, FaAlignLeft } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCategoryModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop: Blurs the background for focus */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
        
        {/* Decorative Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary-1/10 text-primary-1 rounded-xl flex items-center justify-center">
              <FaFolderPlus size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg leading-tight">Create Category</h3>
              <p className="text-slate-400 text-xs font-medium">Add a new tag for problems</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form className="p-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
          
          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              <FaAlignLeft size={10} /> Display Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Dynamic Programming"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-1/10 focus:border-primary-1 focus:bg-white outline-none transition-all text-sm font-bold text-slate-700"
            />
          </div>

          {/* URL Slug */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              <FaHashtag size={10} /> URL Slug
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">/</span>
              <input 
                type="text" 
                placeholder="dynamic-programming"
                className="w-full pl-7 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-1/10 focus:border-primary-1 focus:bg-white outline-none transition-all text-sm font-mono text-slate-600"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              Description
            </label>
            <textarea 
              rows={3}
              placeholder="What kind of challenges belong here?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-1/10 focus:border-primary-1 focus:bg-white outline-none transition-all text-sm font-medium text-slate-600 resize-none"
            />
          </div>

          {/* Action Buttons: Vertical on mobile, Horizontal on desktop */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 flex-1 px-6 py-3.5 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="order-1 sm:order-2 flex-[2] px-6 py-3.5 bg-primary-1 text-white rounded-xl font-black text-sm shadow-lg shadow-primary-1/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}