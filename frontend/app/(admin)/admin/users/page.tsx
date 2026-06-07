"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { API } from "@/constants/api.constants";
import { toast } from "sonner";
import {
  FiSearch, FiLoader, FiUser, FiEdit3, FiSlash,
  FiChevronLeft, FiChevronRight, FiCheck,
} from "react-icons/fi";

const ROLES = ["ALL", "USER", "CREATOR", "ADMIN"] as const;
type RoleFilter = typeof ROLES[number];

const ROLE_STYLES: Record<string, string> = {
  ADMIN:   "bg-rose-50 text-rose-600 border-rose-100",
  CREATOR: "bg-violet-50 text-violet-600 border-violet-100",
  USER:    "bg-slate-50 text-slate-500 border-slate-100",
};

function useUsers(params: { page: number; search: string; role: string }) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const { data } = await api.get(API.ADMIN.USERS, {
        params: {
          page: params.page,
          limit: 10,
          search: params.search || undefined,
          role: params.role !== "ALL" ? params.role : undefined,
        },
      });
      return data;
    },
    staleTime: 30_000,
  });
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("");

  const { data, isLoading } = useUsers({ page, search: debouncedSearch, role: roleFilter });
  const users = data?.users ?? [];
  const meta = data?.meta ?? { total: 0, pages: 1 };

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      api.patch(API.ADMIN.USER_ROLE(userId), { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated");
      setEditingUser(null);
    },
    onError: () => toast.error("Failed to update role"),
  });

  const banUser = useMutation({
    mutationFn: (userId: number) => api.patch(API.ADMIN.USER_BAN(userId), {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User demoted to USER role");
    },
    onError: () => toast.error("Failed to ban user"),
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Users<span className="text-primary-1">.</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {meta.total} registered users
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by name, username or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-sm py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-slate-300 outline-none focus:border-slate-900 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                roleFilter === r
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white border-2 border-slate-100 rounded-sm">
          <FiLoader className="animate-spin text-slate-300" size={28} />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-slate-200 rounded-sm">
          <FiUser size={28} className="text-slate-200 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No users found</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-slate-50/60">
                  {["User", "Email", "Role", "XP / Level", "Submissions", "Joined", "Actions"].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ${i === 6 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u: any) => (
                  <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {u.profile_pic_url
                            ? <img src={u.profile_pic_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-[10px] font-black text-slate-400">{u.username?.[0]?.toUpperCase()}</span>}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{u.full_name}</p>
                          <p className="text-[10px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4">
                      <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      {editingUser?.userId === u.userId ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="border-2 border-slate-200 rounded-sm px-2 py-1 text-[10px] font-black uppercase outline-none focus:border-slate-900"
                          >
                            <option value="USER">User</option>
                            <option value="CREATOR">Creator</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <button
                            onClick={() => updateRole.mutate({ userId: u.userId, role: newRole })}
                            disabled={updateRole.isPending}
                            className="w-7 h-7 bg-emerald-500 text-white rounded-sm flex items-center justify-center hover:bg-emerald-600 transition-all"
                          >
                            <FiCheck size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-sm border ${ROLE_STYLES[u.role] ?? ROLE_STYLES.USER}`}>
                          {u.role}
                        </span>
                      )}
                    </td>

                    {/* XP */}
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-mono text-slate-600">
                        {(u.xp || 0).toLocaleString()} XP · Lv.{u.level || 1}
                      </span>
                    </td>

                    {/* Submissions */}
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-black text-slate-700 tabular-nums">
                        {u._count?.submissions ?? 0}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(u.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingUser(u); setNewRole(u.role); }}
                          className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-primary-1 hover:border-primary-1/40 transition-all"
                          title="Change role"
                        >
                          <FiEdit3 size={13} />
                        </button>
                        {u.role !== "USER" && (
                          <button
                            onClick={() => { if (confirm(`Demote @${u.username} to USER?`)) banUser.mutate(u.userId); }}
                            className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all"
                            title="Demote to User"
                          >
                            <FiSlash size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && meta.pages > 1 && (
        <div className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-sm px-5 py-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Page {page} of {meta.pages}
          </p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-500 hover:border-slate-900 disabled:opacity-30 transition-all">
              <FiChevronLeft size={13} />
            </button>
            <span className="text-[10px] font-black text-slate-900 px-3 py-1.5 border-2 border-slate-100 rounded-sm bg-slate-50 tabular-nums">
              {page} / {meta.pages}
            </span>
            <button disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-500 hover:border-slate-900 disabled:opacity-30 transition-all">
              <FiChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
