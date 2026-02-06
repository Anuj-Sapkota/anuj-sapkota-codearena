import { FaArrowRight } from "react-icons/fa";
import { ChallengeCard } from "./ChallengeCard";

export const FeaturedChallenges = ({ challenges }: { challenges: any[] }) => (
  <section className="mb-16">
    <div className="flex justify-between items-end mb-6">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
        02. Featured_Challenges
      </h2>
      <button className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-1 hover:gap-3 transition-all cursor-pointer group">
        View All Challenges <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Explicitly taking only first 4 for the 2x2 layout */}
      {challenges.slice(0, 4).map((item) => (
        <ChallengeCard key={item.id} challenge={item} />
      ))}
    </div>
  </section>
);