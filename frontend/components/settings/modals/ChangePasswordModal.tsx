"use client";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useState } from "react";

import { AppDispatch } from "@/lib/store/store";
import { changePasswordThunk } from "@/lib/store/features/auth.actions";
import { BaseModal } from "@/components/ui/BaseModal";
import { FormInput, FormLabel, FormButton } from "@/components/ui/Form";

import type { ChangePasswordCredentials } from "@/types/auth.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordCredentials) => {
    setLoading(true);
    try {
      await dispatch(
        changePasswordThunk({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        })
      ).unwrap();

      toast.success("Password updated successfully!");
      reset();
      onClose();
    } catch (err: unknown) {
      if (typeof err === "string") {
        toast.error(err);
      }
      // 1. Checking if it's an Axios error
      else if (isAxiosError(err)) {
        console.log("error:", err.response);
        const message = err.response?.data?.error || "An error occurred";
        toast.error(message);
      }
      // 2. Checking if it's a standard Error object
      else if (err instanceof Error) {
        toast.error(err.message);
      }
      // 3. Fallback for literal strings or weird objects
      else {
        toast.error("Unknown error occurred");
        console.error("Unknown error source:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <FormLabel>Current Password</FormLabel>
          <FormInput
            type="password"
            placeholder="Enter current password"
            register={register("oldPassword", {
              required: "Current password is required",
            })}
            error={errors.oldPassword?.message}
          />
        </div>

        <hr className="border-gray-100" />

        <div>
          <FormLabel>New Password</FormLabel>
          <FormInput
            type="password"
            placeholder="Minimum 8 characters"
            register={register("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "Too short!" },
            })}
            error={errors.newPassword?.message}
          />
        </div>

        <div>
          <FormLabel>Confirm New Password</FormLabel>
          <FormInput
            type="password"
            placeholder="Repeat new password"
            register={register("confirmPassword", {
              validate: (val) =>
                val === newPassword || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <FormButton type="submit" isLoading={loading} className="w-full mt-2">
          Update Password
        </FormButton>
      </form>
    </BaseModal>
  );
};
