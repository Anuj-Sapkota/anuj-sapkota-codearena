export default function AdminHeader() {
  return (
    <div className="flex w-full items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 bg-indigo-600 rounded-full" /> {/* Accent bar */}
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-bold text-slate-900 tracking-tight">Categories</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-slate-900">Anuj Sapkota</span>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
            Internal Admin
          </span>
        </div>
        <div className="h-9 w-9 bg-slate-900 ring-2 ring-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-white">
          AS
        </div>
      </div>
    </div>
  );
}