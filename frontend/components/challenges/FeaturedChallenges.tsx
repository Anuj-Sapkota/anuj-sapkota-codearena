"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchPublicChallengesThunk } from "@/lib/store/features/challenge/challenge.actions";
import { FaArrowRight } from "react-icons/fa";
import { ChallengeCard } from "./ChallengeCard";
import LoadingSpinner from "../ui/LoadingSpinner";

export const FeaturedChallenges = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Accessing the 'challenge' slice based on your slice definition
  const { items, isLoading, error } = useSelector(
    (state: RootState) => state.challenge,
  );

  useEffect(() => {
    // Initial fetch for the homepage/explore view
    // Using page 1 and a small limit for the 'Featured' section
    dispatch(fetchPublicChallengesThunk());
  }, [dispatch]);

  if (isLoading && items.length === 0) {
    return (
      <div className="py-10 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-rose-500 text-sm font-bold">
        Failed to load challenges: {error}
      </div>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            02. Featured_Challenges
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 italic font-medium">
            Handpicked algorithmic contests for you
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/challenges")} // Or your router path
          className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-1 hover:gap-3 transition-all cursor-pointer group"
        >
          View All Challenges{" "}
          <FaArrowRight
            size={10}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.length > 0 ? (
          items
            .slice(0, 4)
            .map((item) => (
              <ChallengeCard
                key={item.challengeId}
                challenge={item}
              />
            ))
        ) : (
          <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-sm text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              No Active Challenges Found
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
