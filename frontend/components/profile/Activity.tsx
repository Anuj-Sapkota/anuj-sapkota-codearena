import CalendarHeatmap from "react-calendar-heatmap";
import { CheckCircle, Clock } from "lucide-react";

export function HeatmapLegend() {
  // Soft blue scales for Light Mode
  const colors = [
    "bg-slate-100", // Empty
    "bg-blue-100",  // Level 1
    "bg-blue-300",  // Level 2
    "bg-blue-500",  // Level 3
    "bg-blue-700"   // Level 4
  ];
  
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-tight">
      <span>Less</span>
      {colors.map((cls, i) => (
        <div key={i} className={`w-3 h-3 rounded-sm border border-black/5 ${cls}`} />
      ))}
      <span>More</span>
    </div>
  );
}

export function ActivityHeatmap({ heatmapData }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-800 font-bold text-lg flex items-center gap-2">
          <Clock size={18} className="text-blue-500" />
          Submission Heatmap
        </h3>
        <HeatmapLegend />
      </div>
      
      <div className="heatmap-container overflow-x-auto pb-2 custom-light-heatmap">
        <CalendarHeatmap
          startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
          endDate={new Date()}
          values={heatmapData || []}
          // Using standard CSS classes - ensure these are in your global CSS
          classForValue={(v) => {
            if (!v || v.count === 0) return "color-empty-light";
            return `color-blue-${Math.min(v.count, 4)}`;
          }}
          tooltipDataAttrs={(v: any) => ({
            "data-tooltip-id": "heatmap-tooltip",
            "data-tooltip-content": v?.count 
              ? `${v.count} submissions on ${new Date(v.date).toDateString()}` 
              : "No submissions",
          } as any)}
          showWeekdayLabels
        />
      </div>
    </div>
  );
}

// NOTE: We moved the list logic into the 'Tabs' in the main page, 
// but here is the styled RecentSubmissions if you use it separately.
export function RecentSubmissions({ submissions }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-slate-800 font-bold flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-500" /> 
          Recent Accepted Solutions
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {submissions?.length > 0 ? (
          submissions.map((sub: any) => (
            <div key={sub.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors">
                  {sub.title}
                </span>
              </div>
              <span className="text-slate-400 text-xs font-mono font-medium">
                {new Date(sub.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 italic text-sm">
            No recent activity recorded.
          </div>
        )}
      </div>
    </div>
  );
}