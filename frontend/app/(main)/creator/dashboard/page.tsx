"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useMyResources, useDeleteResourceMutation, useCreatorStats } from "@/hooks/useResource";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  FiPlus, FiLoader, FiVideo, FiEdit3, FiTrash2, FiEye,
  FiTrendingUp, FiDollarSign, FiBarChart2, FiClock,
  FiSend, FiPackage, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiArrowRight, FiInfo,
} from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

const npr = (val?: number | null) => `NPR ${(val ?? 0).toLocaleString()}`;

const WITHDRAWAL_STATUS: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  PENDING:  { label: "Pending Review", icon: <FiClock size={10} />,       cls: "text-amber-600 bg-amber-50 border-amber-200" },
  PAID:     { label: "Paid",           icon: <FiCheckCircle size={10} />, cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  REJECTED: { label: "Rejected",       icon: <FiXCircle size={10} />,     cls: "text-rose-600 bg-rose-50 border-rose-200" },
};

// ─── Earnings & Withdrawals tab ───────────────────────────────────────────────
function EarningsTab({ stats }: { stats: any }) {
  const qc = useQueryClient();
  const pending   = stats?.pendingEarnings ?? 0;
  const withdrawn = stats?.totalWithdrawn  ?? 0;
  const total     = stats?.totalEarnings   ?? 0;
  const MIN       = 5_000;
  const canWithdraw = pending >= MIN;

  const [showForm,     setShowForm]     = useState(false);
  const [amount,       setAmount]       = useState("");
  const [esewaNumber,  setEsewaNumber]  = useState("");

  const { data: withdrawalData, isLoading: wLoading } = useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: async () => (await api.get("/payments/withdrawals")).data,
    staleTime: 30_000,
  });
  const withdrawals = withdrawalData?.withdrawals ?? [];
  const hasPending  = withdrawals.some((w: any) => w.status === "PENDING");

  const requestWithdrawal = useMutation({
    mutationFn: (data: { amount: number; esewaNumber: string }) =>
      api.post("/payments/withdraw", data),
    onSuccess: () => {
      toast.success("Withdrawal request submitted! Admin will review within 3–5 business days.");
      setShowForm(false);
      setAmount("");
      setEsewaNumber("");
      qc.invalidateQueries({ queryKey: ["my-withdrawals"] });
      qc.invalidateQueries({ queryKey: ["creator-stats"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Request failed"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!esewaNumber.trim()) return toast.error("eSewa number is required");
    if (amt < MIN)           return toast.error(`Minimum withdrawal is NPR ${MIN.toLocaleString()}`);
    if (amt > pending)       return toast.error("Amount exceeds available balance");
    requestWithdrawal.mutate({ amount: amt, esewaNumber });
  };

  return (
    <div className="space-y-8">

      {/* ── Balance overview ── */}
      <section>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Earnings Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-slate-100 rounded-sm p-5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Lifetime Earnings</p>
            <p className="text-2xl font-black text-slate-900">{npr(total)}</p>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <FiInfo size={9} /> 80% of all sales
            </p>
          </div>
          <div className={`border-2 rounded-sm p-5 ${canWithdraw ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-100"}`}>
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${canWithdraw ? "text-emerald-600" : "text-slate-400"}`}>
              Available to Withdraw
            </p>
            <p className={`text-2xl font-black ${canWithdraw ? "text-emerald-700" : "text-slate-900"}`}>{npr(pending)}</p>
            {!canWithdraw && pending > 0 ? (
              <p className="text-[10px] text-amber-600 mt-1.5 font-bold">
                {npr(MIN - pending)} more to unlock
              </p>
            ) : (
              <p className={`text-[10px] mt-1.5 ${canWithdraw ? "text-emerald-500" : "text-slate-400"}`}>
                Min {npr(MIN)} to withdraw
              </p>
            )}
          </div>
          <div className="bg-white border-2 border-slate-100 rounded-sm p-5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Withdrawn</p>
            <p className="text-2xl font-black text-slate-900">{npr(withdrawn)}</p>
            <p className="text-[10px] text-slate-400 mt-1.5">Paid to your eSewa</p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-50 border border-slate-200 rounded-sm p-5">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">How Payments Work</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[11px] text-slate-600">
          {[
            { step: "1", label: "Student pays", sub: "via eSewa checkout" },
            { step: "2", label: "Platform fee",  sub: "20% retained by CodeArena" },
            { step: "3", label: "80% credited",  sub: "to your available balance" },
            { step: "4", label: "You request",   sub: "withdrawal (min NPR 5,000)" },
            { step: "5", label: "Admin approves", sub: "manual transfer to eSewa" },
          ].map((s, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center shrink-0">{s.step}</div>
                <p className="font-bold text-slate-700 mt-1 whitespace-nowrap">{s.label}</p>
                <p className="text-slate-400 text-[9px] whitespace-nowrap">{s.sub}</p>
              </div>
              {i < arr.length - 1 && <FiArrowRight size={12} className="text-slate-300 shrink-0 mt-0 sm:-mt-4" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Withdrawal request ── */}
      <section>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Request Withdrawal</p>
        <div className="bg-white border-2 border-slate-100 rounded-sm p-6">
          {hasPending ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-sm">
              <FiAlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-black text-amber-800">Pending Request Under Review</p>
                <p className="text-[10px] text-amber-600 mt-0.5">
                  You have a withdrawal request awaiting admin approval. You can submit another once this is resolved.
                </p>
              </div>
            </div>
          ) : !showForm ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-900">
                  {canWithdraw ? `${npr(pending)} available` : "Not enough balance yet"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {canWithdraw
                    ? "You can request a withdrawal now."
                    : `Minimum NPR ${MIN.toLocaleString()} required. You need ${npr(MIN - pending)} more.`}
                </p>
              </div>
              <button
                disabled={!canWithdraw}
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
              >
                <FiSend size={12} /> Request Withdrawal
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5">
                  eSewa Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={esewaNumber}
                  onChange={(e) => setEsewaNumber(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full border-2 border-slate-200 rounded-sm px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900 transition-colors"
                  required
                />
                <p className="text-[9px] text-slate-400 mt-1">Funds will be transferred to this eSewa number.</p>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5">
                  Amount (NPR) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min NPR ${MIN.toLocaleString()}`}
                  min={MIN}
                  max={pending}
                  className="w-full border-2 border-slate-200 rounded-sm px-4 py-2.5 text-sm font-medium outline-none focus:border-slate-900 transition-colors"
                  required
                />
                <p className="text-[9px] text-slate-400 mt-1">Available: {npr(pending)}</p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border-2 border-slate-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestWithdrawal.isPending}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all disabled:opacity-40"
                >
                  <FiSend size={11} />
                  {requestWithdrawal.isPending ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── Withdrawal history ── */}
      <section>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Withdrawal History</p>
        {wLoading ? (
          <div className="flex justify-center py-10">
            <FiLoader className="animate-spin text-slate-300" size={22} />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-sm py-12 text-center">
            <FiDollarSign size={24} className="text-slate-200 mx-auto mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {withdrawals.map((w: any) => {
                const s = WITHDRAWAL_STATUS[w.status] ?? WITHDRAWAL_STATUS.PENDING;
                return (
                  <div key={w.id} className="flex items-start justify-between px-5 py-4 gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-sm border ${s.cls}`}>{s.icon}</div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{npr(w.amount)}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{w.accountDetails}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          Requested {new Date(w.requestedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        {w.resolvedAt && (
                          <p className="text-[9px] text-slate-400">
                            Resolved {new Date(w.resolvedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-sm border ${s.cls}`}>
                        {s.icon} {s.label}
                      </span>
                      {w.adminNote && (
                        <p className="text-[9px] text-slate-400 mt-1.5 italic max-w-[180px] text-right leading-relaxed">
                          "{w.adminNote}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Courses tab ──────────────────────────────────────────────────────────────
function CoursesTab({ resources, resourcesLoading, topResourceId, onDelete }: {
  resources: any[];
  resourcesLoading: boolean;
  topResourceId: string | null;
  onDelete: (e: React.MouseEvent, id: string, title: string) => void;
}) {
  if (resourcesLoading) {
    return (
      <div className="flex justify-center py-20">
        <FiLoader className="animate-spin text-slate-300" size={28} />
      </div>
    );
  }

  if (!resources?.length) {
    return (
      <div className="border-2 border-dashed border-slate-200 py-24 text-center rounded-sm">
        <FiVideo size={32} className="text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">No resources yet</p>
        <Link
          href={ROUTES.CREATOR.CREATE}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-1 transition-all"
        >
          <FiPlus size={12} /> Create your first resource
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {resources.length} resource{resources.length !== 1 ? "s" : ""}
        </p>
        <Link
          href={ROUTES.CREATOR.CREATE}
          className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
        >
          <FiPlus size={11} /> Add New
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res: any) => (
          <div key={res.id} className="relative group">
            {res.id === topResourceId && (res.views || 0) > 0 && (
              <div className="absolute -top-2.5 left-4 z-30 bg-primary-1 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <FiTrendingUp size={9} /> Top
              </div>
            )}
            <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
              <Link
                href={`/creator/dashboard/edit/${res.id}`}
                className="p-2 bg-white text-slate-700 rounded-sm border border-slate-200 shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
              >
                <FiEdit3 size={12} />
              </Link>
              <button
                onClick={(e) => onDelete(e, res.id, res.title)}
                className="p-2 bg-white text-rose-500 rounded-sm border border-slate-200 shadow-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
              >
                <FiTrash2 size={12} />
              </button>
            </div>
            <Link
              href={`/creator/dashboard/${res.id}`}
              className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden block hover:border-slate-900 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                {res.previewUrl
                  ? <img src={res.previewUrl} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  : <div className="w-full h-full flex items-center justify-center"><FiVideo size={24} className="text-slate-300" /></div>}
                <div className="absolute bottom-2 left-2 bg-white/90 text-slate-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm">
                  <FiEye size={9} /> {res.views || 0}
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${res.isApproved ? "bg-emerald-500 text-white" : "bg-amber-400 text-white"}`}>
                    {res.isApproved ? "Live" : "Review"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black uppercase text-sm tracking-tight text-slate-900 truncate mb-1">{res.title}</h3>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-slate-400">
                    <FiVideo size={10} />
                    <span className="text-[10px] font-bold">{res._count?.modules || 0} lessons</span>
                  </div>
                  <span className="text-sm font-black text-emerald-600">
                    {res.price === 0 ? "FREE" : npr(res.price)}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CreatorDashboard() {
  const { user }                                          = useSelector((state: RootState) => state.auth);
  const { data: resources, isLoading: resourcesLoading } = useMyResources();
  const { data: stats,     isLoading: statsLoading }     = useCreatorStats();
  const deleteResource                                    = useDeleteResourceMutation();
  const [activeTab, setActiveTab]                        = useState<"courses" | "earnings">("courses");

  const topResourceId = resources?.length
    ? [...resources].sort((a: any, b: any) => (b.views || 0) - (a.views || 0))[0]?.id
    : null;

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) return;
    deleteResource.mutate(id, {
      onSuccess: () => toast.success("Resource deleted."),
      onError:   (err: any) => toast.error(err.message || "Delete failed"),
    });
  };

  if (user?.role !== "CREATOR" && user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Access Denied</h2>
          <p className="text-slate-500 text-sm mt-2">Verified creators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* ── Banner ── */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Creator Studio</p>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {user?.full_name?.split(" ")[0]}&apos;s Dashboard
            </h1>
          </div>
          <Link
            href={ROUTES.CREATOR.CREATE}
            className="flex items-center gap-2 bg-primary-1 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-2 transition-all active:scale-95 shrink-0"
          >
            <FiPlus size={13} /> New Resource
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Top stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Active Resources",
              value: statsLoading ? null : (stats?.resourceCount ?? resources?.length ?? 0),
              icon:  <FiPackage size={16} className="text-primary-1" />,
              sub:   "published courses",
            },
            {
              label: "Total Earnings",
              value: statsLoading ? null : npr(stats?.totalEarnings),
              icon:  <FiDollarSign size={16} className="text-emerald-500" />,
              sub:   "80% of all sales",
            },
            {
              label: "Available",
              value: statsLoading ? null : npr(stats?.pendingEarnings),
              icon:  <FiBarChart2 size={16} className="text-blue-500" />,
              sub:   "ready to withdraw",
            },
            {
              label: "Total Views",
              value: statsLoading ? null : (stats?.totalResourceViews ?? 0),
              icon:  <FiEye size={16} className="text-violet-500" />,
              sub:   "across all resources",
            },
          ].map((s, i) => (
            <div key={i} className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center gap-4">
              <div className="w-9 h-9 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {s.value === null
                    ? <FiLoader className="animate-spin text-slate-200" size={18} />
                    : s.value}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="border-b-2 border-slate-100">
          <div className="flex gap-0">
            {[
              { id: "courses",  label: "Manage Courses",        icon: <FiPackage size={13} />,    badge: resources?.length },
              { id: "earnings", label: "Earnings & Withdrawals", icon: <FiDollarSign size={13} />, badge: null },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest border-b-2 -mb-[2px] transition-all ${
                  activeTab === t.id
                    ? "border-slate-900 text-slate-900 bg-white"
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.icon}
                {t.label}
                {t.badge ? (
                  <span className="bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded-full">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="pb-12">
          {activeTab === "courses" && (
            <CoursesTab
              resources={resources ?? []}
              resourcesLoading={resourcesLoading}
              topResourceId={topResourceId}
              onDelete={handleDelete}
            />
          )}
          {activeTab === "earnings" && <EarningsTab stats={stats} />}
        </div>
      </div>
    </div>
  );
}
