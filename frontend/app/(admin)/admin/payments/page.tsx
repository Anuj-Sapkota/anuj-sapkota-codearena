"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  FiDollarSign, FiLoader, FiCheck, FiX,
  FiCheckCircle, FiClock, FiAlertCircle, FiShoppingBag,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";

const npr = (v: number) => `NPR ${v.toLocaleString()}`;

const STATUS_STYLES: Record<string, string> = {
  PENDING:  "text-amber-600 bg-amber-50 border-amber-100",
  PAID:     "text-emerald-600 bg-emerald-50 border-emerald-100",
  REJECTED: "text-rose-600 bg-rose-50 border-rose-100",
};

const STATUS_FILTERS = ["ALL", "PENDING", "PAID", "REJECTED"] as const;

export default function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"withdrawals" | "purchases">("withdrawals");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [purchasePage, setPurchasePage] = useState(1);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: async () => (await api.get("/payments/admin/stats")).data,
    staleTime: 30_000,
  });

  const { data: withdrawalsData, isLoading: wLoading } = useQuery({
    queryKey: ["admin-withdrawals", statusFilter],
    queryFn: async () => (await api.get("/payments/admin/withdrawals", { params: { status: statusFilter } })).data,
    staleTime: 30_000,
    enabled: tab === "withdrawals",
  });

  const { data: purchasesData, isLoading: pLoading } = useQuery({
    queryKey: ["admin-purchases", purchasePage],
    queryFn: async () => (await api.get("/payments/admin/purchases", { params: { page: purchasePage } })).data,
    staleTime: 30_000,
    enabled: tab === "purchases",
  });

  const stats = statsData?.stats ?? {};
  const withdrawals = withdrawalsData?.withdrawals ?? [];
  const purchases = purchasesData?.purchases ?? [];
  const purchaseMeta = purchasesData?.meta ?? { total: 0, pages: 1 };

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      api.patch(`/payments/admin/withdrawals/${id}`, { status, adminNote: note }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      qc.invalidateQueries({ queryKey: ["admin-payment-stats"] });
      toast.success(status === "PAID" ? "Marked as paid — transfer funds to creator's eSewa" : "Withdrawal rejected");
      setReviewingId(null);
      setAdminNote("");
    },
    onError: () => toast.error("Action failed"),
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
          Payments<span className="text-primary-1">.</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Revenue, withdrawals & checkout history
        </p>
      </div>

      {/* Architecture note */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-sm p-5">
        <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">Payment Flow</p>
        <p className="text-[12px] text-blue-600 leading-relaxed">
          Student pays → <strong>CodeArena eSewa merchant account</strong> → 20% platform fee retained → 80% credited to creator's pending balance →
          Creator requests withdrawal (min NPR 5,000) → <strong>Admin approves → manually transfer to creator's eSewa number → mark as Paid</strong>.
        </p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex items-center justify-center h-24"><FiLoader className="animate-spin text-slate-300" size={24} /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Gross Revenue",      value: npr(stats.grossRevenue ?? 0),   icon: <FiDollarSign size={14} className="text-slate-500" /> },
            { label: "Platform Fee (20%)", value: npr(stats.platformFee ?? 0),    icon: <FiDollarSign size={14} className="text-primary-1" /> },
            { label: "Creator Payouts",    value: npr(stats.creatorPayouts ?? 0), icon: <FiDollarSign size={14} className="text-emerald-500" /> },
            { label: "Pending Requests",   value: `${stats.pendingWithdrawals?.count ?? 0} · ${npr(stats.pendingWithdrawals?.amount ?? 0)}`,
              icon: <FiClock size={14} className="text-amber-500" />, alert: (stats.pendingWithdrawals?.count ?? 0) > 0 },
            { label: "Total Paid Out",     value: npr(stats.totalPaidOut ?? 0),   icon: <FiCheckCircle size={14} className="text-emerald-500" /> },
          ].map((s: any, i) => (
            <div key={i} className={`bg-white border-2 rounded-sm p-4 flex items-center gap-3 ${s.alert ? "border-amber-200 bg-amber-50/30" : "border-slate-100"}`}>
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${s.alert ? "bg-amber-100" : "bg-slate-50 border border-slate-100"}`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">{s.label}</p>
                <p className={`text-sm font-black mt-0.5 ${s.alert ? "text-amber-600" : "text-slate-900"}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100">
        {[
          { id: "withdrawals", label: "Withdrawal Requests", icon: <FiDollarSign size={12} /> },
          { id: "purchases",   label: "Checkout History",    icon: <FiShoppingBag size={12} /> },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
              tab === t.id ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Withdrawals tab ── */}
      {tab === "withdrawals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {withdrawals.length} request{withdrawals.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-1">
              {STATUS_FILTERS.map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                    statusFilter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {wLoading ? (
            <div className="flex items-center justify-center h-48 bg-white border-2 border-slate-100 rounded-sm">
              <FiLoader className="animate-spin text-slate-300" size={24} />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-slate-200 rounded-sm">
              <FiDollarSign size={28} className="text-slate-200 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No withdrawal requests</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100 bg-slate-50/60">
                    {["Creator", "Amount & Balance", "eSewa / Account", "Requested", "Status", "Actions"].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ${i === 5 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals.map((w: any) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-slate-900">{w.user?.full_name}</p>
                        <p className="text-[10px] text-slate-400">@{w.user?.username}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{w.user?.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-slate-900">{npr(w.amount)}</p>
                        <p className="text-[9px] text-slate-400">Pending: {npr(w.user?.pendingEarnings ?? 0)}</p>
                        <p className="text-[9px] text-slate-400">Withdrawn: {npr(w.user?.totalWithdrawn ?? 0)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[11px] font-bold text-slate-700 font-mono">{w.accountDetails}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[10px] font-mono text-slate-500">
                          {new Date(w.requestedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-sm border ${STATUS_STYLES[w.status] ?? ""}`}>
                          {w.status}
                        </span>
                        {w.adminNote && <p className="text-[9px] text-slate-400 mt-1 italic">{w.adminNote}</p>}
                      </td>
                      <td className="px-5 py-4">
                        {w.status === "PENDING" && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => reviewMutation.mutate({ id: w.id, status: "PAID" })}
                              disabled={reviewMutation.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
                            >
                              <FiCheck size={10} /> Approve & Pay
                            </button>
                            <button
                              onClick={() => setReviewingId(w.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-rose-200 text-rose-500 rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all"
                            >
                              <FiX size={10} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Purchases tab ── */}
      {tab === "purchases" && (
        <div className="space-y-4">
          {pLoading ? (
            <div className="flex items-center justify-center h-48 bg-white border-2 border-slate-100 rounded-sm">
              <FiLoader className="animate-spin text-slate-300" size={24} />
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-slate-200 rounded-sm">
              <FiShoppingBag size={28} className="text-slate-200 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No purchases yet</p>
            </div>
          ) : (
            <>
              <div className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-100 bg-slate-50/60">
                      {["Student", "Course", "Creator", "Amount", "Date"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-slate-900">{p.user?.full_name}</p>
                          <p className="text-[10px] text-slate-400">@{p.user?.username}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[11px] font-bold text-slate-700 truncate max-w-[180px]">{p.resource?.title}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[11px] text-slate-500">@{p.resource?.creator?.username}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-slate-900">{npr(p.amount)}</p>
                          <p className="text-[9px] text-slate-400">Creator: {npr(p.amount * 0.8)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[10px] font-mono text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {purchaseMeta.pages > 1 && (
                <div className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-sm px-5 py-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {purchaseMeta.total} total · page {purchasePage} of {purchaseMeta.pages}
                  </p>
                  <div className="flex gap-2">
                    <button disabled={purchasePage === 1} onClick={() => setPurchasePage((p) => p - 1)}
                      className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-500 hover:border-slate-900 disabled:opacity-30 transition-all">
                      <FiChevronLeft size={13} />
                    </button>
                    <button disabled={purchasePage >= purchaseMeta.pages} onClick={() => setPurchasePage((p) => p + 1)}
                      className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-500 hover:border-slate-900 disabled:opacity-30 transition-all">
                      <FiChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Reject modal */}
      {reviewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => e.currentTarget === e.target && setReviewingId(null)}>
          <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
              <FiAlertCircle size={14} className="text-rose-500" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Reject Withdrawal</h3>
            </div>
            <div className="p-6">
              <textarea rows={3} className="w-full border-2 border-slate-200 rounded-sm px-4 py-3 text-sm outline-none focus:border-slate-900 resize-none"
                placeholder="Reason for rejection (visible to creator)..."
                value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => { setReviewingId(null); setAdminNote(""); }}
                className="flex-1 py-2.5 border-2 border-slate-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-slate-900 transition-all">
                Cancel
              </button>
              <button disabled={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate({ id: reviewingId, status: "REJECTED", note: adminNote })}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-40">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
