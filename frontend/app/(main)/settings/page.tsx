"use client";

import {
  FormLabel,
  FormInput,
  FormTextarea,
  FormButton,
} from "@/app/components/ui/FormElements";
import { AppDispatch, RootState } from "@/app/lib/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { BasicSettingsFormValue } from "@/app/types/settings";
import { useEffect } from "react";
import { updateThunk } from "@/app/lib/store/features/authActions";
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
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("bio", data.bio);
    if (!user?.userId) return;

    const promise = dispatch(
      updateThunk({
        userId: user.userId,
        data: formData,
      })
    ).unwrap();

    toast.promise(promise, {
      loading: "Saving your changes...",
      success: () => {
        return `Profile updated successfully!`;
      },
      error: (err) => {
        return err || "Failed to update profile";
      },
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
