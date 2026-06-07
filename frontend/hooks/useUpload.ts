// hooks/useUpload.ts
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadService } from "@/lib/services/upload.service";

export const useUploadMutation = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      setProgress(0); // Reset progress on new upload
      return await uploadService.uploadFile(file, type, (p) => setProgress(p));
    },
  });

  return { ...mutation, progress };
};
