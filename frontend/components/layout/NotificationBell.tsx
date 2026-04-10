"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiBell, FiCheck, FiTrash2, FiX } from "react-icons/fi";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
};

async function fetchNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const res = await fetch(`${API}/notifications`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_ICON: Record<string, string> = {
  FIRST_SOLVE: "✅",
  LEVEL_UP: "🚀",
  BADGE_EARNED: "🏅",
  CHALLENGE_COMPLETED: "⚡",
  CREATOR_APPROVED: "🎉",
  CREATOR_REJECTED: "📋",
  SYSTEM: "🔔",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const markRead = useMutation({
    mutationFn: async (id?: string) => {
      const url = id ? `${API}/notifications/${id}/read` : `${API}/notifications/read`;
      await fetch(url, { method: "PATCH", credentials: "include" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${API}/notifications/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.link) window.location.href = n.link;
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors"
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-primary-1 rounded-full flex items-center justify-center text-[9px] font-black text-white px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-sm z-[100] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markRead.mutate(undefined)}
                  className="flex items-center gap-1 text-[10px] font-bold text-primary-1 hover:underline"
                >
                  <FiCheck size={11} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
                <FiX size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group ${!n.isRead ? "bg-blue-50/40" : ""}`}
                >
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className="flex items-start gap-3 flex-1 text-left min-w-0"
                  >
                    <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? "🔔"}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[12px] font-bold text-slate-800 leading-tight ${!n.isRead ? "text-slate-900" : ""}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => remove.mutate(n.id)}
                    className="shrink-0 p-1 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all mt-0.5"
                    aria-label="Delete notification"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
