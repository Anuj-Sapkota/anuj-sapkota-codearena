"use client";

import { FaCode, FaTrophy, FaLayerGroup } from "react-icons/fa";

interface ProblemStatsProps {
  totalProblems: number;
}

export default function ProblemStats({ totalProblems }: ProblemStatsProps) {
  const stats = [
    { 
      label: "Active", 
      value: totalProblems, // Uses the meta.total from backend
      icon: <FaCode />, 
      color: "text-primary-1" 
    },
    { 
      label: "Solved", 
      value: "...", // You can add a specific meta field for this later
      icon: <FaTrophy />, 
      color: "text-darkest" 
    },
    { 
      label: "System", 
      value: "STABLE", 
      icon: <FaLayerGroup />, 
      color: "text-primary-1" 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 border-2 border-gray-200 rounded-md flex items-center justify-between shadow-sm">
          <div>
            <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-3xl font-black text-darkest mt-1 italic uppercase tabular-nums">{stat.value}</p>
          </div>
          <div className={`h-14 w-14 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center ${stat.color}`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}