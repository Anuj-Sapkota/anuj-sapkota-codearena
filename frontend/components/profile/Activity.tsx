import CalendarHeatmap from "react-calendar-heatmap";
import { CheckCircle } from "lucide-react";

export function HeatmapLegend() {
  const colors = ["bg-[#161b22]", "bg-[#0e4429]", "bg-[#006d32]", "bg-[#26a641]", "bg-[#39d353]"];
  return (
    <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase font-bold">
      <span>Less</span>
      {colors.map((cls, i) => <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />)}
      <span>More</span>
    </div>
  );
}

export function ActivityHeatmap({ heatmapData }: any) {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold text-lg">Activity History</h3>
        <HeatmapLegend />
      </div>
      <div className="heatmap-container overflow-x-auto pb-2">
        <CalendarHeatmap
          startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
          endDate={new Date()}
          values={heatmapData || []}
          classForValue={(v) => (!v || v.count === 0 ? "color-empty" : `color-scale-${Math.min(v.count, 4)}`)}
          tooltipDataAttrs={(v: any) => ({
            "data-tooltip-id": "heatmap-tooltip",
            "data-tooltip-content": v?.count ? `${v.count} submissions on ${new Date(v.date).toDateString()}` : "No submissions",
          } as any)}
          showWeekdayLabels
        />
      </div>
    </div>
  );
}

export function RecentSubmissions({ submissions }: any) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <div className="p-5 border-b border-gray-800 bg-[#222]">
        <h3 className="text-white font-bold flex items-center gap-2">
          <CheckCircle size={18} className="text-green-500" /> Recent Accepted Solutions
        </h3>
      </div>
      <div className="divide-y divide-gray-800">
        {submissions?.length > 0 ? (
          submissions.map((sub: any) => (
            <div key={sub.id} className="p-5 flex justify-between items-center hover:bg-[#252525] transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-200 font-medium group-hover:text-white">{sub.title}</span>
              </div>
              <span className="text-gray-500 text-xs font-mono">{new Date(sub.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-gray-600 italic">No recent activity recorded.</div>
        )}
      </div>
    </div>
  );
}