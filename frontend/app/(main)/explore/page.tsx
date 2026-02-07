"use client";
import React from "react";
import { WelcomeHeader } from "@/components/explore/WelcomeHeader";
import { CategoryTracks } from "@/components/explore/CategoryTracks";
import { FeaturedChallenges } from "@/components/challenges/FeaturedChallenges";
import { LearningPlaceholder } from "@/components/explore/LearningPlaceholder";

// Dummy data for simulation
const MOCK_CHALLENGES = [
  { id: 1, title: "Binary_Search_Optimization", difficulty: "EASY", points: 50 },
  { id: 2, title: "Graph_Sync_Protocol", difficulty: "MEDIUM", points: 150 },
  { id: 3, title: "Recursive_Descent_Kernel", difficulty: "HARD", points: 300 },
  { id: 4, title: "Memory_Leak_Detection", difficulty: "EASY", points: 75 },
];

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
        
        <FeaturedChallenges 
          challenges={MOCK_CHALLENGES} 
        />
        
        <LearningPlaceholder />
      </main>
    </div>
  );
}