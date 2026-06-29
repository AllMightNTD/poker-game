"use client";
import React from "react";
import Account from "@/components/layout/Account";
import { useCurrentUser } from "@/core/providers/user-provider";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { currentUser } = useCurrentUser();
  const router = useRouter();

  return (
    <div className="flex-1 min-w-0 max-w-2xl mx-auto xl:mx-0 space-y-4 w-full">
      <Account currentUser={currentUser} onBack={() => router.push("/")} />
    </div>
  );
}
