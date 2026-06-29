"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FriendRequest } from "../types/friends.types";
import { Loader2, Check, X, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (id: string) => Promise<{ success: boolean }>;
  onDecline: (id: string) => Promise<{ success: boolean }>;
}

export function FriendRequestCard({
  request,
  onAccept,
  onDecline,
}: FriendRequestCardProps) {
  const t = useTranslations("friendRequest");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<"accept" | "decline" | null>(null);

  const sender = request.sender;
  const avatarUrl = sender?.profile?.avatar_url || "/assets/images/default-avatar.png";
  const fullName = sender?.profile?.full_name || sender?.email || t("user");
  const username = sender?.profile?.username ? `@${sender.profile.username}` : "";
  const requestDate = new Date(request.created_at).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleAccept = async () => {
    setIsProcessing(true);
    setActionType("accept");
    await onAccept(request.id);
    setIsProcessing(false);
    setActionType(null);
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    setActionType("decline");
    await onDecline(request.id);
    setIsProcessing(false);
    setActionType(null);
  };

  return (
    <div className="flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 dark:bg-zinc-900 dark:border-zinc-800">
      {/* Avatar Header area */}
      <div className="relative w-full aspect-square bg-gray-50 dark:bg-zinc-850 flex items-center justify-center">
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/assets/images/default-avatar.png";
          }}
        />
        {sender?.presence?.status === "online" && (
          <span className="absolute bottom-3 right-3 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full dark:border-zinc-900" />
        )}
      </div>

      {/* Info details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
            {fullName}
          </h3>
          {username && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1 mb-2">
              {username}
            </p>
          )}

          <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-zinc-500 mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>{t("sentDate", { date: requestDate })}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isProcessing && actionType === "accept" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {t("accept")}
          </button>
          <button
            onClick={handleDecline}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isProcessing && actionType === "decline" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            {t("decline")}
          </button>
        </div>
      </div>
    </div>
  );
}
