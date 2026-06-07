// lib/services/uploadService.ts
import api from "@/lib/api";

export const uploadService = {
  uploadFile: async (
    file: File, 
    type: string, 
    onProgress?: (percent: number) => void 
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const { data } = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // 🚀 This tracks the actual bytes leaving the browser
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return data;
  },
};