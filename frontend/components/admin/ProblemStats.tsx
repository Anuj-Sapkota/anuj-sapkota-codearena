"use client";

import { FiCode, FiCheckCircle, FiTrendingUp } from "react-icons/fi";

interface Props {
  totalProblems: number;
  easy?: number;
  medium?: number;
  hard?: number;
  acceptanceRate?: number;
}

export default function ProblemStats({ totalProblems, easy = 0, medium = 0, hard = 0, acceptanceRate }: Props) {
  const stats = [
    {
      label: "Total Problems",
      value: totalProblems,
      icon: <FiCode size={15} className="text-blue-500" />,
    },
    {
      label: "Easy / Medium / Hard",
      value: `${easy} / ${medium} / ${hard}`,
      icon: <FiTrendingUp size={15} className="text-slate-500" />,
    },
    {
      // Real acceptance rate: accepted submissions / total submissions, from the DB
      label: "Acceptance Rate",
      value: acceptanceRate != null ? `${acceptanceRate}%` : "—",
      icon: <FiCheckCircle size={15} className="text-emerald-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
            {s.icon}
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
