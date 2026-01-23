"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { FaTimes, FaCog, FaFileAlt, FaCode, FaFlask } from "react-icons/fa";
import { RootState } from "@/lib/store/store";
import { Problem } from "@/types/problem.types";
import { FormButton } from "@/components/ui/Form";

import { useProblemForm } from "../hooks/useProblemForm";
import BasicConfigTab from "../create-problems/BasicConfigTab";
import DescriptionTab from "../create-problems/DescriptionTab";
import StarterCodeTab from "../create-problems/StarterCodeTab";
import TestCasesTab from "../create-problems/TestCasesTab";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Problem | null | undefined;
}

type Tab = "basic" | "description" | "code" | "testcases";

export default function CreateProblemModal({ isOpen, onClose, initialData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const { items: categories } = useSelector((state: RootState) => state.category);
  const { formData, setFormData, handleSubmit, isLoading } = useProblemForm(isOpen, initialData, onClose);

  if (!isOpen) return null;

  const tabs = [
    { id: "basic", label: "01. Configuration", icon: <FaCog /> },
    { id: "description", label: "02. Content", icon: <FaFileAlt /> },
    { id: "code", label: "03. Starter_Code", icon: <FaCode /> },
    { id: "testcases", label: "04. Validation", icon: <FaFlask /> },
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-gray-100">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
              {initialData ? "Registry_Edit" : "Registry_New"}
              <span className="text-primary-1">.</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Status: {initialData ? "Update_Active" : "Authoring_Mode"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-all cursor-pointer"><FaTimes size={20} /></button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-50/50 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? "bg-white border-b-2 border-primary-1 text-primary-1" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {activeTab === "basic" && <BasicConfigTab formData={formData} setFormData={setFormData} categories={categories} />}
          {activeTab === "description" && <DescriptionTab formData={formData} setFormData={setFormData} />}
          {activeTab === "code" && <StarterCodeTab formData={formData} setFormData={setFormData} />}
          {activeTab === "testcases" && <TestCasesTab formData={formData} setFormData={setFormData} />}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-4 bg-gray-50/50">
          <button onClick={onClose} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900">Abort_Action</button>
          <FormButton isLoading={isLoading} onClick={handleSubmit}>COMMIT_TO_REGISTRY</FormButton>
        </div>
      </div>
    </div>
  );
}