"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FiSearch, FiBell, FiUser, FiLogOut, FiSettings,
  FiChevronDown, FiShield, FiPlusCircle, FiBriefcase,
  FiCode, FiBook, FiZap, FiLoader, FiX,
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";

import Logo from "@/public/logo.png";
import Modal from "@/components/ui/Modal";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { logoutThunk } from "@/lib/store/features/auth/auth.actions";
import { AppDispatch, RootState } from "@/lib/store/store";
import { NAV_ITEMS, ROUTES } from "@/constants/routes";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const DIFF_COLOR: Record<string, string> = {
  EASY: "text-emerald-600 bg-emerald-50",
  MEDIUM: "text-amber-600 bg-amber-50",
  HARD: "text-rose-600 bg-rose-50",
};

// ─── Universal Search ─────────────────────────────────────────────────────────
function UniversalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    } catch { setResults(null); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleClear = () => { setQuery(""); setResults(null); setOpen(false); };

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(href);
  };

  const hasResults = results && (
    results.problems?.length > 0 ||
    results.resources?.length > 0 ||
    results.challenges?.length > 0
  );

  return (
    <div ref={ref} className="relative w-full max-w-xs hidden lg:block">
      <div className="relative group">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-1 transition-colors" size={14} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results) setOpen(true); }}
          placeholder="Search problems, courses..."
          className="bg-slate-50 border border-slate-200 text-slate-900 text-sm py-1.5 pl-9 pr-8 w-full focus:w-full focus:outline-none focus:border-primary-1/50 focus:bg-white transition-all duration-300 rounded-sm"
        />
        {loading && <FiLoader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={13} />}
        {!loading && query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
            <FiX size={13} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 shadow-xl rounded-sm z-[100] overflow-hidden max-h-[420px] overflow-y-auto">
          {!hasResults ? (
            <div className="px-4 py-6 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              No results for "{query}"
            </div>
          ) : (
            <>
              {/* Problems */}
              {results.problems?.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <FiCode size={11} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Problems</span>
                  </div>
                  {results.problems.map((p: any) => (
                    <button key={p.problemId} onClick={() => navigate(`/problems/${p.problemId}`)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <span className="text-sm font-semibold text-slate-800 truncate">{p.title}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ml-3 shrink-0 ${DIFF_COLOR[p.difficulty] || "text-slate-500 bg-slate-100"}`}>
                        {p.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Courses */}
              {results.resources?.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <FiBook size={11} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Courses</span>
                  </div>
                  {results.resources.map((r: any) => (
                    <button key={r.id} onClick={() => navigate(`/learn/${r.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <div className="w-8 h-6 bg-slate-100 rounded-sm overflow-hidden shrink-0">
                        {r.previewUrl
                          ? <img src={r.previewUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><FiBook size={10} className="text-slate-400" /></div>}
                      </div>
                      <span className="text-sm font-semibold text-slate-800 truncate flex-1">{r.title}</span>
                      <span className="text-[10px] font-black text-emerald-600 shrink-0">
                        {r.price === 0 ? "Free" : `NPR ${r.price}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Challenges */}
              {results.challenges?.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <FaTrophy size={10} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Challenges</span>
                  </div>
                  {results.challenges.map((c: any) => (
                    <button key={c.challengeId} onClick={() => navigate(`/challenges/${c.slug}`)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <span className="text-sm font-semibold text-slate-800 truncate">{c.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${DIFF_COLOR[c.difficulty] || "text-slate-500 bg-slate-100"}`}>
                          {c.difficulty}
                        </span>
                        <span className="text-[9px] font-bold text-amber-600 flex items-center gap-0.5">
                          <FiZap size={9} />{c.points}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* View all */}
              <button onClick={() => navigate(`/problems?search=${encodeURIComponent(query)}`)}
                className="w-full px-4 py-3 text-[10px] font-black uppercase text-primary-1 tracking-wider hover:bg-slate-50 transition-colors border-t border-slate-100 text-center"
              >
                View all results for "{query}" →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Streak Badge ─────────────────────────────────────────────────────────────
function StreakBadge({ streak }: { streak: number }) {
  const [hovered, setHovered] = useState(false);

  if (!streak || streak === 0) return null;

  return (
    <div className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button className="flex items-center gap-1 bg-orange-50 border border-orange-200 hover:border-orange-400 px-2.5 py-1.5 rounded-sm transition-all group">
        <span className="text-base leading-none">🔥</span>
        <span className="text-[12px] font-black text-orange-600 tabular-nums">{streak}</span>
      </button>

      {/* Tooltip — LeetCode style */}
      {hovered && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 text-white rounded-sm shadow-2xl z-[100] p-4 animate-in fade-in duration-150">
          {/* Arrow */}
          <div className="absolute -top-1.5 right-4 w-3 h-3 bg-slate-900 rotate-45" />

          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-black text-white">{streak}-Day Streak</p>
              <p className="text-[10px] text-slate-400 font-bold">Keep it going!</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 space-y-1.5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">How streaks work</p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Solve at least one problem every day to maintain your streak. Missing a day resets it to 0.
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current</span>
            <span className="text-sm font-black text-orange-400">{streak} days 🔥</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();

  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [activeModal, setActiveModal] = useState<"login" | "register" | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setShowProfileOptions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeModals = () => setActiveModal(null);

  return (
    <nav className="bg-white border-b border-slate-200 px-8 flex items-center justify-between h-16 sticky top-0 z-50">
      {/* LEFT */}
      <div className="flex items-center h-full">
        <Link href={ROUTES.HOME} className="flex items-center">
          <Image src={Logo} alt="logo" className="w-20 object-contain brightness-90" />
        </Link>
        <div className="h-6 w-px bg-slate-200 mx-8" />
        <ul className="flex items-center gap-8 h-full">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <li key={item.path} className="relative flex items-center h-full group">
                <Link href={item.path}
                  className={`text-[13px] font-bold transition-colors duration-200 ${isActive ? "text-primary-1" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {item.name}
                </Link>
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-1" />}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-200 transition-all group-hover:w-full" />
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <UniversalSearch />

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {user?.role === "ADMIN" && (
              <button onClick={() => router.push("/admin/")}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer bg-rose-50 border border-rose-100 text-rose-600 rounded-sm hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-sm group"
              >
                <FiShield size={14} className="group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-wider">Admin Panel</span>
              </button>
            )}

            {/* Streak */}
            <StreakBadge streak={user?.streak ?? 0} />

            {/* Bell */}
            <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <FiBell size={20} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-1 rounded-full" />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={modalRef}>
              <button
                onClick={() => setShowProfileOptions(!showProfileOptions)}
                className={`flex items-center gap-2 px-2 py-1 transition-all border ${showProfileOptions ? "border-slate-300 bg-slate-50" : "border-transparent hover:border-slate-200"} rounded-sm`}
              >
                <div className="w-7 h-7 bg-slate-100 rounded-sm overflow-hidden flex items-center justify-center border border-slate-200">
                  {user?.profile_pic_url ? (
                    <Image src={user.profile_pic_url} alt="profile" width={40} height={40} className="object-cover" />
                  ) : (
                    <FiUser size={14} className="text-slate-400" />
                  )}
                </div>
                <span className="text-sm font-bold text-slate-700">{user?.username || "Account"}</span>
                <FiChevronDown size={14} className={`text-slate-400 transition-transform ${showProfileOptions ? "rotate-180" : ""}`} />
              </button>

              {showProfileOptions && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 shadow-xl py-1 z-60 rounded-sm">
                  <Link href={`/u/${user?.userId}/`}
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-primary-1 text-sm font-medium"
                  >
                    <FiUser size={16} /> My Profile
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  {user?.role === "CREATOR" ? (
                    <Link href="/creator/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-emerald-600 hover:bg-emerald-50 text-sm font-bold"
                    >
                      <FiPlusCircle size={16} /> Creator Studio
                    </Link>
                  ) : (
                    <Link href="/creator/apply"
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 group"
                    >
                      <div className="flex items-center gap-3 text-slate-600 group-hover:text-primary-1 text-sm font-medium transition-colors">
                        <FiBriefcase size={16} />
                        <span>{user?.creatorStatus === "PENDING" ? "Application Status" : "Become a Creator"}</span>
                      </div>
                      {user?.creatorStatus === "PENDING" && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </Link>
                  )}
                  <div className="my-1 border-t border-slate-100" />
                  <Link href={ROUTES.MAIN.SETTINGS}
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-primary-1 text-sm font-medium"
                  >
                    <FiSettings size={16} /> Settings
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button onClick={() => dispatch(logoutThunk())}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-rose-500 hover:bg-rose-50 text-sm font-bold transition-colors text-left"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveModal("login")}
              className="text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors px-2"
            >
              Log In
            </button>
            <button onClick={() => setActiveModal("register")}
              className="bg-slate-900 text-white text-sm font-bold px-5 py-2 hover:bg-slate-800 transition-all rounded-sm shadow-sm active:scale-95"
            >
              Join
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={activeModal === "login"} onClose={closeModals}>
        <LoginForm onSuccess={closeModals} onSwitch={() => setActiveModal("register")} />
      </Modal>
      <Modal isOpen={activeModal === "register"} onClose={closeModals}>
        <RegisterForm onSuccess={closeModals} onSwitch={() => setActiveModal("login")} />
      </Modal>
    </nav>
  );
}
