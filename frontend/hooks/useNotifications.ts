import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { API } from "@/constants/api.constants";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get(API.NOTIFICATIONS.BASE);
      return data as { notifications: Notification[]; unreadCount: number };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(API.NOTIFICATIONS.READ_ALL),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useMarkOneRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(API.NOTIFICATIONS.READ_ONE(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(API.NOTIFICATIONS.DELETE(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
};
