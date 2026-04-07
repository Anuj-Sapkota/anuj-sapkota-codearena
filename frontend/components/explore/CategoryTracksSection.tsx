import Link from "next/link";
import { FaArrowRight, FaCode, FaDatabase, FaBrain, FaTerminal } from "react-icons/fa";
import { ROUTES, getProblemsByCategoryPath } from "@/constants/routes";
import { Category } from "@/types/category.types";

const CAT_ICONS = [
  <FaCode />, <FaDatabase />, <FaBrain />, <FaTerminal />,
  <FaCode />, <FaDatabase />, <FaBrain />, <FaTerminal />,
];

interface CategoryTracksSectionProps {
  categories: Category[];
}

export function CategoryTracksSection({ categories }: CategoryTracksSectionProps) {
  return (
    <section className="mb-16">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">01. Specialized_Tracks</h2>
          <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Browse problems by category</p>
        </div>
        <Link href={ROUTES.MAIN.PROBLEMS} className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-1 hover:gap-3 transition-all group">
          View All Problems <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.length > 0
          ? categories.slice(0, 8).map((cat, i) => (
            <Link key={cat.categoryId} href={getProblemsByCategoryPath(cat.categoryId)}
              className="bg-white border border-slate-200 p-5 hover:border-primary-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer transition-all group relative overflow-hidden rounded-sm"
            >
              <div className="text-primary-1 mb-3 text-xl group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300">
                {CAT_ICONS[i % CAT_ICONS.length]}
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-tight truncate">{cat.name}</h4>
              {cat.description && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{cat.description}</p>
              )}
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary-1 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))
          : [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 p-5 rounded-sm animate-pulse h-24" />
          ))}
      </div>
    </section>
  );
}
