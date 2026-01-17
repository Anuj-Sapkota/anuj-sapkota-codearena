"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { FaTrash } from "react-icons/fa";

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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-10">
      <header>
        <h1 className="text-2xl font-bold">Account & Security</h1>
        <p className="text-gray-500">
          Manage your credentials and connected apps.
        </p>
      </header>

      {/* 1. Password Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">
          Password
        </h2>
        <div className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
          <div>
            <p className="font-semibold text-sm">Login Password</p>
            <p className="text-xs text-gray-500">
              {user?.has_password
                ? "Secure password is set"
                : "No password set (Social Login only)"}
            </p>
          </div>
          <button
            onClick={() =>
              toggleModal(user?.has_password ? "change" : "set", true)
            }
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              user?.has_password
                ? "text-blue-600 border border-blue-100"
                : "bg-blue-600 text-white"
            }`}
          >
            {user?.has_password ? "Change Password" : "Set Password"}
          </button>
        </div>
      </section>

      {/* 2. Social Connections Section */}
      <SocialConnections user={user} />

      {/* 3. Danger Zone */}
      <section className="p-6 border border-red-100 bg-red-50/50 rounded-2xl space-y-4 flex justify-between">
        <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
        <button
          onClick={() => toggleModal("delete", true)}
          className="flex items-center gap-2 bg-red-600 text-white px-2 py-3 rounded-xl font-bold hover:bg-red-700 transition-all"
        >
          <FaTrash size={14} /> Delete My Account
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
