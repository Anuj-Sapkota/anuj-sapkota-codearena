import Link from "next/link";
import { ArrowRight, BookOpen, TrendingUp, PlayCircle } from "lucide-react";
import { ROUTES, getResourcePath } from "@/constants/routes";
import { ResourceItem } from "@/types/resource.types";

interface TopResourcesSectionProps {
  resources: ResourceItem[];
}

export function TopResourcesSection({ resources }: TopResourcesSectionProps) {
  return (
    <section className="mb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 py-1 pr-4 border-b border-emerald-500/20 inline-block mb-3">03. Learning Pathways</h2>
          <p className="text-2xl font-black text-slate-900 tracking-tight">Top Courses</p>
        </div>
        <Link href={ROUTES.MAIN.LEARN} className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 hover:gap-3 transition-all group bg-emerald-50 px-4 py-2 rounded-full">
          Browse All Courses <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((r) => (
            <Link key={r.id} href={getResourcePath(r.id)}
              className="group bg-white border border-slate-200/70 rounded-3xl overflow-hidden hover:border-emerald-400/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] bg-slate-50 overflow-hidden relative border-b border-slate-100">
                {r.thumbnail
                  ? <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  : <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-700 ease-out">
                      <BookOpen size={40} strokeWidth={1} className="text-slate-300" />
                    </div>}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md">
                   <PlayCircle size={48} className="text-white" strokeWidth={1.5} />
                </div>
                
                {/* Stats badge */}
                <div className="absolute top-4 right-4 bg-white/95 text-slate-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
                  <TrendingUp size={12} className="text-emerald-500" /> {(r.views / 1000).toFixed(1)}k
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-lg tracking-tight text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">{r.title}</h3>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-slate-400" /> {r.moduleCount || 0} modules
                  </span>
                  <span className={`text-xs font-black uppercase tracking-widest ${r.price > 0 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                    {r.price > 0 ? `NPR ${r.price.toLocaleString()}` : 'Free'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 py-16 flex flex-col items-center justify-center rounded-3xl">
          <span className="text-sm font-bold uppercase tracking-widest text-slate-400">No courses available</span>
        </div>
      )}
    </section>
  );
}
