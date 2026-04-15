"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FiSearch, FiUser, FiLogOut, FiSettings,
  FiChevronDown, FiShield, FiPlusCircle, FiBriefcase,
  FiCode, FiBook, FiZap, FiLoader, FiX, FiMenu,
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
import NotificationBell from "@/components/layout/NotificationBell";
import { levelProgress } from "@/lib/gamification";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const DIFF_COLOR: Record<string, string> = {
  EASY:   "text-emerald-600 bg-emerald-50",
  MEDIUM: "text-amber-600 bg-amber-50",
  HARD:   "text-rose-600 bg-rose-50",
};

// ─── Universal Search ─────────────────────────────────────────────────────────
function UniversalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      }
      if (e.key === "Escape") { setOpen(false); setFocused(false); inputRef.current?.blur(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
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
    setOpen(false); setQuery(""); setResults(null);
    router.push(href);
  };

  const hasResults = results && (
    results.problems?.length > 0 ||
    results.resources?.length > 0 ||
    results.challenges?.length > 0
  );

  return (
    <div ref={ref} className="relative hidden lg:block">
      {/* Input */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-sm border-2 transition-all duration-200 bg-slate-50 ${focused ? "border-primary-1 bg-white w-72" : "border-slate-200 w-56 hover:border-slate-300"}`}>
        <FiSearch size={13} className={`shrink-0 transition-colors ${focused ? "text-primary-1" : "text-slate-400"}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { setFocused(true); if (results) setOpen(true); }}
          placeholder="Search..."
          className="flex-1 bg-transparent text-[12px] font-medium text-slate-900 placeholder:text-slate-400 outline-none min-w-0"
        />
        {loading
          ? <FiLoader size={12} className="animate-spin text-slate-400 shrink-0" />
          : query
            ? <button onClick={handleClear}><FiX size={12} className="text-slate-400 hover:text-slate-700 shrink-0" /></button>
            : <kbd className="hidden xl:flex items-center gap-0.5 text-[9px] font-black text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">⌘K</kbd>
        }
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-80 bg-white border-2 border-slate-100 shadow-2xl rounded-sm z-[200] overflow-hidden">
          {!hasResults ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No results for "{query}"</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {results.problems?.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 sticky top-0">
                    <FiCode size={10} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Problems</span>
                  </div>
                  {results.problems.map((p: any) => (
                    <button key={p.problemId} onClick={() => navigate(`/problems/${p.problemId}`)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 group"
                    >
                      <span className="text-[12px] font-semibold text-slate-800 truncate group-hover:text-primary-1 transition-colors">{p.title}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ml-3 shrink-0 ${DIFF_COLOR[p.difficulty] || "text-slate-500 bg-slate-100"}`}>
                        {p.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.resources?.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 sticky top-0">
                    <FiBook size={10} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Courses</span>
                  </div>
                  {results.resources.map((r: any) => (
                    <button key={r.id} onClick={() => navigate(`/learn/${r.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 group"
                    >
                      <div className="w-8 h-6 bg-slate-100 rounded-sm overflow-hidden shrink-0">
                        {r.previewUrl
                          ? <img src={r.previewUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><FiBook size={9} className="text-slate-400" /></div>}
                      </div>
                      <span className="text-[12px] font-semibold text-slate-800 truncate flex-1 group-hover:text-primary-1 transition-colors">{r.title}</span>
                      <span className="text-[10px] font-black text-emerald-600 shrink-0">{r.price === 0 ? "Free" : `NPR ${r.price}`}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.challenges?.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 sticky top-0">
                    <FaTrophy size={9} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Challenges</span>
                  </div>
                  {results.challenges.map((c: any) => (
                    <button key={c.challengeId} onClick={() => navigate(`/challenges/${c.slug}`)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 group"
                    >
                      <span className="text-[12px] font-semibold text-slate-800 truncate group-hover:text-primary-1 transition-colors">{c.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${DIFF_COLOR[c.difficulty] || "text-slate-500 bg-slate-100"}`}>{c.difficulty}</span>
                        <span className="text-[9px] font-bold text-amber-600 flex items-center gap-0.5"><FiZap size={9} />{c.points}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => navigate(`/problems?search=${encodeURIComponent(query)}`)}
                className="w-full px-4 py-3 text-[10px] font-black uppercase text-primary-1 tracking-wider hover:bg-slate-50 transition-colors border-t-2 border-slate-100 text-center"
              >
                View all results →
              </button>
            </div>
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
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-100 hover:border-orange-300 px-2.5 py-1.5 rounded-sm transition-all">
        <span className="text-sm leading-none">🔥</span>
        <span className="text-[12px] font-black text-orange-600 tabular-nums">{streak}</span>
      </button>
      {hovered && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 text-white rounded-sm shadow-2xl z-[200] p-4 animate-in fade-in duration-150">
          <div className="absolute -top-1.5 right-4 w-3 h-3 bg-slate-900 rotate-45" />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-[12px] font-black text-white">{streak}-Day Streak</p>
              <p className="text-[10px] text-slate-400">Keep it going!</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-700 pt-3">
            Solve at least one problem every day to maintain your streak.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── XP Level Pill ────────────────────────────────────────────────────────────
function XPPill({ xp, level }: { xp: number; level: number }) {
  const pct = levelProgress(xp);

  return (
    <div className="hidden xl:flex items-center gap-2 bg-primary-1/8 border-2 border-primary-1/15 px-3 py-1.5 rounded-sm">
      <FiZap size={11} className="text-primary-1 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black text-primary-1 uppercase tracking-wide">Lv.{level}</span>
          <span className="text-[9px] text-slate-400 font-bold">{xp.toLocaleString()} XP</span>
        </div>
        <div className="w-16 h-1 bg-primary-1/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary-1 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();

  const [showProfile, setShowProfile] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [activeModal, setActiveModal] = useState<"login" | "register" | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setShowMobile(false); }, [pathname]);

  const closeModals = () => setActiveModal(null);

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm border-b-2 border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* ── Left: Logo + Nav ── */}
          <div className="flex items-center gap-8 h-full">
            {/* Logo */}
            <Link href={ROUTES.HOME} className="shrink-0">
              <Image src={Logo} alt="CodeArena" className="w-[88px] object-contain brightness-90" />
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center h-full gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                return (
                  <li key={item.path} className="relative h-full flex items-center">
                    <Link
                      href={item.path}
                      className={`px-3 py-1.5 text-[12px] font-black uppercase tracking-widest rounded-sm transition-all ${
                        isActive
                          ? "text-primary-1 bg-primary-1/8"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {item.name}
                    </Link>
                    {isActive && (
                      <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-1 rounded-full" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Right ── */}
          <div className="flex items-center gap-2.5">
            <UniversalSearch />

            {isAuthenticated ? (
              <>
                {/* Admin badge */}
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => router.push("/admin/")}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all text-[10px] font-black uppercase tracking-wider group"
                  >
                    <FiShield size={12} className="group-hover:scale-110 transition-transform" />
                    Admin
                  </button>
                )}

                {/* XP pill */}
                <XPPill xp={user?.xp ?? 0} level={user?.level ?? 1} />

                {/* Streak */}
                <StreakBadge streak={user?.streak ?? 0} />

                {/* Notifications */}
                <NotificationBell />

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfile((v) => !v)}
                    className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-sm border-2 transition-all ${
                      showProfile ? "border-slate-300 bg-slate-50" : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-sm overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                      {user?.profile_pic_url
                        ? <Image src={user.profile_pic_url} alt="avatar" width={28} height={28} className="object-cover w-full h-full" />
                        : <span className="text-[11px] font-black text-slate-500 uppercase">{user?.username?.[0] ?? "U"}</span>
                      }
                    </div>
                    <span className="hidden sm:block text-[12px] font-black text-slate-700 max-w-[80px] truncate">
                      {user?.username || "Account"}
                    </span>
                    <FiChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown */}
                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-slate-100 shadow-2xl rounded-sm z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b-2 border-slate-100 bg-slate-50">
                        <p className="text-[12px] font-black text-slate-900 truncate">{user?.username}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link href={`/u/${user?.userId}/`} onClick={() => setShowProfile(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-1 transition-colors"
                        >
                          <FiUser size={14} /> My Profile
                        </Link>

                        <div className="my-1 mx-4 border-t border-slate-100" />

                        {user?.role === "CREATOR" || user?.role === "ADMIN" ? (
                          <Link href="/creator/dashboard" onClick={() => setShowProfile(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <FiPlusCircle size={14} /> Creator Studio
                          </Link>
                        ) : (
                          <Link href="/creator/apply" onClick={() => setShowProfile(false)}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                          >
                            <div className="flex items-center gap-3 text-[12px] font-bold text-slate-600 group-hover:text-primary-1 transition-colors">
                              <FiBriefcase size={14} />
                              {user?.creatorStatus === "PENDING" ? "Application Status" : "Become a Creator"}
                            </div>
                            {user?.creatorStatus === "PENDING" && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                          </Link>
                        )}

                        <div className="my-1 mx-4 border-t border-slate-100" />

                        <Link href={ROUTES.MAIN.SETTINGS} onClick={() => setShowProfile(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-1 transition-colors"
                        >
                          <FiSettings size={14} /> Settings
                        </Link>

                        <div className="my-1 mx-4 border-t border-slate-100" />

                        <button
                          onClick={async () => {
                            setShowProfile(false);
                            await dispatch(logoutThunk());
                            router.replace(ROUTES.MAIN.EXPLORE);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-[12px] font-bold text-rose-500 hover:bg-rose-50 transition-colors text-left"
                        >
                          <FiLogOut size={14} /> Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModal("login")}
                  className="px-4 py-2 text-[11px] font-black text-slate-600 hover:text-slate-900 uppercase tracking-widest transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setActiveModal("register")}
                  className="px-5 py-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-1 transition-all active:scale-95 shadow-sm"
                >
                  Join Free
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setShowMobile((v) => !v)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              {showMobile ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {showMobile && (
          <div className="md:hidden border-t-2 border-slate-100 bg-white animate-in slide-in-from-top-2 duration-200">
            {/* Mobile search */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-sm">
                <FiSearch size={13} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search problems, courses..."
                  className="flex-1 bg-transparent text-[12px] font-medium text-slate-900 placeholder:text-slate-400 outline-none"
                  onChange={(e) => router.push(`/problems?search=${encodeURIComponent(e.target.value)}`)}
                />
              </div>
            </div>

            {/* Nav links */}
            <div className="px-4 py-2 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                return (
                  <Link key={item.path} href={item.path}
                    className={`flex items-center px-3 py-3 rounded-sm text-[12px] font-black uppercase tracking-widest transition-colors ${
                      isActive ? "text-primary-1 bg-primary-1/8" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Auth / user section */}
            <div className="px-4 py-3 border-t-2 border-slate-100">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                      {user?.profile_pic_url
                        ? <Image src={user.profile_pic_url} alt="avatar" width={32} height={32} className="object-cover" />
                        : <span className="text-[12px] font-black text-slate-500 uppercase">{user?.username?.[0]}</span>
                      }
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-slate-900">{user?.username}</p>
                      <p className="text-[10px] text-primary-1 font-bold">Lv.{user?.level} · {user?.xp} XP</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => { await dispatch(logoutThunk()); router.replace(ROUTES.MAIN.EXPLORE); }}
                    className="flex items-center gap-1.5 text-[11px] font-black text-rose-500 uppercase tracking-wider"
                  >
                    <FiLogOut size={13} /> Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setShowMobile(false); setActiveModal("login"); }}
                    className="flex-1 py-2.5 border-2 border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-widest rounded-sm hover:border-slate-400 transition-all"
                  >
                    Log In
                  </button>
                  <button onClick={() => { setShowMobile(false); setActiveModal("register"); }}
                    className="flex-1 py-2.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-1 transition-all"
                  >
                    Join Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <Modal isOpen={activeModal === "login"} onClose={closeModals}>
        <LoginForm onSuccess={closeModals} onSwitch={() => setActiveModal("register")} />
      </Modal>
      <Modal isOpen={activeModal === "register"} onClose={closeModals}>
        <RegisterForm onSuccess={closeModals} onSwitch={() => setActiveModal("login")} />
      </Modal>
    </>
  );
}
