import api from "@/lib/axios";
import { useCallback, useRef, useState, useEffect } from "react";
import type { Socket } from "socket.io-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface UploadingFileItem {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  type: "image" | "video";
  progress: number;
  status: "uploading" | "success" | "failed";
  url: string | null;
}

interface UseMediaUploadOptions {
  conversationId: string | null;
  socket: Socket | null;
  replyToId?: string | null;
}

// Allowed extensions
const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const ALLOWED_VIDEO_EXTS = [".mp4", ".mov", ".webm"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
const MAX_FILES_PER_BATCH = 5;

function getExt(filename: string) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function validate(file: File): string | null {
  const ext = getExt(file.name);
  const isImage = ALLOWED_IMAGE_EXTS.includes(ext);
  const isVideo = ALLOWED_VIDEO_EXTS.includes(ext);
  if (!isImage && !isVideo) return "Định dạng không được hỗ trợ.";
  if (isImage && file.size > MAX_IMAGE_SIZE) return "Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB.";
  if (isVideo && file.size > MAX_VIDEO_SIZE) return "Video quá lớn! Giới hạn 500MB.";
  return null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useMediaUpload({ conversationId, socket, replyToId }: UseMediaUploadOptions) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFileItem[]>([]);

  // Use refs so async callbacks always read the LATEST values (no stale closure)
  const conversationIdRef = useRef(conversationId);
  const socketRef = useRef(socket);
  const replyToIdRef = useRef(replyToId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
    socketRef.current = socket;
    replyToIdRef.current = replyToId;
  }, [conversationId, socket, replyToId]);

  // Upload a single item — reads latest values from refs, never stale
  const uploadItem = useCallback(async (item: UploadingFileItem) => {
    const convId = conversationIdRef.current;
    const sock = socketRef.current;

    // If no conversationId yet, mark as failed instead of silently stuck
    if (!convId) {
      console.warn("[useMediaUpload] No conversationId, cannot upload");
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "failed" as const } : f))
      );
      return;
    }

    const formData = new FormData();
    formData.append("files", item.file);

    try {
      // Do NOT manually set Content-Type — axios sets it with the correct boundary
      const res = await api.post("/api/v1/chat/upload", formData, {
        onUploadProgress: (pe) => {
          const percent = Math.round((pe.loaded * 100) / (pe.total || 1));
          setUploadingFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, progress: percent } : f))
          );
        },
      });

      const uploadedUrl: string = res.data.metadata[0].file_url;

      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: "success" as const, url: uploadedUrl, progress: 100 } : f
        )
      );

      // Emit via socket if available — upload succeeds regardless of socket state
      if (sock) {
        sock.emit("sendMessage", {
          conversation_id: convId,
          content: uploadedUrl,
          type: item.type,
          reply_to_id: replyToIdRef.current || null,
        });
      } else {
        console.warn("[useMediaUpload] Socket not available, message not emitted");
      }

      // Remove thumbnail immediately — socket newMessage will add the real bubble
      setUploadingFiles((prev) => prev.filter((f) => f.id !== item.id));
    } catch (err) {
      console.error("[useMediaUpload] upload error", err);
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "failed" as const } : f))
      );
    }
  }, []); // Stable — reads latest values from refs

  // Main handler — called from <input onChange>
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Check conversationId via ref so it's always current
      if (!conversationIdRef.current) {
        alert("Cuộc trò chuyện chưa sẵn sàng. Vui lòng thử lại.");
        return;
      }

      const fileArray = Array.from(files).slice(0, MAX_FILES_PER_BATCH);
      const newItems: UploadingFileItem[] = [];
      const errors: string[] = [];

      fileArray.forEach((file, idx) => {
        const err = validate(file);
        if (err) {
          errors.push(`${file.name}: ${err}`);
          return;
        }
        const ext = getExt(file.name);
        const type: "image" | "video" = ALLOWED_VIDEO_EXTS.includes(ext) ? "video" : "image";
        newItems.push({
          id: `upload-${Date.now()}-${idx}`,
          file,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
          type,
          progress: 0,
          status: "uploading",
          url: null,
        });
      });

      if (errors.length > 0) alert(errors.join("\n"));
      if (newItems.length === 0) return;

      setUploadingFiles((prev) => [...prev, ...newItems]);

      // Upload each item concurrently
      newItems.forEach((item) => uploadItem(item));

      // Reset so same file can be re-selected
      e.target.value = "";
    },
    [uploadItem]
  );

  // Retry a failed upload
  const handleRetry = useCallback(
    (itemId: string) => {
      setUploadingFiles((prev) => {
        const item = prev.find((f) => f.id === itemId);
        if (!item) return prev;
        const updated = prev.map((f) =>
          f.id === itemId ? { ...f, status: "uploading" as const, progress: 0 } : f
        );
        // Trigger upload with the updated item
        uploadItem({ ...item, status: "uploading", progress: 0 });
        return updated;
      });
    },
    [uploadItem]
  );

  const clearFile = useCallback((itemId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== itemId));
  }, []);

  return { uploadingFiles, handleFileChange, handleRetry, clearFile };
}
