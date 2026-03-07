"use client";
import React, { useState } from "react";
import { MdClose, MdSend, MdReport } from "react-icons/md";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, details: string) => void;
  commentAuthor: string;
}

const REPORT_TYPES = [
  "SPAM_OR_ADVERTISING",
  "HARASSMENT_OR_ABUSE",
  "INAPPROPRIATE_CONTENT",
  "PLAGIARISM",
  "OTHER"
];

export const ReportModal = ({ isOpen, onClose, onSubmit, commentAuthor }: ReportModalProps) => {
  const [type, setType] = useState(REPORT_TYPES[0]);
  const [details, setDetails] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!details.trim()) return;
    onSubmit(type, details);
    setDetails(""); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className="relative bg-white border-2 border-slate-200 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <MdReport size={24} />
          </div>
          <div>
            <h2 className="font-black text-[12px] uppercase tracking-[0.2em] text-slate-900">Flag_Incident</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target_User: @{commentAuthor}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Report Type Select */}
          <div className="flex flex-col gap-3">
            <label className="text-[9px] font-black text-emerald-900/60 ml-1 tracking-[0.2em] uppercase">Violation_Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              {REPORT_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          {/* Details Textarea */}
          <div className="flex flex-col gap-3">
            <label className="text-[9px] font-black text-emerald-900/60 ml-1 tracking-[0.2em] uppercase">Incident_Log_Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="DESCRIBE_THE_VIOLATION_IN_DETAIL..."
              className="w-full h-32 border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 transition-all resize-none text-xs font-medium"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer"
          >
            <MdClose className="text-lg" /> Discard
          </button>

          <button
            onClick={handleSubmit}
            disabled={!details.trim()}
            className="group relative bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              Submit_Report <MdSend className="text-base" />
            </span>
            <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};