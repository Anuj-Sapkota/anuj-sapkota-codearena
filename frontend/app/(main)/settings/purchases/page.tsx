"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { FiShoppingBag, FiLoader, FiExternalLink } from "react-icons/fi";

const npr = (v: number) => `NPR ${v.toLocaleString()}`;

export default function PurchaseHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: async () => (await api.get("/payments/my-purchases")).data,
    staleTime: 60_000,
  });

  const purchases = data?.purchases ?? [];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Purchase History</h2>
        <p className="text-[11px] text-slate-400 mt-1">All courses you've enrolled in.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <FiLoader className="animate-spin text-slate-300" size={24} />
        </div>
      ) : purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <FiShoppingBag size={36} className="mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest">No purchases yet</p>
          <Link href="/learn" className="mt-4 text-[10px] font-black text-primary-1 uppercase tracking-widest hover:underline">
            Browse Courses →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p: any) => (
            <div key={p.id} className="flex items-center gap-4 p-4 bg-white border-2 border-slate-100 rounded-sm hover:border-slate-200 transition-all">
              {/* Thumbnail */}
              <div className="w-16 h-12 bg-slate-100 rounded-sm overflow-hidden shrink-0">
                {p.resource?.previewUrl
                  ? <img src={p.resource.previewUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><FiShoppingBag size={16} className="text-slate-300" /></div>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{p.resource?.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  by {p.resource?.creator?.full_name} · {p.resource?._count?.modules || 0} lessons
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-mono">
                  {new Date(p.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>

              {/* Amount + link */}
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-900">{npr(p.amount)}</p>
                <Link
                  href={`/resource/${p.resource?.id}`}
                  className="flex items-center gap-1 text-[9px] font-black text-primary-1 uppercase tracking-widest hover:underline mt-1"
                >
                  <FiExternalLink size={10} /> Open
                </Link>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-sm">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {purchases.length} purchase{purchases.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm font-black text-slate-900">
              Total: {npr(purchases.reduce((s: number, p: any) => s + (p.amount || 0), 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
