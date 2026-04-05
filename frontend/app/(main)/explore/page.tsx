"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useCategories } from "@/hooks/useCategories";
import { usePublicChallenges } from "@/hooks/useChallenges";
import Link from "next/link";
import api from "@/lib/api";
import {
  FaArrowRight, FaCode, FaDatabase, FaBrain, FaTerminal,
  FaFire, FaTrophy, FaStar, FaBook,
} from "react-icons/fa";
import { FiTrendingUp, FiBook, FiZap } from "react-icons/fi";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";

const CAT_ICONS = [
  <FaCode />, <FaDatabase />, <FaBrain />, <FaTerminal />,
  <FaCode />, <FaDatabase />, <FaBrain />, <FaTerminal />,
];

export default function ExplorePage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: categories = [] } = useCategories();
  const { data: challenges = [] } = usePublicChallenges();

  const [topResources, setTopResources] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    // Fetch top resources — public, no auth needed
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/resources/explore?sortBy=popular&limit=3`)
      .then((r) => r.json())
      .then((data) => {
        // Response is now { items: [], meta: {} }
        const items = Array.isArray(data) ? data : (data.items || []);
        const sorted = [...items].sort((a, b) => (b.views || 0) - (a.views || 0));
        setTopResources(sorted.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  // Fetch rank — public endpoint now
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/leaderboard?period=weekly&type=points`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.rankings || []).find((r: any) => r.userId === user.userId);
        setUserRank(found ? found.rank : null);
      })
      .catch(() => {});
  }, [isAuthenticated, user]);

  const firstName = user?.full_name?.split(" ")[0] || "";
  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = user?.streak ?? 0;
  const xpInLevel = xp % 500;
  const xpToNext = 500 - xpInLevel;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* ── WELCOME HEADER ── */}
        {isAuthenticated && user ? (
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
              WELCOME_BACK, <span className="text-primary-1 italic">{firstName}</span>
            </h1>
            <p className="text-slate-500 font-medium mb-6">
              {userRank
                ? <>Your current rank is <span className="text-slate-900 font-bold">#{userRank}</span>. You are <span className="text-primary-1 font-bold">{xpToNext} XP</span> away from level {level + 1}.</>
                : <>You are <span className="text-primary-1 font-bold">{xpToNext} XP</span> away from level {level + 1}. Keep solving!</>}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "XP Points", value: xp.toLocaleString(), icon: <FiZap className="text-primary-1" /> },
                { label: "Level", value: `Lv. ${level}`, icon: <FaStar className="text-amber-500" /> },
                { label: "Weekly Rank", value: userRank ? `#${userRank}` : "—", icon: <FaTrophy className="text-amber-500" /> },
                { label: "Streak", value: `${streak} 🔥`, icon: <FaFire className="text-rose-500" /> },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-3">
                  <div className="text-lg">{s.icon}</div>
                  <div>
                    <p className="text-lg font-black text-slate-900">{s.value}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* XP bar */}
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progress to Level {level + 1}</span>
                <span className="text-[10px] font-black text-primary-1">{xpInLevel} / 500 XP</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-1 transition-all duration-700 rounded-full" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
              </div>
            </div>
          </header>
        ) : (
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
              CODE. LEARN. <span className="text-primary-1 italic">COMPETE.</span>
            </h1>
            <p className="text-slate-500 font-medium mb-6 max-w-xl">
              Solve algorithmic problems, take on live challenges, learn from creator courses, and climb the leaderboard.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/register" className="bg-primary-1 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-2 transition-all shadow-sm">
                Get Started Free
              </Link>
              <Link href="/problems" className="border border-slate-200 text-slate-700 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:border-slate-400 transition-all bg-white">
                Browse Problems
              </Link>
            </div>
          </header>
        )}

        {/* ── CATEGORY TRACKS ── */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">01. Specialized_Tracks</h2>
              <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Browse problems by category</p>
            </div>
            <Link href="/problems" className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-1 hover:gap-3 transition-all group">
              View All Problems <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.length > 0
              ? categories.slice(0, 8).map((cat, i) => (
                <Link key={cat.categoryId} href={`/problems?categoryIds=${cat.categoryId}`}
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

        {/* ── FEATURED CHALLENGES ── */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">02. Featured_Challenges</h2>
              <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Handpicked algorithmic contests for you</p>
            </div>
            <Link href="/challenges" className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-1 hover:gap-3 transition-all group">
              View All Challenges <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.length > 0
              ? challenges.slice(0, 4).map((c) => <ChallengeCard key={c.challengeId} challenge={c} />)
              : (
                <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-sm text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Active Challenges Found</p>
                </div>
              )}
          </div>
        </section>

        {/* ── LEARNING PATHWAYS ── */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">03. Learning_Pathways</h2>
              <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Top courses by views</p>
            </div>
            <Link href="/learn" className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-1 hover:gap-3 transition-all group">
              Browse All Courses <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {topResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topResources.map((r) => (
                <Link key={r.id} href={`/resource/${r.id}`}
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

      </main>
    </div>
  );
}
