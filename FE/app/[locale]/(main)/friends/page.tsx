"use client";
import React from "react";
import { FriendRequestList } from "@/features/friends/components/FriendRequestList";
import { FriendSuggestionsList } from "@/features/friends/components/FriendSuggestionsList";

export default function FriendsPage() {
  return (
    <div className="flex-1 min-w-0 mx-auto xl:mx-0 space-y-4 w-full max-w-4xl">
      <FriendRequestList />
      <FriendSuggestionsList />
    </div>
  );
}
