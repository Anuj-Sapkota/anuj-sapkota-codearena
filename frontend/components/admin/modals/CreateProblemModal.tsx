"use client";

import { useState } from "react";
import { FiX, FiSettings, FiFileText, FiCode, FiCheckSquare, FiSave } from "react-icons/fi";
import { Problem } from "@/types/problem.types";
import { useCategories } from "@/hooks/useCategories";
import { useProblemForm } from "../hooks/useProblemForm";
import BasicConfigTab from "../create-problems/BasicConfigTab";
import DescriptionTab from "../create-problems/DescriptionTab";
import StarterCodeTab from "../create-problems/StarterCodeTab";
import TestCasesTab from "../create-problems/TestCasesTab";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Problem | null;
}

type Tab = "basic" | "description" | "code" | "testcases";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "basic",       label: "Config",      icon: <FiSettings size={13} /> },
  { id: "description", label: "Content",     icon: <FiFileText size={13} /> },
  { id: "code",        label: "Starter Code",icon: <FiCode size={13} /> },
  { id: "testcases",   label: "Test Cases",  icon: <FiCheckSquare size={13} /> },
];

export default function CreateProblemModal({ isOpen, onClose, initialData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const { data: categories = [] } = useCategories();
  const { formData, setFormData, handleSubmit, isLoading } = useProblemForm(isOpen, initialData, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[88vh] rounded-sm shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {initialData ? "Edit Problem" : "New Problem"}
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {initialData ? `Editing: ${initialData.title}` : "Create a new problem"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-100 shrink-0 bg-slate-50/50">
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-slate-900 bg-white"
                  : "text-slate-400 hover:text-slate-700 hover:bg-white/60"
              }`}
            >
              {/* Step number */}
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 ${
                activeTab === tab.id ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {i + 1}
              </span>
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-1" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === "basic"       && <BasicConfigTab formData={formData} setFormData={setFormData} categories={categories} />}
          {activeTab === "description" && <DescriptionTab formData={formData} setFormData={setFormData} />}
          {activeTab === "code"        && <StarterCodeTab formData={formData} setFormData={setFormData} />}
          {activeTab === "testcases"   && <TestCasesTab formData={formData} setFormData={setFormData} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <div
                key={tab.id}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeTab === tab.id ? "bg-slate-900 w-4" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <FiSave size={12} />
              {isLoading ? "Saving..." : initialData ? "Save Changes" : "Create Problem"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
