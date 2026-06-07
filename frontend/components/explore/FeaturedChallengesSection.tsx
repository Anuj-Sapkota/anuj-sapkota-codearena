import Link from "next/link";
<<<<<<< HEAD
import { ArrowRight } from "lucide-react";
=======
import { FaArrowRight } from "react-icons/fa";
>>>>>>> cd7f3ccc468f09cc7f6b00f353e194cbe3ed6ed5
import { ROUTES } from "@/constants/routes";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { Challenge } from "@/types/challenge.types";

interface FeaturedChallengesSectionProps {
  challenges: Challenge[];
}

export function FeaturedChallengesSection({ challenges }: FeaturedChallengesSectionProps) {
  return (
<<<<<<< HEAD
    <section className="mb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 py-1 pr-4 border-b border-indigo-500/20 inline-block mb-3">02. Challenge Circuit</h2>
          <p className="text-2xl font-black text-slate-900 tracking-tight">Active Contests</p>
        </div>
        <Link href={ROUTES.MAIN.CHALLENGES} className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:gap-3 transition-all group bg-indigo-50 px-4 py-2 rounded-full">
          View All Challenges <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.length > 0
          ? challenges.slice(0, 3).map((c) => <ChallengeCard key={c.challengeId} challenge={c} />)
          : (
            <div className="col-span-full py-16 border-2 border-dashed border-slate-200 rounded-3xl text-center flex items-center justify-center">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No Active Challenges Found</p>
=======
    <section className="mb-16">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">02. Featured_Challenges</h2>
          <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Handpicked algorithmic contests for you</p>
        </div>
        <Link href={ROUTES.MAIN.CHALLENGES} className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-1 hover:gap-3 transition-all group">
          View All Challenges <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.length > 0
          ? challenges.slice(0, 4).map((c) => <ChallengeCard key={c.challengeId} challenge={c} />)
          : (
            <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-sm text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Active Challenges Found</p>
>>>>>>> cd7f3ccc468f09cc7f6b00f353e194cbe3ed6ed5
            </div>
          )}
      </div>
    </section>
  );
}
