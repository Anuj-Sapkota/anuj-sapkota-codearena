import api from "@/lib/api";

export const userService = {
  //profile update
  // userService.ts
  updateProfile: async (userId: number, updateData: any) => {
    // We no longer need FormData or special headers here
    const { data } = await api.patch(`/user/update/${userId}`, updateData);
    return data;
  },
};
