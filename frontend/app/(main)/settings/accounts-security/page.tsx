"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { FaTrash, FaLock } from "react-icons/fa";
import { toast } from "sonner"; 

// Sub-components
import { SocialConnections } from "@/components/settings/SocialConnections";
import { SetPasswordModal } from "@/components/settings/modals/SetPasswordModal";
import { ChangePasswordModal } from "@/components/settings/modals/ChangePasswordModal";
import { DeleteAccountModal } from "@/components/settings/modals/DeleteAccountModal";

export default function SecuritySettings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [modals, setModals] = useState({
    set: false,
    change: false,
    delete: false,
  });

  const toggleModal = (key: keyof typeof modals, val: boolean) =>
    setModals((prev) => ({ ...prev, [key]: val }));

  // --- INTERCEPT DELETION ---
  const handleDeleteClick = () => {
    // Check 'has_password' to ensure they can verify ownership
    if (!user?.has_password) {
      toast.error("Set a password first to verify ownership before deletion.");
      toggleModal("set", true); 
      return;
    }
    toggleModal("delete", true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Account & Security</h1>
        <p className="text-slate-500 text-sm">
          Manage your credentials and security preferences.
        </p>
      </header>

      {/* 1. Password Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
           <FaLock className="text-slate-400" size={14} />
           <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Authentication</h2>
        </div>
        
        <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-sm shadow-sm">
          <div className="space-y-1">
            <p className="font-bold text-sm text-slate-900">Login Password</p>
            <p className="text-xs text-slate-500">
              {user?.has_password
                ? "Your account is protected by a secure password."
                : "No password set. You are currently using Social Login only."}
            </p>
          </div>
          <button
            onClick={() => toggleModal(user?.has_password ? "change" : "set", true)}
            className={`px-5 py-2 rounded-sm text-xs font-bold transition-all ${
              user?.has_password
                ? "text-slate-600 border border-slate-200 hover:bg-slate-50"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
          >
            {user?.has_password ? "Change Password" : "Set Password"}
          </button>
        </div>
      </section>

      {/* 2. Social Connections Section */}
      <SocialConnections user={user} />

      {/* 3. Danger Zone */}
      <section className="p-6 border border-red-100 bg-red-50/50 rounded-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider">Danger Zone</h2>
          <p className="text-xs text-slate-600">
            Deleting your account will permanently remove all your progress and data.
          </p>
        </div>
        <button
          onClick={handleDeleteClick}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-sm text-xs font-bold hover:bg-red-700 transition-all shadow-sm active:scale-95"
        >
          <FaTrash size={12} /> Delete Account
        </button>
      </section>

      {/* Modals */}
      <SetPasswordModal
        isOpen={modals.set}
        onClose={() => toggleModal("set", false)}
      />
      <ChangePasswordModal
        isOpen={modals.change}
        onClose={() => toggleModal("change", false)}
      />
      <DeleteAccountModal
        isOpen={modals.delete}
        onClose={() => toggleModal("delete", false)}
      />
    </div>
  );
}