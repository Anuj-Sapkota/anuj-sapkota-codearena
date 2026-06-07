import Link from "next/link";
import { ArrowRight, Code2, Database, BrainCircuit, Terminal } from "lucide-react";
import { ROUTES, getProblemsByCategoryPath } from "@/constants/routes";
import { Category } from "@/types/category.types";

const CAT_ICONS = [
  <Code2 />, <Database />, <BrainCircuit />, <Terminal />,
  <Code2 />, <Database />, <BrainCircuit />, <Terminal />,
];

interface CategoryTracksSectionProps {
  categories: Category[];
}

export function CategoryTracksSection({ categories }: CategoryTracksSectionProps) {
  return (
    <section className="mb-24">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 py-1 pr-4 border-b border-indigo-500/20 inline-block mb-3">01. Specialized Tracks</h2>
          <p className="text-2xl font-black text-slate-900 tracking-tight">Browse By Category</p>
        </div>
        <Link href={ROUTES.MAIN.PROBLEMS} className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:gap-3 transition-all group bg-indigo-50 px-4 py-2 rounded-full">
          View All Problems <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.length > 0
          ? categories.slice(0, 8).map((cat, i) => (
            <Link key={cat.categoryId} href={getProblemsByCategoryPath(cat.categoryId)}
              className="bg-white border border-slate-200/70 p-6 hover:border-indigo-400/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group relative overflow-hidden rounded-3xl"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all duration-300 mb-6">
                {/* Dynamically clone icon to ensure size passes cleanly without breaking original element */}
                <div className="[&>svg]:w-6 [&>svg]:h-6 [&>svg]:stroke-[2px]">
                  {CAT_ICONS[i % CAT_ICONS.length]}
                </div>
              </div>
              <h4 className="font-bold text-slate-900 mb-1 tracking-tight truncate">{cat.name}</h4>
              {cat.description && (
                <p className="text-xs font-medium text-slate-500 truncate">{cat.description}</p>
              )}
            </Link>
          ))
          : [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl animate-pulse h-36" />
          ))}
      </div>
    </section>
  );
}
