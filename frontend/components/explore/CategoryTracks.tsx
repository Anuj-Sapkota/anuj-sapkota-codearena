import React from "react";
import { 
  FaCode, 
  FaDatabase, 
  FaBrain, 
  FaTerminal, 
  FaArrowRight 
} from "react-icons/fa";

const CATEGORIES = [
  { name: "Algorithms", icon: <FaCode />, count: "120 Problems" },
  { name: "Data Structures", icon: <FaDatabase />, count: "85 Problems" },
  { name: "Artificial Intelligence", icon: <FaBrain />, count: "40 Problems" },
  { name: "Regex", icon: <FaTerminal />, count: "15 Problems" },
];

export const CategoryTracks = () => (
  <section className="mb-16">
    <div className="flex justify-between items-end mb-6">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
        01. Specialized_Tracks
      </h2>
      
      {/* View All Categories Button */}
      <button className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-1 hover:gap-3 transition-all cursor-pointer group">
        View All Tracks <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.name}
          className="bg-white border border-slate-200 p-5 hover:border-primary-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer transition-all group relative overflow-hidden"
        >
          {/* Animated Icon */}
          <div className="text-primary-1 mb-3 text-xl group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300">
            {cat.icon}
          </div>
          
          <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-tight">
            {cat.name}
          </h4>
          
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {cat.count}
          </p>

          {/* Subtle bottom bar that appears on hover */}
          <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary-1 transition-all duration-300 group-hover:w-full" />
        </div>
      ))}
    </div>
  </section>
);