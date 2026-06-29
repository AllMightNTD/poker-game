"use client";
import PersonalPage from "@/components/profile/PersonalPage";
import { useCurrentUser } from "@/core/providers/user-provider";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export default function ProfilePage() {
  const { currentUser } = useCurrentUser();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const targetId = userId || currentUser?.id;

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["profile", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const res = await api.get(`/api/v1/user/${targetId}`);
      return res.data?.metadata || res.data;
    },
    enabled: !!targetId
  });

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 mx-auto xl:mx-0 space-y-4 w-full flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 mx-auto xl:mx-0 space-y-4 w-full">
      <PersonalPage user={userProfile || currentUser} currentUser={currentUser} />
    </div>
  );
}
