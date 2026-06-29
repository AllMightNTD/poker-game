"use client";

import { MUSIC_LIBRARY, Song } from "@/lib/music-data";
import { createStory, getZingMp3SongLyrics, getZingMp3SongStream, searchZingMp3, uploadStoryFile } from "@/lib/story-api";
import { cn } from "@/lib/utils";
import { Brush, Disc, Eraser, Image as ImageIcon, Loader2, Music, Pause, Play, RotateCcw, Shield, Sliders, Smile, Type, Volume2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialSong?: any;
}

const GRADIENTS = [
  { id: "sunset", name: "Sunset Orange", className: "bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500" },
  { id: "midnight", name: "Midnight Purple", className: "bg-gradient-to-tr from-purple-800 via-violet-900 to-indigo-950" },
  { id: "ocean", name: "Deep Ocean", className: "bg-gradient-to-tr from-teal-400 via-emerald-500 to-cyan-600" },
  { id: "nebula", name: "Nebula Cosmic", className: "bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-500" },
  { id: "sweet", name: "Sweet Pink", className: "bg-gradient-to-tr from-rose-400 via-fuchsia-500 to-indigo-500" },
  { id: "emerald", name: "Emerald Magic", className: "bg-gradient-to-tr from-green-400 via-teal-500 to-blue-600" },
];

const CSS_FILTERS = [
  { id: "none", name: "Gốc", style: "none" },
  { id: "grayscale", name: "Đen Trắng", style: "grayscale(100%)" },
  { id: "vintage", name: "Vintage", style: "sepia(50%) hue-rotate(-30deg) saturate(120%)" },
  { id: "warm", name: "Ấm Áp", style: "saturate(130%) sepia(10%)" },
  { id: "cool", name: "Mát Lạnh", style: "hue-rotate(15deg) saturate(110%)" },
  { id: "blur", name: "Mơ Màng", style: "blur(1.5px)" },
];

const POPULAR_EMOJIS = ["😀", "😂", "❤️", "🔥", "🎉", "🚀", "✨", "👑", "💯", "👍", "😮", "😢", "🍔", "🌈"];

interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage
  y: number; // percentage
  fontSize: number; // pixels
  color: string;
  backgroundColor: "transparent" | "black" | "white";
  fontStyle: "sans" | "serif" | "mono" | "handwritten" | "bold";
}

interface StickerOverlay {
  id: string;
  emoji: string;
  x: number; // percentage
  y: number; // percentage
  scale: number; // multiplier
}

export default function StoryCreatorModal({ isOpen, onClose, onSuccess, initialSong }: StoryCreatorModalProps) {
  const [tab, setTab] = useState<"media" | "text">("media");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audience, setAudience] = useState<"public" | "friends" | "custom">("friends");

  useEffect(() => {
    if (isOpen && initialSong) {
      setSelectedSong(initialSong);
      setMusicOverlayType("sticker");
      setMediaEditorTab("music");
      setIsMusicPlaying(true);
    }
  }, [isOpen, initialSong]);

  // State cho Tin chữ
  const [textContent, setTextContent] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);

  // State cho Tin Ảnh/Video
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mediaOverlayText, setMediaOverlayText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State cho Custom Text Overlays (Giai đoạn 2)
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // State cho Nhãn dán, Bộ lọc & Công cụ vẽ (Giai đoạn 3)
  const [stickers, setStickers] = useState<StickerOverlay[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>("none");
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [brushColor, setBrushColor] = useState("#ef4444");
  const [brushSize, setBrushSize] = useState(5);
  const [drawHistory, setDrawHistory] = useState<string[]>([]);
  const [isCanvasDrawing, setIsCanvasDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State cho Tab chức năng trong trình biên tập Media (Giai đoạn 3 & Âm nhạc)
  const [mediaEditorTab, setMediaEditorTab] = useState<"text" | "filter" | "draw" | "sticker" | "music">("text");

  // State cho chức năng Music Story (Âm nhạc)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [musicStartOffset, setMusicStartOffset] = useState<number>(0);
  const [musicDuration, setMusicDuration] = useState<number>(15);
  const [musicOverlayType, setMusicOverlayType] = useState<"sticker" | "lyrics" | "none">("sticker");
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // States tìm kiếm nhạc ZingMp3
  const [musicSearchQuery, setMusicSearchQuery] = useState("");
  const [zingSongs, setZingSongs] = useState<any[]>([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [isLoadingSongDetails, setIsLoadingSongDetails] = useState(false);
  const [creatorLyricIndex, setCreatorLyricIndex] = useState(-1);
  const t = useTranslations("story");

  // Effect tìm kiếm ZingMp3 với debounce 500ms
  useEffect(() => {
    if (!musicSearchQuery.trim()) {
      setZingSongs([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearchingMusic(true);
      try {
        const songs = await searchZingMp3(musicSearchQuery);
        setZingSongs(songs);
      } catch (err) {
        console.error("Lỗi tìm kiếm ZingMp3:", err);
      } finally {
        setIsSearchingMusic(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [musicSearchQuery]);

  const handleSelectSong = async (song: any) => {
    // Tạm thời dừng nhạc cũ đang phát
    setIsMusicPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    setSelectedSong({
      id: song.id,
      title: song.title,
      artist: song.artist,
      coverUrl: song.coverUrl,
      audioUrl: "", // Loading...
      duration: song.duration || 30,
      lyrics: []
    });
    setMusicStartOffset(0);
    setIsLoadingSongDetails(true);

    try {
      // Gọi BE Proxy lấy link stream và lyrics của bài hát ZingMp3
      const [streamRes, lyricsRes] = await Promise.all([
        getZingMp3SongStream(song.id),
        getZingMp3SongLyrics(song.id)
      ]);

      if (streamRes && streamRes.streamUrl) {
        setSelectedSong({
          id: song.id,
          title: song.title,
          artist: song.artist,
          coverUrl: song.coverUrl,
          audioUrl: streamRes.streamUrl,
          duration: song.duration || 30,
          lyrics: lyricsRes || []
        });
        setIsMusicPlaying(true);
      } else {
        alert(t("musicNotSupport"));
        setSelectedSong(null);
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết nhạc ZingMp3:", err);
      alert(t("musicLoadError"));
      setSelectedSong(null);
    } finally {
      setIsLoadingSongDetails(false);
    }
  };

  // Quản lý phát nhạc preview trong Editor
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsMusicPlaying(false);
      return;
    }

    if (selectedSong && isMusicPlaying) {
      if (!audioRef.current) {
        audioRef.current = new Audio(selectedSong.audioUrl);
      } else if (audioRef.current.src !== selectedSong.audioUrl) {
        audioRef.current.src = selectedSong.audioUrl;
      }

      audioRef.current.currentTime = musicStartOffset;
      audioRef.current.play().catch((e) => console.log("Audio preview blocked by browser policy:", e));

      const handleTimeUpdate = () => {
        if (audioRef.current) {
          const elapsed = audioRef.current.currentTime - musicStartOffset;
          if (elapsed >= musicDuration || elapsed < 0) {
            audioRef.current.currentTime = musicStartOffset;
          }

          if (selectedSong.lyrics && selectedSong.lyrics.length > 0) {
            const currentTime = audioRef.current.currentTime;
            const matchIndex = selectedSong.lyrics.findIndex((lyric, idx) => {
              const nextLyric = selectedSong.lyrics[idx + 1];
              return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
            });
            setCreatorLyricIndex(matchIndex);
          }
        }
      };

      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.pause();
        }
      };
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [selectedSong, isMusicPlaying, musicStartOffset, musicDuration, isOpen]);

  useEffect(() => {
    return () => {
      if (mediaPreview && mediaPreview.startsWith("blob:")) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  // Lắng nghe sự kiện paste từ clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (tab !== "media" || !isOpen) return;
      const file = e.clipboardData?.files?.[0];
      if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
        handleFile(file);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [tab, isOpen]);

  // Tự động lưu bản nháp vào localStorage mỗi 5 giây (Giai đoạn 4)
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const hasContent =
        textContent.trim() !== "" ||
        mediaFile !== null ||
        textOverlays.length > 0 ||
        stickers.length > 0 ||
        activeFilter !== "none";

      if (hasContent) {
        const draftData = {
          tab,
          textContent,
          selectedGradientId: selectedGradient.id,
          textOverlays,
          stickers,
          activeFilter,
          audience,
        };
        localStorage.setItem("story_creator_draft", JSON.stringify(draftData));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, tab, textContent, selectedGradient, textOverlays, stickers, activeFilter, audience, mediaFile]);

  // Khôi phục bản nháp khi mở modal (Giai đoạn 4)
  useEffect(() => {
    if (!isOpen) return;

    const savedDraft = localStorage.getItem("story_creator_draft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const hasContent =
          draft.textContent ||
          (draft.textOverlays && draft.textOverlays.length > 0) ||
          (draft.stickers && draft.stickers.length > 0) ||
          draft.activeFilter !== "none";

        if (hasContent) {
          // Trì hoãn nhẹ để giao diện render đầy đủ trước khi hiển thị alert
          setTimeout(() => {
            const confirmRestore = confirm(t("confirmRestore"));
            if (confirmRestore) {
              if (draft.tab) setTab(draft.tab);
              if (draft.textContent) setTextContent(draft.textContent);
              if (draft.selectedGradientId) {
                const grad = GRADIENTS.find((g: any) => g.id === draft.selectedGradientId);
                if (grad) setSelectedGradient(grad);
              }
              if (draft.textOverlays) setTextOverlays(draft.textOverlays);
              if (draft.stickers) setStickers(draft.stickers);
              if (draft.activeFilter) setActiveFilter(draft.activeFilter);
              if (draft.audience) setAudience(draft.audience);
            } else {
              localStorage.removeItem("story_creator_draft");
            }
          }, 400);
        }
      } catch (e) {
        console.error("Lỗi khi khôi phục bản nháp:", e);
      }
    }
  }, [isOpen]);

  // Đóng an toàn có cảnh báo xác nhận (Giai đoạn 4)
  const handleSafeClose = () => {
    const hasContent =
      textContent.trim() !== "" ||
      mediaFile !== null ||
      textOverlays.length > 0 ||
      stickers.length > 0 ||
      activeFilter !== "none";

    if (hasContent) {
      const confirmClose = confirm(t("confirmClose"));
      if (!confirmClose) return;
    }

    localStorage.removeItem("story_creator_draft");
    handleReset();
    onClose();
  };

  const handleFile = (file: File) => {
    // Giới hạn dung lượng 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert(t("fileTooLarge"));
      return;
    }

    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    setMediaFile(file);

    if (isVideo) {
      // Validate video duration
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          alert(t("videoTooLong"));
          setMediaFile(null);
          setMediaPreview(null);
          setMediaType(null);
          return;
        }
        setMediaPreview(URL.createObjectURL(file));
      };
      video.src = URL.createObjectURL(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleAddOverlay = () => {
    const newOverlay: TextOverlay = {
      id: Math.random().toString(36).substring(2, 9),
      text: "Chữ mới...",
      x: 50,
      y: 50,
      fontSize: 22,
      color: "#ffffff",
      backgroundColor: "black",
      fontStyle: "sans",
    };
    setTextOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
  };

  const handleUpdateOverlayText = (text: string) => {
    if (!selectedOverlayId) return;
    setTextOverlays((prev) =>
      prev.map((item) => (item.id === selectedOverlayId ? { ...item, text } : item))
    );
  };

  const handleUpdateOverlayStyle = (key: keyof TextOverlay, value: any) => {
    if (!selectedOverlayId) return;
    setTextOverlays((prev) =>
      prev.map((item) => (item.id === selectedOverlayId ? { ...item, [key]: value } : item))
    );
  };

  const handleDeleteOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((item) => item.id !== id));
    if (selectedOverlayId === id) {
      setSelectedOverlayId(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, overlayId: string) => {
    e.preventDefault();
    setSelectedOverlayId(overlayId);
    setSelectedStickerId(null); // Deselect sticker when text is selected

    const textElement = e.currentTarget;
    const card = textElement.parentElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const relativeX = moveEvent.clientX - rect.left;
      const relativeY = moveEvent.clientY - rect.top;

      const xPercent = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));

      setTextOverlays((prev) =>
        prev.map((item) =>
          item.id === overlayId
            ? { ...item, x: xPercent, y: yPercent }
            : item
        )
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // --- Nhãn dán Handlers (Giai đoạn 3) ---
  const handleAddSticker = (emoji: string) => {
    const newSticker: StickerOverlay = {
      id: Math.random().toString(36).substring(2, 9),
      emoji,
      x: 50,
      y: 50,
      scale: 1.2,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    setSelectedOverlayId(null); // Deselect text
  };

  const handleUpdateStickerScale = (scale: number) => {
    if (!selectedStickerId) return;
    setStickers((prev) =>
      prev.map((item) => (item.id === selectedStickerId ? { ...item, scale } : item))
    );
  };

  const handleDeleteSticker = (id: string) => {
    setStickers((prev) => prev.filter((item) => item.id !== id));
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  const handleStickerMouseDown = (e: React.MouseEvent, stickerId: string) => {
    e.preventDefault();
    setSelectedStickerId(stickerId);
    setSelectedOverlayId(null); // Deselect text

    const stickerElement = e.currentTarget;
    const card = stickerElement.parentElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const relativeX = moveEvent.clientX - rect.left;
      const relativeY = moveEvent.clientY - rect.top;

      const xPercent = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));

      setStickers((prev) =>
        prev.map((item) =>
          item.id === stickerId
            ? { ...item, x: xPercent, y: yPercent }
            : item
        )
      );
    };

    const handleStickerMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleStickerMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleStickerMouseUp);
  };

  // --- Công cụ vẽ Handlers (Giai đoạn 3) ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setIsCanvasDrawing(true);

    // Lưu lịch sử để phục vụ Hoàn tác (Undo)
    setDrawHistory((prev) => [...prev, canvas.toDataURL()]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCanvasDrawing || !isDrawingEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsCanvasDrawing(false);
  };

  const handleUndoDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas || drawHistory.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousState = drawHistory[drawHistory.length - 1];
    setDrawHistory((prev) => prev.slice(0, -1));

    const img = new globalThis.Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleClearDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawHistory([]);
  };

  const handleShareStory = async () => {
    setLoading(true);
    try {
      if (tab === "text") {
        if (!textContent.trim()) return;

        let textContentValue = textContent;
        if (selectedSong) {
          textContentValue = JSON.stringify({
            text: textContent,
            music: {
              songId: selectedSong.id,
              title: selectedSong.title,
              artist: selectedSong.artist,
              audioUrl: selectedSong.audioUrl,
              coverUrl: selectedSong.coverUrl,
              startOffset: musicStartOffset,
              duration: musicDuration,
              overlayType: musicOverlayType,
            }
          });
        }

        await createStory({
          type: "text",
          text_content: textContentValue,
          background_color: selectedGradient.id, // Lưu id gradient
          audience,
        });
      } else {
        if (!mediaFile) return;
        // 1. Upload file lên local storage backend với cập nhật tiến trình (Giai đoạn 4)
        const uploadRes = await uploadStoryFile(mediaFile, (progress) => {
          setUploadProgress(progress);
        });

        // Trích xuất nét vẽ từ canvas nếu có vẽ tự do
        const canvas = canvasRef.current;
        let drawingData: string | undefined = undefined;
        if (canvas) {
          // Tạo một canvas tạm để kiểm tra xem có nét vẽ nào không trống
          const ctx = canvas.getContext("2d");
          const buffer = ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
          let hasPixels = false;
          if (buffer) {
            // Kiểm tra kênh alpha > 0
            for (let i = 3; i < buffer.data.length; i += 4) {
              if (buffer.data[i] > 0) {
                hasPixels = true;
                break;
              }
            }
          }
          if (hasPixels) {
            drawingData = canvas.toDataURL("image/png");
          }
        }

        // Đóng gói tất cả thuộc tính của Giai đoạn 2 + Giai đoạn 3 + Âm nhạc vào một đối tượng JSON thống nhất
        const metadata = {
          overlays: textOverlays,
          filter: activeFilter,
          stickers: stickers,
          drawings: drawingData,
          music: selectedSong ? {
            songId: selectedSong.id,
            title: selectedSong.title,
            artist: selectedSong.artist,
            audioUrl: selectedSong.audioUrl,
            coverUrl: selectedSong.coverUrl,
            startOffset: musicStartOffset,
            duration: musicDuration,
            overlayType: musicOverlayType,
          } : null,
        };

        // 2. Tạo bản ghi Story
        await createStory({
          type: uploadRes.type === "video" ? "video" : "photo",
          media_url: uploadRes.file_url,
          text_content: JSON.stringify(metadata),
          audience,
        });
      }
      onSuccess();
      handleReset();
      onClose();
    } catch (error) {
      console.error("Lỗi khi đăng story:", error);
      alert(t("postFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe phím tắt Ctrl + Enter để đăng tin nhanh (Giai đoạn 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleShareStory();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, tab, textContent, selectedGradient, mediaFile, textOverlays, stickers, activeFilter, audience, selectedSong, musicStartOffset, musicDuration, musicOverlayType]);

  const handleReset = () => {
    localStorage.removeItem("story_creator_draft");
    setUploadProgress(0);
    setTextContent("");
    setMediaFile(null);
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
    setMediaType(null);
    setMediaOverlayText("");
    setTextOverlays([]);
    setSelectedOverlayId(null);

    // Giai đoạn 3 resets
    setStickers([]);
    setSelectedStickerId(null);
    setActiveFilter("none");
    setIsDrawingEnabled(false);
    setDrawHistory([]);
    setIsCanvasDrawing(false);

    // Reset Music states
    setSelectedSong(null);
    setMusicStartOffset(0);
    setMusicDuration(15);
    setMusicOverlayType("sticker");
    setIsMusicPlaying(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[600px] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">

        {/* Sidebar điều khiển bên trái */}
        <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t("addStory")}</h2>
              <button onClick={handleSafeClose} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Selector Tab */}
            <div className="flex bg-slate-200/60 dark:bg-slate-800/60 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setTab("media"); handleReset(); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
                  tab === "media"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
                )}
              >
                <ImageIcon className="w-4 h-4" />{t("mediaStory")}</button>
              <button
                onClick={() => { setTab("text"); handleReset(); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
                  tab === "text"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
                )}
              >
                <Type className="w-4 h-4" />{t("textStory")}</button>
            </div>

            {/* Nội dung Tab cấu hình */}
            {tab === "text" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("textContent")}</label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder={t("startTyping")}
                    rows={4}
                    maxLength={200}
                    className="w-full mt-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("chooseBackground")}</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {GRADIENTS.map((grad) => (
                      <button
                        key={grad.id}
                        onClick={() => setSelectedGradient(grad)}
                        className={cn(
                          "h-12 rounded-xl transition-all border-2",
                          grad.className,
                          selectedGradient.id === grad.id ? "border-blue-500 scale-105 shadow-md" : "border-transparent"
                        )}
                        title={grad.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {!mediaPreview ? (
                  /* Chưa chọn File: Hiện Dropzone */
                  <div>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFile(file);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "w-full border-2 border-dashed rounded-2xl py-12 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer bg-white dark:bg-slate-900 text-center",
                        isDragging
                          ? "border-blue-500 bg-blue-50/20 dark:bg-blue-900/15 scale-[1.02] shadow-inner"
                          : "border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500"
                      )}
                    >
                      <ImageIcon className={cn("w-10 h-10 text-slate-400 transition-colors", isDragging && "text-blue-500")} />
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 px-4">
                        {isDragging ? "Thả ảnh hoặc video tại đây" : "Kéo thả hoặc chọn ảnh/video"}
                      </span>
                      <span className="text-xs text-slate-400">Hỗ trợ tối đa 50MB & Video ≤ 30s</span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                  </div>
                ) : (
                  /* Đã chọn File: Hiện Trình soạn thảo đa năng Giai đoạn 3 */
                  <div className="space-y-4">
                    {/* Hàng nút Chọn lại tệp ở trên cùng */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trình biên tập</span>
                      <button
                        onClick={handleReset}
                        className="py-1 px-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px] rounded-lg transition-all"
                      >
                        Chọn lại tệp
                      </button>
                    </div>

                    {/* Thanh Tab chuyển đổi các công cụ */}
                    <div className="flex bg-slate-100 dark:bg-slate-900/80 p-0.5 rounded-xl text-xs gap-0.5">
                      {[
                        { id: "text", name: t("text"), icon: Type },
                        { id: "filter", name: t("filters"), icon: Sliders },
                        { id: "draw", name: t("draw"), icon: Brush },
                        { id: "sticker", name: t("stickers"), icon: Smile },
                        { id: "music", name: t("music"), icon: Music },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setMediaEditorTab(item.id as any);
                              // Disable drawing if moving away from drawing tab
                              if (item.id !== "draw") {
                                setIsDrawingEnabled(false);
                              }
                            }}
                            className={cn(
                              "flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg font-semibold text-[10px] gap-0.5 transition-all cursor-pointer active:scale-95",
                              mediaEditorTab === item.id
                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/30"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {item.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Nội dung tương ứng với Tab được chọn */}
                    <div className="pt-2">
                      {mediaEditorTab === "text" && (
                        <div className="space-y-3">
                          <button
                            onClick={handleAddOverlay}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all mb-3"
                          >
                            <Type className="w-4 h-4" />{t("addNewText")}</button>

                          {textOverlays.length > 0 ? (
                            <div className="space-y-3">
                              {/* Dropdown danh sách các chữ đè */}
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("textOverlayList")}</label>
                                <div className="flex flex-col gap-1.5 mt-1 max-h-[85px] overflow-y-auto pr-1">
                                  {textOverlays.map((overlay) => (
                                    <div
                                      key={overlay.id}
                                      onClick={() => {
                                        setSelectedOverlayId(overlay.id);
                                        setSelectedStickerId(null);
                                      }}
                                      className={cn(
                                        "flex items-center justify-between p-2 rounded-lg cursor-pointer border text-xs font-semibold transition-all",
                                        selectedOverlayId === overlay.id
                                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400"
                                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                      )}
                                    >
                                      <span className="truncate max-w-[140px]">{overlay.text || "(Trống)"}</span>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteOverlay(overlay.id); }}
                                        className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Bảng cấu hình chữ đè đang được chọn */}
                              {selectedOverlayId && (
                                (() => {
                                  const activeOverlay = textOverlays.find(o => o.id === selectedOverlayId);
                                  if (!activeOverlay) return null;
                                  return (
                                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3 shadow-inner animate-in fade-in duration-200">
                                      {/* Nội dung chữ */}
                                      <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("textContent")}</label>
                                        <input
                                          type="text"
                                          value={activeOverlay.text}
                                          onChange={(e) => handleUpdateOverlayText(e.target.value)}
                                          placeholder={t("enterText")}
                                          className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                      </div>

                                      {/* Font chữ */}
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("font")}</label>
                                          <select
                                            value={activeOverlay.fontStyle}
                                            onChange={(e) => handleUpdateOverlayStyle("fontStyle", e.target.value)}
                                            className="w-full mt-1 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-[10px] font-bold focus:outline-none"
                                          >
                                            <option value="sans">Sans-serif</option>
                                            <option value="serif">Serif</option>
                                            <option value="mono">Monospace</option>
                                            <option value="handwritten">Chữ nghiêng</option>
                                            <option value="bold">In đậm Headline</option>
                                          </select>
                                        </div>

                                        {/* Cỡ chữ */}
                                        <div>
                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("size")} ({activeOverlay.fontSize}px)</label>
                                          <input
                                            type="range"
                                            min="12"
                                            max="40"
                                            value={activeOverlay.fontSize}
                                            onChange={(e) => handleUpdateOverlayStyle("fontSize", parseInt(e.target.value))}
                                            className="w-full mt-1 accent-blue-600 cursor-pointer"
                                          />
                                        </div>
                                      </div>

                                      {/* Bảng chọn màu chữ & màu nền */}
                                      <div className="grid grid-cols-2 gap-2">
                                        {/* Màu chữ */}
                                        <div>
                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("textColor")}</label>
                                          <div className="flex gap-1 mt-1 flex-wrap">
                                            {["#ffffff", "#facc15", "#ef4444", "#06b6d4", "#22c55e", "#ec4899", "#000000"].map((color) => (
                                              <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleUpdateOverlayStyle("color", color)}
                                                className={cn(
                                                  "w-4 h-4 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer",
                                                  activeOverlay.color === color ? "scale-125 ring-1 ring-blue-500" : ""
                                                )}
                                                style={{ backgroundColor: color }}
                                              />
                                            ))}
                                          </div>
                                        </div>

                                        {/* Màu nền highlighter */}
                                        <div>
                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nền chữ</label>
                                          <div className="flex gap-1 mt-1">
                                            {[
                                              { value: "transparent", label: "Không" },
                                              { value: "black", label: "Tối" },
                                              { value: "white", label: "Sáng" }
                                            ].map((bgOption) => (
                                              <button
                                                key={bgOption.value}
                                                type="button"
                                                onClick={() => handleUpdateOverlayStyle("backgroundColor", bgOption.value)}
                                                className={cn(
                                                  "text-[8px] font-bold py-1 px-1 rounded-md border transition-all cursor-pointer",
                                                  activeOverlay.backgroundColor === bgOption.value
                                                    ? "bg-blue-600 text-white border-blue-600 shadow"
                                                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                                                )}
                                              >
                                                {bgOption.label}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                              <p className="text-slate-400 text-xs px-4">Hãy nhấn {t("addNewText")} để viết chữ kéo thả tùy ý trên tin!</p>
                            </div>
                          )}
                        </div>
                      )}

                      {mediaEditorTab === "filter" && (
                        <div className="space-y-3">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Chọn bộ lọc nhanh</label>
                          <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                            {CSS_FILTERS.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setActiveFilter(f.style)}
                                className={cn(
                                  "p-2 rounded-xl border text-left flex flex-col gap-1 transition-all active:scale-95 cursor-pointer",
                                  activeFilter === f.style
                                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                                    : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                              >
                                <span className="text-[10px]">{f.name}</span>
                                <div
                                  className="w-full h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-700"
                                  style={{ filter: f.style }}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {mediaEditorTab === "draw" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cọ vẽ tự do</label>
                            <button
                              type="button"
                              onClick={() => {
                                setIsDrawingEnabled(!isDrawingEnabled);
                                setSelectedOverlayId(null);
                                setSelectedStickerId(null);
                              }}
                              className={cn(
                                "py-1 px-3 rounded-full text-[9px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer",
                                isDrawingEnabled
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"
                              )}
                            >
                              {isDrawingEnabled ? "ĐANG BẬT" : "ĐANG TẮT"}
                            </button>
                          </div>

                          {isDrawingEnabled ? (
                            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3 shadow-inner animate-in fade-in duration-200">
                              <p className="text-[9px] text-slate-400 text-center leading-normal">
                                Hãy vẽ trực tiếp lên Khung Xem Trước bên phải.
                              </p>

                              {/* Bảng màu vẽ */}
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("brushColor")}</label>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#ec4899", "#a855f7", "#ffffff", "#000000"].map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => setBrushColor(color)}
                                      className={cn(
                                        "w-4 h-4 rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer",
                                        brushColor === color ? "scale-125 ring-1 ring-blue-500" : ""
                                      )}
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Cỡ cọ vẽ */}
                              <div>
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                  <span>Cỡ cọ</span>
                                  <span>{brushSize}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="2"
                                  max="15"
                                  value={brushSize}
                                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                  className="w-full mt-1 accent-blue-600 cursor-pointer"
                                />
                              </div>

                              {/* Nút thao tác nhanh: Undo, Clear */}
                              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={handleUndoDraw}
                                  disabled={drawHistory.length === 0}
                                  className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 font-semibold text-[9px] rounded-lg transition-all cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" />{t("undo")}</button>
                                <button
                                  type="button"
                                  onClick={handleClearDraw}
                                  className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold text-[9px] rounded-lg transition-all cursor-pointer"
                                >
                                  <Eraser className="w-3 h-3" />
                                  Xóa hết
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                              <p className="text-slate-400 text-xs px-4">Hãy bật nút {t("enableBrush")} để vẽ tự do lên tin!</p>
                            </div>
                          )}
                        </div>
                      )}

                      {mediaEditorTab === "sticker" && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Danh sách Nhãn dán</label>
                            <div className="grid grid-cols-5 gap-1.5 mt-1 p-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl max-h-[105px] overflow-y-auto pr-1">
                              {POPULAR_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleAddSticker(emoji)}
                                  className="text-xl p-1 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 rounded-lg transition-all text-center cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {stickers.length > 0 && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Đã dán ({stickers.length})</label>
                                <div className="flex gap-1.5 mt-1 overflow-x-auto pb-1 max-w-full">
                                  {stickers.map((s) => (
                                    <div
                                      key={s.id}
                                      onClick={() => {
                                        setSelectedStickerId(s.id);
                                        setSelectedOverlayId(null);
                                      }}
                                      className={cn(
                                        "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                                        selectedStickerId === s.id
                                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400"
                                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                                      )}
                                    >
                                      <span>{s.emoji}</span>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteSticker(s.id); }}
                                        className="p-0.5 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {selectedStickerId && (
                                (() => {
                                  const activeSticker = stickers.find(s => s.id === selectedStickerId);
                                  if (!activeSticker) return null;
                                  return (
                                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3 shadow-inner animate-in fade-in duration-200">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Đang chọn: {activeSticker.emoji}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSticker(activeSticker.id)}
                                          className="text-[9px] font-bold text-red-500 hover:underline cursor-pointer"
                                        >
                                          Xóa nhãn
                                        </button>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                          <span>Tỉ lệ ({Math.round(activeSticker.scale * 100)}%)</span>
                                        </div>
                                        <input
                                          type="range"
                                          min="0.5"
                                          max="3.0"
                                          step="0.1"
                                          value={activeSticker.scale}
                                          onChange={(e) => handleUpdateStickerScale(parseFloat(e.target.value))}
                                          className="w-full mt-1 accent-blue-600 cursor-pointer"
                                        />
                                      </div>
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {mediaEditorTab === "music" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          {isLoadingSongDetails && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                              <span className="text-[10px] font-bold text-slate-500 animate-pulse">Đang tải nhạc & lời bài hát từ ZingMp3...</span>
                            </div>
                          )}
                          {!isLoadingSongDetails && !selectedSong ? (
                            <div className="space-y-3">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tìm kiếm nhạc ZingMp3</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Tìm tên bài hát hoặc ca sĩ..."
                                  value={musicSearchQuery}
                                  onChange={(e) => setMusicSearchQuery(e.target.value)}
                                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                                />
                                {isSearchingMusic && (
                                  <div className="absolute right-3 top-2.5">
                                    <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {musicSearchQuery.trim() !== "" ? (
                                  zingSongs.length > 0 ? (
                                    zingSongs.map((song) => (
                                      <div
                                        key={song.id}
                                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-sm transition-all animate-in slide-in-from-bottom-2 duration-250"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <img
                                            src={song.coverUrl}
                                            alt={song.title}
                                            className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0"
                                          />
                                          <div className="min-w-0">
                                            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{song.title}</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{song.artist}</p>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleSelectSong(song)}
                                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold cursor-pointer transition-all shadow-sm shrink-0"
                                        >
                                          Chọn
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    !isSearchingMusic && (
                                      <p className="text-center py-4 text-[10px] font-semibold text-slate-400">Không tìm thấy bài hát nào</p>
                                    )
                                  )
                                ) : (
                                  <>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Gợi ý cho bạn</span>
                                    {MUSIC_LIBRARY.map((song) => (
                                      <div
                                        key={song.id}
                                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-sm transition-all animate-in slide-in-from-bottom-2 duration-250"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <img
                                            src={song.coverUrl}
                                            alt={song.title}
                                            className="w-10 h-10 rounded-lg object-cover shadow-sm shrink-0"
                                          />
                                          <div className="min-w-0">
                                            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{song.title}</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{song.artist}</p>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleSelectSong(song)}
                                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold cursor-pointer transition-all shadow-sm shrink-0"
                                        >
                                          Chọn
                                        </button>
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (!isLoadingSongDetails && selectedSong) ? (
                            <div className="space-y-4">
                              {/* Bài hát đang chọn */}
                              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 border border-blue-100/50 dark:border-slate-800/80 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative group shrink-0">
                                    <img
                                      src={selectedSong.coverUrl}
                                      alt={selectedSong.title}
                                      className={cn(
                                        "w-12 h-12 rounded-xl object-cover shadow-md",
                                        isMusicPlaying && "animate-spin [animation-duration:8s]"
                                      )}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                                      className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                      {isMusicPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </button>
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{selectedSong.title}</h4>
                                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">{selectedSong.artist}</p>
                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[8px] font-bold uppercase tracking-wider">
                                      {musicOverlayType === "sticker" ? "Nhãn nhạc" : musicOverlayType === "lyrics" ? "Lyrics chạy" : "Nhạc nền"}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSong(null);
                                    setIsMusicPlaying(false);
                                  }}
                                  className="text-[10px] font-bold text-red-500 hover:underline shrink-0 cursor-pointer"
                                >
                                  Đổi bài
                                </button>
                              </div>

                              {/* Kiểu hiển thị trên Story */}
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("musicOverlayType")}</label>
                                <div className="grid grid-cols-3 gap-1">
                                  {[
                                    { id: "sticker", name: "Sticker" },
                                    { id: "lyrics", name: "Lyric chạy" },
                                    { id: "none", name: "Ẩn nhạc" },
                                  ].map((opt) => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => setMusicOverlayType(opt.id as any)}
                                      className={cn(
                                        "py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all",
                                        musicOverlayType === opt.id
                                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                      )}
                                    >
                                      {opt.name}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Độ dài đoạn nhạc */}
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Thời lượng cắt ({musicDuration}s)</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {[15, 30].map((dur) => (
                                    <button
                                      key={dur}
                                      type="button"
                                      onClick={() => {
                                        setMusicDuration(dur);
                                        // Căn chỉnh offset nếu vượt quá giới hạn
                                        if (musicStartOffset + dur > selectedSong.duration) {
                                          setMusicStartOffset(Math.max(0, selectedSong.duration - dur));
                                        }
                                      }}
                                      className={cn(
                                        "py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all",
                                        musicDuration === dur
                                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                      )}
                                    >
                                      {dur} giây
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Bộ cắt nhạc Slider 2 đầu */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                  <span>Cắt phân khúc đoạn nhạc</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-mono">
                                    {Math.floor(musicStartOffset / 60)}:{(musicStartOffset % 60).toString().padStart(2, "0")} - {Math.floor((musicStartOffset + musicDuration) / 60)}:{((musicStartOffset + musicDuration) % 60).toString().padStart(2, "0")} ({musicDuration}s)
                                  </span>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-3">
                                  <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden flex items-center justify-between px-1">
                                    {/* Sóng nhạc nền */}
                                    <div className="absolute inset-0 flex items-center justify-around px-2 opacity-20 pointer-events-none">
                                      {Array.from({ length: 30 }).map((_, i) => (
                                        <div
                                          key={i}
                                          className="w-0.5 bg-slate-600 dark:bg-slate-400 rounded"
                                          style={{ height: `${20 + Math.sin(i * 1.5) * 50}%` }}
                                        />
                                      ))}
                                    </div>

                                    {/* Sóng nhạc Highlight trong phân khúc chọn */}
                                    <div
                                      className="absolute top-0 bottom-0 bg-blue-600/10 border-l border-r border-blue-500 flex items-center justify-around overflow-hidden transition-all duration-150"
                                      style={{
                                        left: `${(musicStartOffset / selectedSong.duration) * 100}%`,
                                        right: `${100 - ((musicStartOffset + musicDuration) / selectedSong.duration) * 100}%`
                                      }}
                                    >
                                      {Array.from({ length: 30 }).map((_, i) => (
                                        <div
                                          key={i}
                                          className="w-0.5 bg-blue-600 dark:bg-blue-400 rounded animate-pulse"
                                          style={{ height: `${30 + Math.sin(i * 1.8) * 50}%` }}
                                        />
                                      ))}
                                    </div>

                                    <div className="text-[8px] font-bold text-slate-500 z-10 select-none">0:00</div>
                                    <div className="text-[8px] font-bold text-slate-500 z-10 select-none font-mono">
                                      {Math.floor(selectedSong.duration / 60)}:{(selectedSong.duration % 60).toString().padStart(2, "0")}
                                    </div>
                                  </div>

                                  {/* Slider 1: Điểm bắt đầu (Cắt Đầu) */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                                      <span>Điểm bắt đầu (Cắt Đầu)</span>
                                      <span className="font-mono text-slate-600 dark:text-slate-300">
                                        {Math.floor(musicStartOffset / 60)}:{(musicStartOffset % 60).toString().padStart(2, "0")}
                                      </span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={Math.max(0, selectedSong.duration - 5)} // Tối thiểu 5s
                                      step={1}
                                      value={musicStartOffset}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setMusicStartOffset(val);
                                        const maxEnd = selectedSong.duration;
                                        const currentEnd = val + musicDuration;
                                        if (currentEnd > maxEnd) {
                                          setMusicDuration(maxEnd - val);
                                        } else if (musicDuration < 5) {
                                          setMusicDuration(5);
                                        }
                                        setIsMusicPlaying(true);
                                      }}
                                      className="w-full accent-blue-600 cursor-pointer"
                                    />
                                  </div>

                                  {/* Slider 2: Điểm kết thúc (Cắt Đuôi) */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                                      <span>Điểm kết thúc (Cắt Đuôi)</span>
                                      <span className="font-mono text-slate-600 dark:text-slate-300">
                                        {Math.floor((musicStartOffset + musicDuration) / 60)}:{((musicStartOffset + musicDuration) % 60).toString().padStart(2, "0")}
                                      </span>
                                    </div>
                                    <input
                                      type="range"
                                      min={Math.min(selectedSong.duration, musicStartOffset + 5)} // Tối thiểu 5s sau điểm bắt đầu
                                      max={selectedSong.duration}
                                      step={1}
                                      value={musicStartOffset + musicDuration}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        const newDuration = Math.max(5, val - musicStartOffset);
                                        setMusicDuration(newDuration);
                                        setIsMusicPlaying(true);
                                      }}
                                      className="w-full accent-indigo-600 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dưới cùng: Quyền riêng tư & Nút Share */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Quyền riêng tư:</span>
              </div>
              <select
                value={audience}
                onChange={(e: any) => setAudience(e.target.value)}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="friends">Bạn bè</option>
                <option value="public">Công khai</option>
                <option value="custom">Chỉ định</option>
              </select>
            </div>

            <button
              onClick={handleShareStory}
              disabled={loading || (tab === "text" ? !textContent.trim() : !mediaFile)}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
                loading || (tab === "text" ? !textContent.trim() : !mediaFile)
                  ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl active:scale-95"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {tab === "media" && uploadProgress > 0
                    ? `${t("uploadingStory")} (${uploadProgress}%)`
                    : t("uploadingStory")
                  }
                </>
              ) : (
                t("postStory")
              )}
            </button>
          </div>
        </div>

        {/* Vùng Preview hiển thị trực quan bên phải */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 relative" onClick={() => setSelectedOverlayId(null)}>
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes storyProgress {
              0% { transform: scaleX(0); }
              100% { transform: scaleX(1); }
            }
          `}} />

          <div className="absolute top-4 left-4 text-xs font-semibold text-white/60 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md z-30">{t("preview")}</div>

          <div className="w-[270px] h-[480px] rounded-3xl overflow-hidden shadow-2xl relative border-[6px] border-slate-800 dark:border-slate-900 bg-slate-950 flex flex-col justify-between transition-all duration-300">
            {/* Thanh tiến trình giả lập */}
            <div className="absolute top-3.5 left-3 right-3 h-1 bg-white/20 rounded-full overflow-hidden z-20">
              <div
                className="h-full bg-white rounded-full origin-left"
                style={{
                  animation: "storyProgress 5s linear infinite",
                }}
              />
            </div>

            {tab === "text" ? (
              // Preview Tin Chữ
              <div className={cn("w-full h-full flex items-center justify-center p-6 text-center select-none relative", selectedGradient.className)}>
                <p className="text-white text-base font-bold leading-relaxed break-words max-h-full overflow-y-auto">
                  {textContent || "Văn bản xem trước của bạn ở đây..."}
                </p>

                {selectedSong && musicOverlayType !== "none" && (
                  <div className="absolute inset-x-3 bottom-6 flex flex-col items-center justify-center pointer-events-none select-none z-30">
                    {musicOverlayType === "sticker" ? (
                      <div className="bg-black/60 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-3 border border-white/10 shadow-lg max-w-[220px] animate-bounce [animation-duration:3s]">
                        <div className="relative shrink-0">
                          <img
                            src={selectedSong.coverUrl}
                            alt={selectedSong.title}
                            className={cn(
                              "w-10 h-10 rounded-xl object-cover shadow-md border border-white/20",
                              isMusicPlaying && "animate-spin [animation-duration:8s]"
                            )}
                          />
                          <Disc className="w-4 h-4 text-white absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 shrink-0" />
                        </div>
                        <div className="min-w-0 text-left">
                          <h4 className="text-[11px] font-extrabold text-white truncate">{selectedSong.title}</h4>
                          <p className="text-[9px] font-medium text-slate-300 truncate">{selectedSong.artist}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full text-center px-4 py-3 bg-black/50 dark:bg-slate-900/60 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg flex flex-col items-center max-w-[220px]">
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                          <Volume2 className="w-3 h-3 animate-pulse" />{t("lyrics")}</span>
                        <div className="flex flex-col gap-0.5 transition-all duration-300">
                          {creatorLyricIndex > 0 && (
                            <p className="text-[8px] font-medium text-white/30 truncate max-w-[180px]">
                              {selectedSong.lyrics[creatorLyricIndex - 1]?.text}
                            </p>
                          )}
                          <p className="text-xs font-extrabold text-blue-300 leading-snug px-2 py-0.5 bg-blue-600/10 rounded-xl max-w-[200px] animate-pulse">
                            "{selectedSong.lyrics[creatorLyricIndex]?.text || selectedSong.lyrics[0]?.text || "🎵 ... 🎵"}"
                          </p>
                          {creatorLyricIndex < selectedSong.lyrics.length - 1 && (
                            <p className="text-[8px] font-medium text-white/30 truncate max-w-[180px]">
                              {selectedSong.lyrics[creatorLyricIndex + 1]?.text}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Preview Tin Ảnh/Video
              // Preview Tin Ảnh/Video
              <div className="w-full h-full relative bg-slate-900 flex items-center justify-center overflow-hidden">
                {mediaPreview ? (
                  mediaType === "video" ? (
                    <video
                      src={mediaPreview}
                      controls={false}
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{ filter: activeFilter }}
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{ filter: activeFilter }}
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <ImageIcon className="w-12 h-12 text-white/20 mb-2" />
                    <span className="text-white/40 text-xs">Chưa có ảnh/video nào được chọn</span>
                  </div>
                )}

                {/* Canvas vẽ tự do Giai đoạn 3 */}
                {mediaPreview && (
                  <canvas
                    ref={canvasRef}
                    width={270}
                    height={480}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className={cn(
                      "absolute inset-0 w-full h-full z-20 pointer-events-none",
                      isDrawingEnabled && "pointer-events-auto cursor-crosshair"
                    )}
                  />
                )}

                {/* Custom Text Overlays (Giai đoạn 2) */}
                {mediaPreview && textOverlays.map((overlay) => {
                  const fontStyleClass =
                    overlay.fontStyle === "serif" ? "font-serif" :
                      overlay.fontStyle === "mono" ? "font-mono tracking-wider" :
                        overlay.fontStyle === "handwritten" ? "font-serif italic tracking-wide" :
                          overlay.fontStyle === "bold" ? "font-sans font-black uppercase tracking-tight" :
                            "font-sans";

                  const highlightStyle =
                    overlay.backgroundColor === "black" ? "bg-black/75 px-3 py-1.5 rounded-xl shadow-md" :
                      overlay.backgroundColor === "white" ? "bg-white text-slate-900 px-3 py-1.5 rounded-xl shadow-md" :
                        "px-3 py-1.5";

                  return (
                    <div
                      key={overlay.id}
                      onMouseDown={(e) => {
                        if (!isDrawingEnabled) {
                          handleMouseDown(e, overlay.id);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDrawingEnabled) {
                          setSelectedOverlayId(overlay.id);
                          setSelectedStickerId(null);
                        }
                      }}
                      className={cn(
                        "absolute transform -translate-x-1/2 -translate-y-1/2 select-none text-center cursor-move font-bold z-10 hover:scale-105 active:scale-95 transition-all whitespace-nowrap",
                        fontStyleClass,
                        highlightStyle,
                        selectedOverlayId === overlay.id ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 scale-105" : "",
                        isDrawingEnabled && "pointer-events-none opacity-80"
                      )}
                      style={{
                        left: `${overlay.x}%`,
                        top: `${overlay.y}%`,
                        fontSize: `${overlay.fontSize}px`,
                        color: overlay.color,
                      }}
                    >
                      {overlay.text}
                    </div>
                  );
                })}

                {/* Emoji Stickers (Giai đoạn 3) */}
                {mediaPreview && stickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    onMouseDown={(e) => {
                      if (!isDrawingEnabled) {
                        handleStickerMouseDown(e, sticker.id);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDrawingEnabled) {
                        setSelectedStickerId(sticker.id);
                        setSelectedOverlayId(null);
                      }
                    }}
                    className={cn(
                      "absolute transform -translate-x-1/2 -translate-y-1/2 select-none cursor-move z-10 active:scale-95 transition-all text-center select-none font-bold text-3xl",
                      selectedStickerId === sticker.id ? "ring-2 ring-blue-500 rounded-xl p-1 bg-white/20 backdrop-blur-sm scale-110" : "",
                      isDrawingEnabled && "pointer-events-none opacity-80"
                    )}
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                    }}
                  >
                    {sticker.emoji}
                  </div>
                ))}

                {/* Music Overlay for Media Story */}
                {selectedSong && musicOverlayType !== "none" && mediaPreview && (
                  <div className="absolute inset-x-3 bottom-6 flex flex-col items-center justify-center pointer-events-none select-none z-30">
                    {musicOverlayType === "sticker" ? (
                      <div className="bg-black/60 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-3 border border-white/10 shadow-lg max-w-[220px] animate-bounce [animation-duration:3s]">
                        <div className="relative shrink-0">
                          <img
                            src={selectedSong.coverUrl}
                            alt={selectedSong.title}
                            className={cn(
                              "w-10 h-10 rounded-xl object-cover shadow-md border border-white/20",
                              isMusicPlaying && "animate-spin [animation-duration:8s]"
                            )}
                          />
                          <Disc className="w-4 h-4 text-white absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 shrink-0" />
                        </div>
                        <div className="min-w-0 text-left">
                          <h4 className="text-[11px] font-extrabold text-white truncate">{selectedSong.title}</h4>
                          <p className="text-[9px] font-medium text-slate-300 truncate">{selectedSong.artist}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full text-center px-4 py-3 bg-black/50 dark:bg-slate-900/60 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg flex flex-col items-center max-w-[220px]">
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                          <Volume2 className="w-3 h-3 animate-pulse" />{t("lyrics")}</span>
                        <div className="flex flex-col gap-0.5 transition-all duration-300">
                          {creatorLyricIndex > 0 && (
                            <p className="text-[8px] font-medium text-white/30 truncate max-w-[180px]">
                              {selectedSong.lyrics[creatorLyricIndex - 1]?.text}
                            </p>
                          )}
                          <p className="text-xs font-extrabold text-blue-300 leading-snug px-2 py-0.5 bg-blue-600/10 rounded-xl max-w-[200px] animate-pulse">
                            "{selectedSong.lyrics[creatorLyricIndex]?.text || selectedSong.lyrics[0]?.text || "🎵 ... 🎵"}"
                          </p>
                          {creatorLyricIndex < selectedSong.lyrics.length - 1 && (
                            <p className="text-[8px] font-medium text-white/30 truncate max-w-[180px]">
                              {selectedSong.lyrics[creatorLyricIndex + 1]?.text}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Header giả lập ở góc trên */}
            <div className="absolute top-6 left-3 right-3 flex items-center gap-2 z-10 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30" />
              <div className="flex flex-col">
                <div className="h-2.5 w-16 bg-white/40 rounded-full" />
                <div className="h-1.5 w-10 bg-white/20 rounded-full mt-1" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
