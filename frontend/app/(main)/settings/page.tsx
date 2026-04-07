"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiUser, FiFileText, FiSave } from "react-icons/fi";

import { RootState } from "@/lib/store/store";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { BasicSettingsFormValue } from "@/types/settings.types";

export default function BasicInfoPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } =
    useForm<BasicSettingsFormValue>({
      defaultValues: { full_name: user?.full_name || "", bio: user?.bio || "" },
    });

  useEffect(() => {
    if (user) reset({ full_name: user.full_name, bio: user.bio });
  }, [user, reset]);

  const onSubmit = (data: BasicSettingsFormValue) => {
    if (!user?.userId) return;
    toast.promise(
      updateProfile.mutateAsync({ userId: user.userId, full_name: data.full_name, bio: data.bio }),
      {
        loading: "Saving...",
        success: () => { reset(data); return "Profile updated!"; },
        error: (err) => err?.message || "Failed to update profile",
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Basic Info</h2>
        <p className="text-[11px] text-slate-400 mt-1">Update your display name and bio.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <FiUser size={10} /> Full Name
          </label>
          <input
            {...register("full_name", { required: "Full name is required" })}
            placeholder="Your full name"
            className={`w-full bg-white border-2 rounded-sm px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none focus:border-slate-900 transition-colors ${
              errors.full_name ? "border-red-400" : "border-slate-200"
            }`}
          />
          {errors.full_name && (
            <p className="text-[10px] text-red-500 font-bold">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Username
          </label>
          <div className="w-full bg-slate-50 border-2 border-slate-100 rounded-sm px-4 py-3 text-sm font-mono text-slate-400 select-none">
            @{user?.username}
          </div>
          <p className="text-[10px] text-slate-400">Username cannot be changed.</p>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <FiFileText size={10} /> Bio
          </label>
          <textarea
            {...register("bio")}
            rows={4}
            placeholder="Tell the community about yourself..."
            className="w-full bg-white border-2 border-slate-200 rounded-sm px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none focus:border-slate-900 transition-colors resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={updateProfile.isPending || !isDirty}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <FiSave size={12} />
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
