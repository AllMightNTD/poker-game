import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clubsApi } from "../api/clubs-api";

// Query Keys
export const clubKeys = {
  all: ["clubs"] as const,
  mine: () => [...clubKeys.all, "mine"] as const,
  detail: (id: string) => [...clubKeys.all, "detail", id] as const,
  stats: (id: string) => [...clubKeys.all, "stats", id] as const,
  tables: (id: string) => [...clubKeys.all, "tables", id] as const,
};

// =====================
// QUERIES
// =====================

export const useMyClubs = () => {
  return useQuery({
    queryKey: clubKeys.mine(),
    queryFn: clubsApi.getMyClubs,
  });
};

export const useClubDetail = (id: string) => {
  return useQuery({
    queryKey: clubKeys.detail(id),
    queryFn: () => clubsApi.getClubDetail(id),
    enabled: !!id,
  });
};

export const useClubStats = (id: string) => {
  return useQuery({
    queryKey: clubKeys.stats(id),
    queryFn: () => clubsApi.getClubStats(id),
    enabled: !!id,
  });
};

export const useClubTables = (id: string) => {
  return useQuery({
    queryKey: clubKeys.tables(id),
    queryFn: () => clubsApi.getClubTables(id),
    enabled: !!id,
  });
};

// =====================
// MUTATIONS
// =====================

export const useCreateClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clubsApi.createClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.mine() });
    },
  });
};

export const useJoinClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clubsApi.joinClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.mine() });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, userId, role }: { clubId: string; userId: string; role: "AGENT" | "MEMBER" }) =>
      clubsApi.updateRole(clubId, userId, role),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
    },
  });
};

export const useTransferCredit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, memberUserId, amount }: { clubId: string; memberUserId: string; amount: string }) =>
      clubsApi.transferCredit(clubId, memberUserId, amount),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
    },
  });
};

export const useCreateClubTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clubsApi.createClubTable,
    onSuccess: (_, variables) => {
      // Refresh the specific club's tables
      queryClient.invalidateQueries({ queryKey: clubKeys.tables(variables.club_id) });
    },
  });
};

export const useUpdateClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; avatar_url?: string } }) =>
      clubsApi.updateClub(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clubKeys.mine() });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, userId, ban }: { clubId: string; userId: string; ban?: boolean }) =>
      clubsApi.removeMember(clubId, userId, ban),
    onSuccess: (_, { clubId }) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
    },
  });
};

export const useLeaveClub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clubsApi.leaveClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.mine() });
    },
  });
};
