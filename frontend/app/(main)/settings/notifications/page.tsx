"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  FiBell, FiCheck, FiTrash2, FiArrowRight,
  FiLoader, FiCheckCircle,
} from "react-icons/fi";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
};

const TYPE_ICON: Record<string, string> = {
  FIRST_SOLVE:          "✅",
  LEVEL_UP:             "🚀",
  BADGE_EARNED:         "🏅",
  CHALLENGE_COMPLETED:  "⚡",
  CREATOR_APPROVED:     "🎉",
  CREATOR_REJECTED:     "📋",
  SYSTEM:               "🔔",
};

const TYPE_COLOR: Record<string, string> = {
  FIRST_SOLVE:          "bg-emerald-50 border-emerald-100",
  LEVEL_UP:             "bg-blue-50 border-blue-100",
  BADGE_EARNED:         "bg-amber-50 border-amber-100",
  CHALLENGE_COMPLETED:  "bg-violet-50 border-violet-100",
  CREATOR_APPROVED:     "bg-primary-1/5 border-primary-1/20",
  CREATOR_REJECTED:     "bg-slate-50 border-slate-200",
  SYSTEM:               "bg-slate-50 border-slate-200",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFull(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Notification | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data as { notifications: Notification[]; unreadCount: number };
    },
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: async (id?: string) => {
      const url = id ? `/notifications/${id}/read` : `/notifications/read`;
      await api.patch(url);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      if (selected?.id === id) setSelected(null);
    },
  });

  const handleSelect = (n: Notification) => {
    setSelected(n);
    if (!n.isRead) markRead.mutate(n.id);
  };

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b-2 border-slate-100 bg-slate-50 shrink-0">
        <div className="flex items-center gap-3">
          <FiBell size={16} className="text-slate-500" />
          <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-primary-1 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markRead.mutate(undefined)}
            disabled={markRead.isPending}
            className="flex items-center gap-1.5 text-[10px] font-black text-primary-1 uppercase tracking-widest hover:underline disabled:opacity-50"
          >
            <FiCheck size={11} /> Mark all read
          </button>
        )}
      </div>

      {/* Body — two panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: list ── */}
        <div className={`border-r-2 border-slate-100 overflow-y-auto flex-shrink-0 ${selected ? "hidden sm:flex sm:flex-col w-72 lg:w-80" : "flex flex-col w-full"}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <FiLoader className="animate-spin text-slate-300" size={24} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <span className="text-4xl mb-3">🔔</span>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No notifications yet</p>
              <p className="text-[11px] text-slate-300 mt-1">Solve problems to earn achievements</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-slate-50">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all group hover:bg-slate-50 ${
                    selected?.id === n.id ? "bg-primary-1/5 border-l-2 border-primary-1" : "border-l-2 border-transparent"
                  } ${!n.isRead ? "bg-blue-50/40" : ""}`}
                >
                  {/* Icon */}
                  <span className="text-xl shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? "🔔"}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[12px] font-black leading-tight truncate ${!n.isRead ? "text-slate-900" : "text-slate-700"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-primary-1 rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{n.message}</p>
                    <p className="text-[10px] text-slate-300 font-bold mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: detail ── */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="p-6 lg:p-8 h-full flex flex-col">
              {/* Mobile back */}
              <button
                onClick={() => setSelected(null)}
                className="sm:hidden flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-slate-700"
              >
                ← Back
              </button>

              {/* Icon + type badge */}
              <div className={`inline-flex items-center gap-3 self-start px-4 py-3 rounded-sm border-2 mb-6 ${TYPE_COLOR[selected.type] ?? "bg-slate-50 border-slate-200"}`}>
                <span className="text-3xl">{TYPE_ICON[selected.type] ?? "🔔"}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {selected.type.replace(/_/g, " ")}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight mb-3">
                {selected.title}
              </h2>

              {/* Message */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6 border-l-4 border-primary-1 pl-4">
                {selected.message}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
                <FiCheckCircle size={11} className="text-emerald-500" />
                <span>{formatFull(selected.createdAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-auto pt-6 border-t-2 border-slate-100">
                {selected.link && (
                  <Link
                    href={selected.link}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-1 transition-all active:scale-95"
                  >
                    View Details <FiArrowRight size={12} />
                  </Link>
                )}
                <button
                  onClick={() => remove.mutate(selected.id)}
                  disabled={remove.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-200 text-rose-400 text-[11px] font-black uppercase tracking-widest rounded-sm hover:border-rose-300 hover:bg-rose-50 transition-all disabled:opacity-50"
                >
                  {remove.isPending
                    ? <FiLoader size={12} className="animate-spin" />
                    : <FiTrash2 size={12} />
                  }
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-sm flex items-center justify-center mb-4">
                <FiBell size={24} className="text-slate-300" />
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Select a notification
              </p>
              <p className="text-[11px] text-slate-300 mt-1">
                Click any notification on the left to read it
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
