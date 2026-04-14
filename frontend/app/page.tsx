"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { ROUTES } from "@/constants/routes";
import {
  FiCode, FiZap, FiTrendingUp, FiAward,
  FiArrowRight, FiCheck, FiBookOpen, FiShield, FiMenu, FiX,
} from "react-icons/fi";
import { LuSwords } from "react-icons/lu";

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { value: "500+", label: "Problems" },
  { value: "10K+", label: "Submissions" },
  { value: "1K+", label: "Developers" },
  { value: "50+", label: "Challenges" },
];

const FEATURES = [
  {
    icon: <FiCode size={20} className="text-primary-1" />,
    title: "Algorithmic Problems",
    desc: "Solve curated problems across data structures, algorithms, and system design. Track your progress with real-time feedback.",
  },
  {
    icon: <LuSwords size={20} className="text-primary-1" />,
    title: "Live Challenges",
    desc: "Compete in timed contests against the community. Earn bonus XP for solving all problems before the clock runs out.",
  },
  {
    icon: <FiBookOpen size={20} className="text-primary-1" />,
    title: "Creator Courses",
    desc: "Learn from verified instructors through structured video courses. Earn badges and certificates on completion.",
  },
  {
    icon: <FiTrendingUp size={20} className="text-primary-1" />,
    title: "Leaderboard & XP",
    desc: "Climb weekly and monthly rankings. Every accepted submission earns XP, levels, and streak rewards.",
  },
  {
    icon: <FiAward size={20} className="text-primary-1" />,
    title: "Badges & Achievements",
    desc: "Unlock official badges by completing courses and challenges. Showcase them on your public profile.",
  },
  {
    icon: <FiShield size={20} className="text-primary-1" />,
    title: "Community Discussions",
    desc: "Discuss approaches, share solutions, and learn from peers. Built-in moderation keeps the community clean.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create an account", desc: "Sign up in seconds with email or OAuth." },
  { step: "02", title: "Pick a problem", desc: "Browse by difficulty, category, or challenge." },
  { step: "03", title: "Write & submit code", desc: "Code in JavaScript, Python, Java, or C++." },
  { step: "04", title: "Climb the ranks", desc: "Earn XP, badges, and leaderboard positions." },
];

const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "How it works", id: "how-it-works" },
  { label: "Problems", id: "problems" },
];

const CODE_SNIPPET = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}

// ✓ All test cases passed
// Runtime: 68ms · Memory: 42.1MB`;

// ─── Smooth scroll helper ─────────────────────────────────────────────────────
function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navbar shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b transition-all duration-300 ${scrolled ? "border-slate-200 shadow-sm" : "border-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollTo("hero")} className="text-lg font-black text-slate-900 uppercase tracking-tighter">
            Code<span className="text-primary-1">Arena</span>
          </button>

          {/* Desktop nav — smooth scroll links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-[12px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Hey, {user?.username}
                </span>
                <Link
                  href={ROUTES.MAIN.EXPLORE}
                  className="flex items-center gap-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-primary-1 transition-all active:scale-95"
                >
                  Dashboard <FiArrowRight size={12} />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  className="text-[11px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors px-2"
                >
                  Log In
                </Link>
                <Link
                  href={ROUTES.AUTH.REGISTER}
                  className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-primary-1 transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-500 hover:text-slate-900"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
            {NAV_LINKS.map((item) => (
              <button
                key={item.id}
                onClick={() => { scrollTo(item.id); setMobileOpen(false); }}
                className="block w-full text-left text-[12px] font-bold text-slate-600 hover:text-slate-900 uppercase tracking-widest py-2"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  href={ROUTES.MAIN.EXPLORE}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest px-5 py-3 rounded-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Go to Dashboard <FiArrowRight size={12} />
                </Link>
              ) : (
                <>
                  <Link href={ROUTES.AUTH.LOGIN} onClick={() => setMobileOpen(false)}
                    className="text-center text-[11px] font-black text-slate-600 uppercase tracking-widest py-2"
                  >
                    Log In
                  </Link>
                  <Link href={ROUTES.AUTH.REGISTER} onClick={() => setMobileOpen(false)}
                    className="text-center bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest px-5 py-3 rounded-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-1/8 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-1/10 border border-primary-1/20 text-primary-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-primary-1 rounded-full animate-pulse" />
              Now with Live Challenges & Creator Courses
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-6">
              Code.<br />
              <span className="text-primary-1">Compete.</span><br />
              Level Up.
            </h1>

            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
              The algorithmic coding platform built for developers who want to grow fast.
              Solve problems, win challenges, learn from creators, and climb the leaderboard.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <Link
                  href={ROUTES.MAIN.EXPLORE}
                  className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-1 transition-all shadow-lg active:scale-95"
                >
                  Go to Dashboard <FiArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  href={ROUTES.AUTH.REGISTER}
                  className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-1 transition-all shadow-lg active:scale-95"
                >
                  Start Coding Free <FiArrowRight size={14} />
                </Link>
              )}
              <button
                onClick={() => scrollTo("features")}
                className="flex items-center gap-2 border-2 border-slate-200 text-slate-700 px-8 py-4 text-[11px] font-black uppercase tracking-widest rounded-sm hover:border-slate-900 transition-all"
              >
                See Features
              </button>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D"].map((l) => (
                  <div key={l} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-bold">
                Join <span className="text-slate-900">1,000+</span> developers already competing
              </p>
            </div>
          </div>

          {/* Code preview card */}
          <div className="absolute right-0 top-0 hidden lg:block w-[420px]">
            <div className="bg-[#1e1e1e] rounded-sm border border-slate-800 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#252526] border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-[10px] font-mono text-slate-500">two-sum.js</span>
              </div>
              <pre className="p-5 text-[12px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
                <code>{CODE_SNIPPET}</code>
              </pre>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white border-2 border-slate-100 rounded-sm px-4 py-3 shadow-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-50 rounded-sm flex items-center justify-center">
                <FiCheck size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Accepted</p>
                <p className="text-[9px] text-slate-400 font-bold">68ms · 42.1MB</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{s.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-3">Everything you need</p>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Built for serious<br />developers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border-2 border-slate-100 rounded-sm p-6 hover:border-primary-1/30 hover:shadow-[0_8px_30px_rgba(19,139,81,0.06)] transition-all group">
                <div className="w-10 h-10 bg-primary-1/10 rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary-1/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">{f.title}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-3">Simple process</p>
            <h2 className="text-4xl font-black uppercase tracking-tighter">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-slate-700 z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-3">{step.step}</div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">{step.title}</h3>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problems showcase ── */}
      <section id="problems" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-3">For every level</p>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6">
                Problems for<br />every skill level
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                From beginner-friendly array problems to hard dynamic programming challenges.
                Filter by category, difficulty, and status to find exactly what you need.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Easy", color: "bg-emerald-500", pct: "70%", desc: "Arrays, Strings, Basic Math" },
                  { label: "Medium", color: "bg-amber-500", pct: "50%", desc: "Trees, Graphs, DP" },
                  { label: "Hard", color: "bg-rose-500", pct: "25%", desc: "Advanced Algorithms" },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider w-14">{d.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${d.color} rounded-full`} style={{ width: d.pct }} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold w-40 hidden sm:block">{d.desc}</span>
                  </div>
                ))}
              </div>
              <Link
                href={ROUTES.MAIN.PROBLEMS}
                className="inline-flex items-center gap-2 mt-8 text-[11px] font-black text-primary-1 uppercase tracking-widest hover:gap-3 transition-all"
              >
                Browse all problems <FiArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { title: "Two Sum", diff: "Easy", diffColor: "text-emerald-600 bg-emerald-50", pts: "50 XP", status: "SOLVED" },
                { title: "Longest Substring Without Repeating Characters", diff: "Medium", diffColor: "text-amber-600 bg-amber-50", pts: "100 XP", status: "ATTEMPTED" },
                { title: "Median of Two Sorted Arrays", diff: "Hard", diffColor: "text-rose-600 bg-rose-50", pts: "200 XP", status: "UNSOLVED" },
                { title: "Valid Parentheses", diff: "Easy", diffColor: "text-emerald-600 bg-emerald-50", pts: "50 XP", status: "SOLVED" },
              ].map((p) => (
                <div key={p.title} className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-sm px-5 py-4 hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${p.status === "SOLVED" ? "bg-emerald-500" : p.status === "ATTEMPTED" ? "bg-amber-500" : "bg-slate-200"}`} />
                    <span className="text-sm font-bold text-slate-900 truncate">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-sm ${p.diffColor}`}>{p.diff}</span>
                    <span className="text-[10px] font-black text-primary-1">{p.pts}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-primary-1/15 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-4">Ready to start?</p>
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-6">
            Your coding journey<br />starts here.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-lg mx-auto">
            Join thousands of developers sharpening their skills on CodeArena.
            Free to start. No credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href={ROUTES.MAIN.EXPLORE}
                className="flex items-center gap-2 bg-primary-1 text-white px-10 py-4 text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-2 transition-all shadow-lg shadow-primary-1/20 active:scale-95"
              >
                Go to Dashboard <FiArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  href={ROUTES.AUTH.REGISTER}
                  className="flex items-center gap-2 bg-primary-1 text-white px-10 py-4 text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-2 transition-all shadow-lg shadow-primary-1/20 active:scale-95"
                >
                  Create Free Account <FiArrowRight size={14} />
                </Link>
                <Link
                  href={ROUTES.MAIN.EXPLORE}
                  className="flex items-center gap-2 border border-slate-700 text-slate-300 px-10 py-4 text-[11px] font-black uppercase tracking-widest rounded-sm hover:border-slate-400 hover:text-white transition-all"
                >
                  Explore Platform
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0a0a0a] border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <button onClick={() => scrollTo("hero")} className="text-lg font-black text-white uppercase tracking-tighter">
            Code<span className="text-primary-1">Arena</span>
          </button>
          <div className="flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-[11px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            © 2025 CodeArena
          </p>
        </div>
      </footer>

    </div>
  );
}
