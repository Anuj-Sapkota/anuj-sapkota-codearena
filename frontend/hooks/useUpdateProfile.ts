import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { userService } from "@/lib/services/user.service";
import { uploadService } from "@/lib/services/upload.service";
import { patchUser } from "@/lib/store/features/auth/auth.slice";
import { AppDispatch } from "@/lib/store/store";

interface UpdateProfileInput {
  userId: number;
  full_name?: string;
  bio?: string;
  file?: File;
}

export const useUpdateProfile = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: async ({ userId, full_name, bio, file }: UpdateProfileInput) => {
      let profile_pic_url: string | undefined;

      if (file) {
        const uploaded = await uploadService.uploadFile(file, "profile");
        profile_pic_url = uploaded.url;
      }

      const payload: Record<string, any> = {};
      if (full_name !== undefined) payload.full_name = full_name;
      if (bio !== undefined) payload.bio = bio;
      if (profile_pic_url) payload.profile_pic_url = profile_pic_url;

      const res = await userService.updateProfile(userId, payload);
      return res; // { success, data: { user: {...} } }
    },
    onSuccess: (res) => {
      const updatedUser = res?.data?.user;
      if (updatedUser) {
        // Sync the returned fields into Redux auth state
        dispatch(patchUser(updatedUser));
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update profile");
    },
  });
};
