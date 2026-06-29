import { useMutation, useQueryClient } from "@tanstack/react-query";
import httpClient from "../core/api/http-client";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await httpClient.post(`/api/v1/user/profile`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};
