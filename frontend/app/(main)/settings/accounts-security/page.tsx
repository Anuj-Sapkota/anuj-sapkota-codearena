"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { FiLock, FiShield, FiTrash2, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { toast } from "sonner";

import { SocialConnections } from "@/components/settings/SocialConnections";
import { SetPasswordModal } from "@/components/settings/modals/SetPasswordModal";
import { ChangePasswordModal } from "@/components/settings/modals/ChangePasswordModal";
import { DeleteAccountModal } from "@/components/settings/modals/DeleteAccountModal";

export default function SecuritySettings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [modals, setModals] = useState({ set: false, change: false, delete: false });
  const toggle = (key: keyof typeof modals, val: boolean) =>
    setModals((p) => ({ ...p, [key]: val }));

  const handleDeleteClick = () => {
    if (!user?.has_password) {
      toast.error("Set a password first to verify ownership before deletion.");
      toggle("set", true);
      return;
    }
    toggle("delete", true);
  };

  return (
    <div className="space-y-6">

      {/* Section header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Account & Security</h2>
        <p className="text-[11px] text-slate-400 mt-1">Manage your credentials and connected accounts.</p>
      </div>

      {/* ── Password ── */}
      <section className="space-y-3">
        <p className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <FiLock size={10} /> Authentication
        </p>

        <div className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 ${user?.has_password ? "bg-emerald-50" : "bg-amber-50"}`}>
              {user?.has_password
                ? <FiCheckCircle size={16} className="text-emerald-500" />
                : <FiAlertCircle size={16} className="text-amber-500" />}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Login Password</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {user?.has_password
                  ? "Your account is protected with a password."
                  : "No password set — using social login only."}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggle(user?.has_password ? "change" : "set", true)}
            className={`shrink-0 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
              user?.has_password
                ? "border-2 border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900"
                : "bg-slate-900 text-white hover:bg-primary-1"
            }`}
          >
            {user?.has_password ? "Change" : "Set Password"}
          </button>
        </div>
      </section>

      {/* ── Social Connections ── */}
      <section className="space-y-3">
        <p className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <FiShield size={10} /> Connected Accounts
        </p>
        <SocialConnections user={user} />
      </section>

      {/* ── Danger Zone ── */}
      <section className="space-y-3">
        <p className="flex items-center gap-1.5 text-[9px] font-black text-red-400 uppercase tracking-[0.2em]">
          <FiTrash2 size={10} /> Danger Zone
        </p>
        <div className="bg-white border-2 border-red-100 rounded-sm p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-slate-900">Delete Account</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Permanently removes all your data. This cannot be undone.
            </p>
          </div>
          <button
            onClick={handleDeleteClick}
            className="shrink-0 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95"
          >
            <FiTrash2 size={11} /> Delete
          </button>
        </div>
      </section>

      <SetPasswordModal isOpen={modals.set} onClose={() => toggle("set", false)} />
      <ChangePasswordModal isOpen={modals.change} onClose={() => toggle("change", false)} />
      <DeleteAccountModal isOpen={modals.delete} onClose={() => toggle("delete", false)} />
    </div>
  );
}
