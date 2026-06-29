"use client";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { useState } from "react";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId?: string;
  className?: string;
}

export function FollowButton({ targetUserId, currentUserId, className }: FollowButtonProps) {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  const { data: relationship, isLoading } = useQuery({
    queryKey: ["relationship", targetUserId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/user/${targetUserId}/relationship`);
      return res.data?.metadata || res.data;
    },
    enabled: !!targetUserId && !!currentUserId && targetUserId !== currentUserId,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async (isFollowing: boolean) => {
      if (isFollowing) {
        return api.delete(`/api/v1/user/${targetUserId}/follow`);
      } else {
        return api.post(`/api/v1/user/${targetUserId}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relationship", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] });
    },
  });

  if (!currentUserId || targetUserId === currentUserId) {
    return null;
  }

  if (isLoading) {
    return (
      <button disabled className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-50 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  const isFollowing = relationship?.followed;

  return (
    <button
      onClick={() => toggleFollowMutation.mutate(isFollowing)}
      disabled={toggleFollowMutation.isPending}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200",
        isFollowing
          ? isHovered
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-slate-100 text-slate-700"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        className
      )}
    >
      {toggleFollowMutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        isHovered ? (
          <>Hủy theo dõi</>
        ) : (
          <>
            <UserCheck className="w-4 h-4" />
            Đang theo dõi
          </>
        )
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Theo dõi
        </>
      )}
    </button>
  );
}
