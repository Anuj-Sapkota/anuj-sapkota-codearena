"use client";

import { useBadges } from "@/hooks/useBadges";
import { Award, Loader2, Check, Info } from "lucide-react";

interface BadgeSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function BadgeSelector({
  selectedId,
  onSelect,
}: BadgeSelectorProps) {
  const { badges, isLoading } = useBadges();

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <Loader2 className="animate-spin text-slate-400" size={20} />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Award size={14} className="text-blue-500" /> Completion Reward
        </label>
        <div className="group relative">
          <Info size={14} className="text-slate-300 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] rounded hidden group-hover:block z-50">
            This badge will be automatically awarded to students who finish all
            modules in this series.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges?.map((badge: any) => (
          <button
            key={badge.id}
            type="button"
            onClick={() => onSelect(badge.id)}
            className={`relative p-4 rounded-xl border transition-all flex flex-col items-center text-center gap-2 ${
              selectedId === badge.id
                ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500/10 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="relative w-10 h-10">
              <img
                src={badge.iconUrl}
                alt={badge.name}
                className={`w-full h-full object-contain transition-transform ${selectedId === badge.id ? "scale-110" : "opacity-80"}`}
              />
              {selectedId === badge.id && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-sm border-2 border-white">
                  <Check size={10} strokeWidth={4} />
                </div>
              )}
            </div>
            <span
              className={`text-[9px] font-black uppercase tracking-tight leading-tight line-clamp-1 ${selectedId === badge.id ? "text-blue-700" : "text-slate-500"}`}
            >
              {badge.name}
            </span>
          </button>
        ))}

        {/* Empty State if no badges exist */}
        {badges?.length === 0 && (
          <div className="col-span-full py-6 text-center border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-[10px] font-bold text-slate-300 uppercase italic">
              No badges found in factory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
