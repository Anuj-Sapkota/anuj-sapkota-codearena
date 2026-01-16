"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/lib/store/store";
import { logoutThunk } from "@/app/lib/store/features/authActions";
import { authService } from "@/app/lib/services/authService";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { BaseModal } from "@/app/components/ui/BaseModal";
import { FormLabel, FormInput, FormButton } from "@/app/components/ui/FormElements";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { password: "" },
  });

  const onSubmit = async (data: { password?: string }) => {
    try {
      setLoading(true);
      await authService.deleteAccountApi(data.password!);
      await dispatch(logoutThunk());
      window.location.href = "/login";
    } catch (err) {
      toast.error(isAxiosError(err) ? err.response?.data?.error : "Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={() => { onClose(); reset(); }} title="Confirm Deletion" variant="danger">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-sm text-gray-600">Please enter your password to permanently delete your account.</p>
        <div className="space-y-1">
          <FormLabel>Your Password</FormLabel>
          <FormInput
            type="password"
            placeholder="Verify password"
            error={errors.password?.message}
            register={register("password", { required: "Password is required" })}
          />
        </div>
        <FormButton type="submit" isLoading={loading} className="w-full bg-red-600 hover:bg-red-700">
          Confirm Permanent Deletion
        </FormButton>
      </form>
    </BaseModal>
  );
};