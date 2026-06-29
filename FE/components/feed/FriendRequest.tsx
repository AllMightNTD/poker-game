"use client";

import { ChevronRight, Plus, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFriendRequests } from "@/features/friends/hooks/use-friend-requests";
import { useFriendSuggestions } from "@/features/friends/hooks/use-friend-suggestions";
import { useToast } from "@/core/providers/toast-provider";
import { useTranslations } from "next-intl";

function FriendRequestCard({
  person,
  onConfirm,
  onDelete,
  isProcessing,
}: {
  person: { id: string; name: string; mutual: number; avatar: string };
  onConfirm: (id: string) => void;
  onDelete: (id: string) => void;
  isProcessing?: boolean;
}) {
  const t = useTranslations("friendRequest");
  return (
    <div className="flex items-center gap-3 py-2">
      <img
        src={person.avatar}
        alt={person.name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {person.name}
        </p>
        {person.mutual > 0 && (
          <p className="text-xs text-slate-400">{t("mutualFriends", { count: person.mutual })}</p>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onConfirm(person.id)}
            disabled={isProcessing}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-75"
          >
            {isProcessing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              t("confirm")
            )}
          </button>
          <button
            onClick={() => onDelete(person.id)}
            disabled={isProcessing}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-75"
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FriendRequests({ onSeeAll }: { onSeeAll?: () => void }) {
  const t = useTranslations("friendRequest");
  const { success: toastSuccess, error: toastError } = useToast();
  const {
    incomingRequests,
    isLoadingIncoming,
    fetchIncoming,
    acceptRequest,
    declineRequest,
  } = useFriendRequests();

  const {
    suggestions,
    isLoading: isLoadingSuggestions,
    sendRequest,
    removeSuggestion,
    fetchSuggestions,
  } = useFriendSuggestions();

  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [processingSuggestionId, setProcessingSuggestionId] = useState<string | null>(null);

  useEffect(() => {
    fetchIncoming(1, 5);
  }, [fetchIncoming]);

  useEffect(() => {
    fetchSuggestions(1, 5);
  }, [fetchSuggestions]);

  const handleConfirm = async (requestId: string) => {
    setProcessingRequestId(requestId);
    const result = await acceptRequest(requestId);
    setProcessingRequestId(null);
    if (result.success) {
      toastSuccess(t("acceptSuccess"));
    } else {
      toastError(t("acceptError"));
    }
  };

  const handleDelete = async (requestId: string) => {
    setProcessingRequestId(requestId);
    const result = await declineRequest(requestId);
    setProcessingRequestId(null);
    if (result.success) {
      toastSuccess(t("declineSuccess"));
    } else {
      toastError(t("declineError"));
    }
  };

  const handleAddFriend = async (userId: string) => {
    setProcessingSuggestionId(userId);
    const result = await sendRequest(userId);
    setProcessingSuggestionId(null);
    if (result.success) {
      toastSuccess(t("sendSuccess"));
    } else {
      toastError(t("sendError"));
    }
  };

  const handleSkipSuggestion = (userId: string) => {
    removeSuggestion(userId);
    toastSuccess(t("skipSuccess"));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Friend Requests */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">{t("title")}</h3>
          {onSeeAll && incomingRequests.length > 0 && (
            <button
              onClick={onSeeAll}
              className="text-xs text-blue-500 font-semibold hover:underline"
            >
              {t("seeAll")}
            </button>
          )}
        </div>
        {isLoadingIncoming && incomingRequests.length === 0 ? (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="animate-spin text-blue-500" />
          </div>
        ) : incomingRequests.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            {t("noPending")}
          </p>
        ) : (
          <div className="divide-y divide-slate-50">
            {incomingRequests.map((req) => {
              const person = {
                id: req.id,
                name: req.sender?.profile?.full_name || req.sender?.email || "User",
                avatar: req.sender?.profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
                mutual: 0,
              };
              return (
                <FriendRequestCard
                  key={req.id}
                  person={person}
                  onConfirm={handleConfirm}
                  onDelete={handleDelete}
                  isProcessing={processingRequestId === req.id}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Friend Suggestions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">{t("peopleYouMayKnow")}</h3>
          {onSeeAll && suggestions.length > 0 && (
            <button
              onClick={onSeeAll}
              className="text-xs text-blue-500 font-semibold hover:underline"
            >
              {t("seeAll")}
            </button>
          )}
        </div>
        {isLoadingSuggestions && suggestions.length === 0 ? (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="animate-spin text-blue-500" />
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            {t("noSuggestions")}
          </p>
        ) : (
          <div className="divide-y divide-slate-50">
            {suggestions.map((person) => {
              const avatar = person.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";
              const name = person.fullName || "User";
              const mutual = parseInt(person.mutualFriendsCount || "0", 10);

              return (
                <div key={person.id} className="flex items-center gap-3 py-2.5">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {name}
                    </p>
                    {mutual > 0 && (
                      <p className="text-xs text-slate-400">
                        {t("mutualFriends", { count: mutual })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleAddFriend(person.id)}
                      disabled={processingSuggestionId === person.id}
                      className="w-7 h-7 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors disabled:opacity-75"
                      title={t("addFriend")}
                    >
                      {processingSuggestionId === person.id ? (
                        <Loader2 size={12} className="animate-spin text-white" />
                      ) : (
                        <Plus size={14} className="text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSkipSuggestion(person.id)}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                      title={t("skip")}
                    >
                      <X size={14} className="text-slate-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
