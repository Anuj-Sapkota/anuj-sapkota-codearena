"use client";
import React from "react";
import { WelcomeHeader } from "@/components/explore/WelcomeHeader";
import { CategoryTracks } from "@/components/explore/CategoryTracks";
import { FeaturedChallenges } from "@/components/challenges/FeaturedChallenges";
import { LearningPlaceholder } from "@/components/explore/LearningPlaceholder";


export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-6xl mx-auto px-6 py-12">
        <WelcomeHeader 
          user="USER_01" 
          rank="1,240" 
          pointsToNextTier={45} 
        />
        
        <CategoryTracks />
        
        <FeaturedChallenges/>
        
        <LearningPlaceholder />
      </main>
    </div>
  );
}