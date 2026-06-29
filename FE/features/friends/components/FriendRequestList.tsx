"use client";

import React, { useEffect, useState } from "react";
import { FriendRequestCard } from "./FriendRequestCard";
import { useFriendRequests } from "../hooks/use-friend-requests";
import { Users, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function FriendRequestList() {
  const t = useTranslations("friendRequest");
  const {
    incomingRequests,
    isLoadingIncoming,
    fetchIncoming,
    acceptRequest,
    declineRequest,
    pendingCount,
  } = useFriendRequests();

  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

  useEffect(() => {
    fetchIncoming(1, 20);
  }, [fetchIncoming]);

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
      {/* Header section */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-50 dark:border-zinc-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/30 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">
              {t("title")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {t("manageConnections")}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchIncoming(1, 20)}
          disabled={isLoadingIncoming}
          className="p-2 hover:bg-gray-50 text-gray-500 hover:text-gray-900 rounded-lg transition-colors border border-gray-150 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-400"
          title={t("reloadList")}
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingIncoming ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabs / Filter counters */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("incoming")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            activeTab === "incoming"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-zinc-850 dark:text-zinc-350 dark:hover:bg-zinc-800"
          }`}
        >
          {t("receivedRequests")}
          {pendingCount > 0 && (
            <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
              activeTab === "incoming" ? "bg-white text-blue-600" : "bg-blue-600 text-white"
            }`}>
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Grid display */}
      {isLoadingIncoming && incomingRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {t("loadingRequests")}
          </p>
        </div>
      ) : incomingRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-xl dark:border-zinc-800">
          <div className="p-4 bg-gray-50 text-gray-400 rounded-full dark:bg-zinc-850 dark:text-zinc-600 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-zinc-200 mb-1">
            {t("noPending")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-450 text-center max-w-sm px-6">
            {t("noRequestsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {incomingRequests.map((request) => (
            <FriendRequestCard
              key={request.id}
              request={request}
              onAccept={acceptRequest}
              onDecline={declineRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}
