"use client";

import {
  FormLabel,
  FormInput,
  FormTextarea,
  FormButton,
} from "@/components/ui/Form";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { BasicSettingsFormValue } from "@/types/settings.types";
import { useEffect } from "react";
import { updateThunk } from "@/lib/store/features/auth/auth.actions";
import { toast } from "sonner";

export default function BasicInfoPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BasicSettingsFormValue>({
    defaultValues: {
      full_name: user?.full_name || "",
      bio: user?.bio || "",
    },
  });

  //if user data changes , change the form values as well
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        bio: user.bio,
      });
    }
  }, [user, reset]);

  //update form handler -- toast, redux update, data response
  const submitForm = (data: BasicSettingsFormValue) => {
    if (!user?.userId) return;

    // 1. Prepare the data in the exact shape the error asked for
    const payload = {
      userId: Number(user.userId), // The error says it expects a 'number'
      profileData: {
        username: data.full_name, // Map full_name to username if that's your schema
        bio: data.bio || "",
      },
    };

    // 2. Dispatch with the clean object
    const promise = dispatch(updateThunk(payload)).unwrap();

    toast.promise(promise, {
      loading: "Saving your changes...",
      success: "Profile updated successfully!",
      error: (err) => err?.message || "Failed to update profile",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="flex flex-col gap-3">
        <FormLabel>Full Name</FormLabel>
        <FormInput
          placeholder="Enter your name"
          register={register("full_name", {
            required: "Full name is required.",
          })}
          error={errors.full_name?.message}
        />
      </div>

      <div className="flex flex-col gap-3">
        <FormLabel>Bio</FormLabel>
        <FormTextarea
          rows={6}
          placeholder="Share your story..."
          register={register("bio")}
        />
      </div>

      <div className="pt-8">
        <FormButton>Save Profile</FormButton>
      </div>
    </form>
  );
}
