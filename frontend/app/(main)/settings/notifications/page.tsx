"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FiBell, FiCheck, FiTrash2, FiLoader, FiCheckCircle } from "react-icons/fi";
import {
  useNotifications, useMarkAllRead, useMarkOneRead, useDeleteNotification,
  type Notification,
} from "@/hooks/useNotifications";
import { ROUTES } from "@/constants/routes";

const TYPE_STYLES: Record<string, { dot: string; bg: string }> = {
  CREATOR_APPROVED:    { dot: "bg-emerald-500", bg: "bg-emerald-50" },
  CREATOR_REJECTED:    { dot: "bg-rose-500",    bg: "bg-rose-50" },
  BADGE_EARNED:        { dot: "bg-amber-500",   bg: "bg-amber-50" },
  CHALLENGE_COMPLETED: { dot: "bg-violet-500",  bg: "bg-violet-50" },
  FIRST_SOLVE:         { dot: "bg-blue-500",    bg: "bg-blue-50" },
  LEVEL_UP:            { dot: "bg-primary-1",   bg: "bg-emerald-50" },
  SYSTEM:              { dot: "bg-slate-400",   bg: "bg-slate-50" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markOneRead = useMarkOneRead();
  const deleteOne = useDeleteNotification();

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  const handleClick = (n: Notification) => {
    if (!n.isRead) markOneRead.mutate(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Notifications</h2>
          <p className="text-[11px] text-slate-400 mt-1">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            <FiCheck size={11} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <FiLoader className="animate-spin text-slate-300" size={24} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <FiBell size={36} className="mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.SYSTEM;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-sm border-2 transition-all ${
                  n.isRead ? "border-slate-100 bg-white" : `border-slate-200 ${style.bg}`
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? "bg-slate-200" : style.dot}`} />

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleClick(n)}
                >
                  <p className={`text-sm font-black text-slate-900 ${n.link ? "hover:text-primary-1 transition-colors" : ""}`}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markOneRead.mutate(n.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                      title="Mark as read"
                    >
                      <FiCheckCircle size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteOne.mutate(n.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    title="Delete"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
