"use client";

const Dashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black uppercase tracking-tighter italic">
        Admin_Dashboard<span className="text-primary-1">.</span>
      </h1>
      <p className="text-muted text-xs font-bold uppercase tracking-widest mt-1">
        System Overview & Rapid Control
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {/* Placeholder for future Stat Cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">
              Metric_0{i}
            </div>
            <div className="text-2xl font-black">---</div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-20 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-gray-50/30">
        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse mb-3" />
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">
          Main_Control_Node_Active
        </span>
      </div>
    </div>
  );
};

export default Dashboard;