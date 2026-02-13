"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchChallengeBySlugThunk } from "@/lib/store/features/challenge/challenge.actions";
import {
  FaClock,
  FaTrophy,
  FaLock,
  FaChevronRight,
  FaCheckCircle,
} from "react-icons/fa";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ChallengeDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { currentChallenge, isLoading, error } = useSelector(
    (state: RootState) => state.challenge,
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchChallengeBySlugThunk(slug as string));
    }
  }, [dispatch, slug]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
    
  if (error || !currentChallenge)
    return (
      <div className="p-20 text-center text-rose-500 font-bold uppercase tracking-widest">
        Challenge not found or session expired.
      </div>
    );

  // Extract stats for cleaner JSX
  const stats = currentChallenge.stats || { solvedCount: 0, totalCount: 0, percentage: 0 };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HERO SECTION */}
      <div className="bg-slate-900 text-white py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary-1 text-[10px] font-black px-3 py-1 uppercase rounded-full text-white">
              {currentChallenge.difficulty}
            </span>
            <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
              <FaTrophy className="text-amber-500" /> {currentChallenge.points}{" "}
              Total Points
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            {currentChallenge.title}
          </h1>
          <p className="text-slate-400 max-w-2xl font-medium leading-relaxed">
            {currentChallenge.description}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 -mt-10">
        {/* PROGRESS SECTION */}
        <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm mb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Your_Challenge_Progress
              </p>
              <h3 className="text-2xl font-black italic text-slate-800">
                {stats.percentage.toFixed(0)}% <span className="text-slate-300">COMPLETE</span>
              </h3>
            </div>
            <p className="text-xs font-bold text-slate-500">
              {stats.solvedCount} / {stats.totalCount} Tasks Finished
            </p>
          </div>
          
          {/* Progress Bar Container */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        {/* METRICS BAR */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-sm flex items-center justify-between shadow-sm mb-4">
            <div className="flex items-center gap-6">
              <div className="text-center border-r border-slate-100 pr-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Problems
                </p>
                <p className="text-xl font-black text-slate-800">
                  {currentChallenge.problems?.length || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Status
                </p>
                <p className="text-xs font-bold text-emerald-500 uppercase">
                  Live Now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
              <FaClock className="text-slate-300" />
              <span>
                Ends:{" "}
                {currentChallenge.endTime
                  ? new Date(currentChallenge.endTime).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>

          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 mt-4">
            Tasks_To_Complete
          </h2>

          {/* PROBLEM CARDS */}
          {currentChallenge.problems?.map((cp: any, index: number) => (
            <div
              key={cp.problemId}
              onClick={() =>
                router.push(
                  `/problems/${cp.problem.problemId}?challenge=${currentChallenge.slug}`,
                )
              }
              className={`group bg-white border p-5 rounded-sm flex items-center justify-between transition-all cursor-pointer shadow-sm hover:translate-x-1 ${
                cp.isSolved ? "border-emerald-100" : "border-slate-200 hover:border-primary-1"
              }`}
            >
              <div className="flex items-center gap-5">
                {cp.isSolved ? (
                  <div className="bg-emerald-50 p-2 rounded-full">
                    <FaCheckCircle className="text-emerald-500 text-xl" />
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-100 group-hover:text-primary-1/30 transition-colors">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                )}
                
                <div>
                  <h3 className={`font-bold transition-colors ${cp.isSolved ? "text-slate-500 italic line-through" : "text-slate-800 group-hover:text-primary-1"}`}>
                    {cp.problem.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 border border-slate-100">
                      {cp.problem.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Value: {cp.problem.points || 50} pts
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 rounded-sm ${
                    cp.isSolved 
                    ? "bg-slate-100 text-slate-400 cursor-default" 
                    : "bg-slate-900 text-white group-hover:bg-primary-1"
                  }`}
                >
                  {cp.isSolved ? "Completed" : "Solve"} <FaChevronRight size={8} />
                </button>
              </div>
            </div>
          ))}

          {/* EMPTY STATE */}
          {(!currentChallenge.problems || currentChallenge.problems.length === 0) && (
            <div className="bg-white border-2 border-dashed border-slate-200 p-20 text-center rounded-sm">
              <FaLock className="mx-auto text-slate-200 mb-4" size={40} />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                This challenge has no problems yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}