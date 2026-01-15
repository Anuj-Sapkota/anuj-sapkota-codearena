"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { RootState, AppDispatch } from "@/app/lib/store/store";
import { setInitialPasswordThunk, logoutThunk } from "@/app/lib/store/features/authActions";
import { updateSocialLinks } from "@/app/lib/store/features/authSlice";
import { authService } from "@/app/lib/services/authService";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import Image, { StaticImageData } from "next/image";
import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";
import { FaTrash, FaSpinner } from "react-icons/fa";
import { AuthProvider, SetPasswordFormValues } from "@/app/types/auth";
import config from "@/app/config";

// Atomic & Base Components
import { FormLabel, FormInput, FormButton } from "@/app/components/ui/FormElements";
import { BaseModal } from "@/app/components/ui/BaseModal";

export default function SecuritySettings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  // UI States
  const [busyProvider, setBusyProvider] = useState<AuthProvider | null>(null);
  const [isSetPasswordModalOpen, setIsSetPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Forms
  const setPasswordForm = useForm<SetPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const deleteAccountForm = useForm({
    defaultValues: { password: "" },
  });

  const passwordValue = setPasswordForm.watch("password");

  // Logic: Set Password
  const onSetPassword = async (data: SetPasswordFormValues) => {
    try {
      setIsSubmitting(true);
      await dispatch(setInitialPasswordThunk(data.password)).unwrap();
      toast.success("Password set successfully!");
      setIsSetPasswordModalOpen(false);
      setPasswordForm.reset();
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.error : "Failed to set password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logic: Delete Account
  const onConfirmDelete = async (data: { password?: string }) => {
    try {
      setIsDeleting(true);
      await authService.deleteAccountApi(data.password!);
      await dispatch(logoutThunk());
      window.location.href = "/login";
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.error : "Incorrect password");
    } finally {
      setIsDeleting(false);
    }
  };

  // Logic: Connections
  const handleConnect = (provider: AuthProvider) => {
    window.location.href = `${config.apiUrl}/auth/${provider}`;
  };

  const handleUnlink = async (provider: AuthProvider) => {
    if (!user?.has_password && !(provider === "google" ? user?.github_id : user?.google_id)) {
      return toast.error("Please set a password first to avoid getting locked out.");
    }
    if (confirm(`Are you sure you want to disconnect ${provider}?`)) {
      try {
        setBusyProvider(provider);
        await authService.unlinkOAuthProvider(provider);
        dispatch(updateSocialLinks({ provider, value: null }));
        toast.success(`${provider} unlinked`);
      } catch (err) {
        toast.error("Unlink failed");
      } finally {
        setBusyProvider(null);
      }
    }
  };

  const socialProviders: { id: AuthProvider; name: string; icon: StaticImageData; val: string | null | undefined }[] = [
    { id: "google", name: "Google", icon: GoogleLogoIcon, val: user?.google_id },
    { id: "github", name: "GitHub", icon: GitHubLogoIcon, val: user?.github_id },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-10">
      <header>
        <h1 className="text-2xl font-bold">Account & Security</h1>
        <p className="text-gray-500">Manage your credentials and connected apps.</p>
      </header>

      {/* 1. Password Management */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">Password</h2>
        <div className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
          <div>
            <p className="font-semibold text-sm">Login Password</p>
            <p className="text-xs text-gray-500">
              {user?.has_password ? "Secure password is set" : "No password set (Social Login only)"}
            </p>
          </div>
          {!user?.has_password && (
            <button
              onClick={() => setIsSetPasswordModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all active:scale-95"
            >
              Set Password
            </button>
          )}
        </div>
      </section>

      {/* 2. Social Connections */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">Connected Accounts</h2>
        {socialProviders.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 border">
                <Image src={item.icon} width={20} height={20} alt={item.name} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{item.name} Account</span>
                <span className={`text-xs ${item.val ? "text-green-600" : "text-gray-400"}`}>
                  {item.val ? "Connected" : "Not linked"}
                </span>
              </div>
            </div>
            <button
              disabled={busyProvider === item.id}
              onClick={() => (item.val ? handleUnlink(item.id) : handleConnect(item.id))}
              className={`min-w-[110px] px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                item.val ? "text-red-500 hover:bg-red-50" : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {busyProvider === item.id ? <FaSpinner className="animate-spin mx-auto" /> : item.val ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </section>

      {/* 3. Danger Zone */}
      <section className="p-6 border border-red-100 bg-red-50/50 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
        <p className="text-sm text-red-600/80">Deleting your account is permanent and cannot be undone.</p>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all active:scale-95"
        >
          <FaTrash size={14} /> Delete My Account
        </button>
      </section>

      {/* --- MODALS --- */}

      {/* Modal: Set Password */}
      <BaseModal
        isOpen={isSetPasswordModalOpen}
        onClose={() => { setIsSetPasswordModalOpen(false); setPasswordForm.reset(); }}
        title="Set Account Password"
      >
        <form onSubmit={setPasswordForm.handleSubmit(onSetPassword)} className="space-y-6">
          <div className="space-y-1">
            <FormLabel>New Password</FormLabel>
            <FormInput
              type="password"
              placeholder="Min. 8 characters"
              error={setPasswordForm.formState.errors.password?.message}
              register={setPasswordForm.register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Minimum 8 characters" },
              })}
            />
          </div>
          <div className="space-y-1">
            <FormLabel>Confirm Password</FormLabel>
            <FormInput
              type="password"
              placeholder="Repeat password"
              error={setPasswordForm.formState.errors.confirmPassword?.message}
              register={setPasswordForm.register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === passwordValue || "Passwords do not match",
              })}
            />
          </div>
          <FormButton type="submit" isLoading={isSubmitting} className="w-full">
            Save Password
          </FormButton>
        </form>
      </BaseModal>

      {/* Modal: Delete Account */}
      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); deleteAccountForm.reset(); }}
        title="Confirm Deletion"
        variant="danger"
      >
        <form onSubmit={deleteAccountForm.handleSubmit(onConfirmDelete)} className="space-y-6">
          <p className="text-sm text-gray-600">Please enter your password to permanently delete your account.</p>
          <div className="space-y-1">
            <FormLabel>Your Password</FormLabel>
            <FormInput
              type="password"
              placeholder="Verify password"
              error={deleteAccountForm.formState.errors.password?.message}
              register={deleteAccountForm.register("password", { required: "Password is required" })}
            />
          </div>
          <FormButton type="submit" isLoading={isDeleting} className="w-full bg-red-600 hover:bg-red-700">
            Confirm Permanent Deletion
          </FormButton>
        </form>
      </BaseModal>
    </div>
  );
}