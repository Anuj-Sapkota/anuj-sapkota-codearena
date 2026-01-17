import api from "@/lib/api";

export const userService = {

  //profile update
  updateProfile: async (userId: number, formData: FormData) => {
    // We use FormData because of the file upload
    const { data } = await api.patch(`/user/update/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
