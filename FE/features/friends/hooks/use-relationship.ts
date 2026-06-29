import api from "@/lib/axios";
import { useCallback, useEffect, useState } from "react";
import { FriendsService } from "../services/friends.service";

export type RelationshipStatus =
  | "IS_ME"
  | "FRIENDS"
  | "REQUEST_SENT"
  | "REQUEST_RECEIVED"
  | "NOT_FRIEND";

export function useRelationship(targetUserId: string, currentUserId?: string) {
  const [status, setStatus] = useState<RelationshipStatus>("NOT_FRIEND");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkRelationship = useCallback(async () => {
    if (!targetUserId) return;
    if (currentUserId === targetUserId) {
      setStatus("IS_ME");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.get(`/api/v1/user/${targetUserId}/relationship`);
      const rel = res.data?.metadata || res.data;

      if (rel.isFriend) {
        setStatus("FRIENDS");
      } else if (rel.requestReceived) {
        setStatus("REQUEST_RECEIVED");
        setRequestId(rel.requestId);
      } else if (rel.requestSent) {
        setStatus("REQUEST_SENT");
        setRequestId(rel.requestId);
      } else {
        setStatus("NOT_FRIEND");
        setRequestId(null);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra quan hệ bạn bè:", error);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, currentUserId]);

  const addFriend = async () => {
    setIsLoading(true);
    try {
      const res = await FriendsService.sendFriendRequest(targetUserId);
      setStatus("REQUEST_SENT");
      setRequestId(res.data.id);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi gửi kết bạn:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const accept = async () => {
    if (!requestId) return { success: false, error: "Missing request ID" };
    setIsLoading(true);
    try {
      await FriendsService.acceptFriendRequest(requestId);
      setStatus("FRIENDS");
      setRequestId(null);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi chấp nhận kết bạn:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const decline = async () => {
    if (!requestId) return { success: false, error: "Missing request ID" };
    setIsLoading(true);
    try {
      await FriendsService.declineFriendRequest(requestId);
      setStatus("NOT_FRIEND");
      setRequestId(null);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi từ chối kết bạn:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const cancel = async () => {
    if (!requestId) return { success: false, error: "Missing request ID" };
    setIsLoading(true);
    try {
      await FriendsService.cancelFriendRequest(requestId);
      setStatus("NOT_FRIEND");
      setRequestId(null);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi hủy lời mời kết bạn:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const removeFriend = async () => {
    setIsLoading(true);
    try {
      await FriendsService.unfriend(targetUserId);
      setStatus("NOT_FRIEND");
      setRequestId(null);
      return { success: true };
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkRelationship();
  }, [checkRelationship]);

  return {
    status,
    requestId,
    isLoading,
    checkRelationship,
    addFriend,
    accept,
    decline,
    cancel,
    removeFriend,
  };
}
