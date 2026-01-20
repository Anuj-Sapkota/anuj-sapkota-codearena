"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { BaseModal } from "@/components/ui/BaseModal";
import { FormLabel, FormInput, FormButton } from "@/components/ui/Form";
import { AppDispatch } from "@/lib/store/store";
import { setInitialPasswordThunk } from "@/lib/store/features/auth/auth.actions";

import type { SetPasswordFormValues } from "@/types/auth.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SetPasswordModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SetPasswordFormValues>();

  const passwordValue = watch("password");

  const onSubmit = async (data: SetPasswordFormValues) => {
    try {
      setLoading(true);
      await dispatch(setInitialPasswordThunk(data.password)).unwrap();
      toast.success("Password set successfully!");
      reset();
      onClose();
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.error : "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={() => { onClose(); reset(); }} title="Set Account Password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <FormLabel>New Password</FormLabel>
          <FormInput
            type="password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            register={register("password", {
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
            error={errors.confirmPassword?.message}
            register={register("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) => val === passwordValue || "Passwords do not match",
            })}
          />
        </div>
        <FormButton type="submit" isLoading={loading} className="w-full">
          Save Password
        </FormButton>
      </form>
    </BaseModal>
  );
};