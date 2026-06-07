"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useCategories } from "@/hooks/useCategories";
import { usePublicChallenges } from "@/hooks/useChallenges";
import api from "@/lib/api";
import { API } from "@/constants/api.constants";

import { UserStatsHeader, GuestHeader } from "@/components/explore/UserStatsHeader";
import { CategoryTracksSection } from "@/components/explore/CategoryTracksSection";
import { FeaturedChallengesSection } from "@/components/explore/FeaturedChallengesSection";
import { TopResourcesSection } from "@/components/explore/TopResourcesSection";
import { ResourceItem } from "@/types/resource.types";
import { motion } from "motion/react";

export default function ExplorePage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: categories = [] } = useCategories();
  const { data: challenges = [] } = usePublicChallenges();

  const [topResources, setTopResources] = useState<ResourceItem[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    // Explicit return type logic mapped to MockApiResponse format.
    // Replace with standard api.get when moving out of preview mockup if needed.
    type ResourceData = { items?: ResourceItem[] } | ResourceItem[];
    
    api.get<ResourceData>(API.RESOURCES.EXPLORE, { params: { sortBy: "popular", limit: 3 } })
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : (data?.items || []);
        const sorted = [...items].sort((a, b) => (b.views || 0) - (a.views || 0));
        setTopResources(sorted.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    api.get<{ rankings: { userId: string; rank: number }[] }>(API.LEADERBOARD, { params: { period: "weekly", type: "points" } })
      .then(({ data }) => {
        const found = (data?.rankings || []).find((r) => r.userId === user.userId);
        setUserRank(found ? found.rank : null);
      })
      .catch(() => {});
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-500/30 font-sans">
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {isAuthenticated && user
          ? <UserStatsHeader user={user} userRank={userRank} />
          : <GuestHeader />}

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.7, delay: 0.2 }}
        >
          <CategoryTracksSection categories={categories} />
          <FeaturedChallengesSection challenges={challenges} />
          <TopResourcesSection resources={topResources} />
        </motion.div>
      </main>
    </div>
  );
}
