import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpClient from "../core/api/http-client";

interface SearchUserResult {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface SearchHistory {
  id: string;
  keyword: string;
  created_at: string;
}

export const useSearchHistory = () => {
  return useQuery<SearchHistory[]>({
    queryKey: ["searchHistory"],
    queryFn: async () => {
      const response = await httpClient.get("/api/v1/search/history");
      return response.data;
    },
  });
};

export const useDeleteSearchHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await httpClient.delete(`/api/v1/search/history/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchHistory"] });
    },
  });
};

export const useSaveSearchHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (keyword: string) => {
      const response = await httpClient.post(`/api/v1/search/history`, { keyword });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchHistory"] });
    },
  });
};

export const useSearchUsers = (keyword: string) => {
  return useQuery<SearchUserResult[]>({
    queryKey: ["searchUsers", keyword],
    queryFn: async () => {
      if (!keyword.trim()) return [];
      const response = await httpClient.get(`/api/v1/search/users?q=${encodeURIComponent(keyword)}`);
      return response.data;
    },
    enabled: !!keyword.trim(),
  });
};
