import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { FiBook, FiTrendingUp } from "react-icons/fi";
import { ROUTES, getResourcePath } from "@/constants/routes";

interface Resource {
  id: string;
  title: string;
  thumbnail?: string;
  views?: number;
  moduleCount?: number;
  price?: number;
}

interface TopResourcesSectionProps {
  resources: Resource[];
}

export function TopResourcesSection({ resources }: TopResourcesSectionProps) {
  return (
    <section className="mb-16">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">03. Learning_Pathways</h2>
          <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Top courses by views</p>
        </div>
        <Link href={ROUTES.MAIN.LEARN} className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-1 hover:gap-3 transition-all group">
          Browse All Courses <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((r) => (
            <Link key={r.id} href={getResourcePath(r.id)}
              className="group bg-white border border-slate-200 rounded-sm overflow-hidden hover:border-primary-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
            >
              <div className="aspect-video bg-slate-100 overflow-hidden relative">
                {r.thumbnail
                  ? <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center"><FiBook size={28} className="text-slate-300" /></div>}
                <div className="absolute bottom-2 left-2 bg-white/90 text-slate-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm">
                  <FiTrendingUp size={9} className="text-primary-1" /> {r.views || 0} views
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm tracking-tight truncate text-slate-900 group-hover:text-primary-1 transition-colors">{r.title}</h3>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400">{r.moduleCount || 0} lessons</span>
                  <span className="text-[10px] font-black text-emerald-600">NPR {r.price?.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-slate-100 border-2 border-dashed border-slate-200 py-12 flex flex-col items-center justify-center rounded-sm">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">No courses available yet</span>
        </div>
      )}
    </section>
  );
}
