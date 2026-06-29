import api from "@/lib/axios";
import { Loader2, Music, Pause, Play, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface ProfileMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMusic: (musicId: string) => Promise<void>;
}

export function ProfileMusicModal({ isOpen, onClose, onSelectMusic }: ProfileMusicModalProps) {
  const t = useTranslations("profile.music");
  const tCommon = useTranslations("common");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const res = await api.get(`/api/v1/stories/zingmp3/search?q=${encodeURIComponent(searchQuery)}`);
      let items = [];
      if (res.data?.data?.items) {
        items = res.data.data.items[0]?.song || [];
      } else if (res.data?.data) {
        items = res.data.data.song || [];
      } else if (Array.isArray(res.data)) {
        items = res.data;
      }
      return items;
    },
    onSuccess: (data) => {
      setResults(data);
    },
    onError: (err) => {
      console.error("Search music error", err);
    }
  });

  const previewMutation = useMutation({
    mutationFn: async (songId: string) => {
      const res = await api.get(`/api/v1/stories/zingmp3/song/${songId}`);
      return res.data?.data?.["128"] || res.data?.["128"];
    }
  });

  const selectMutation = useMutation({
    mutationFn: async (songId: string) => {
      await onSelectMusic(songId);
    },
    onSuccess: () => {
      onClose();
    },
    onError: (err) => {
      console.error("Select music error", err);
    }
  });

  useEffect(() => {
    if (!isOpen) {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
      setPreviewId(null);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const searchMusic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchMutation.mutate(query);
  };

  const togglePreview = (song: any) => {
    if (previewId === song.encodeId) {
      audio?.pause();
      setPreviewId(null);
      setAudio(null);
      return;
    }

    if (audio) {
      audio.pause();
    }

    previewMutation.mutate(song.encodeId, {
      onSuccess: (streamUrl) => {
        if (streamUrl) {
          const newAudio = new Audio(streamUrl);
          newAudio.play();
          setAudio(newAudio);
          setPreviewId(song.encodeId);
          newAudio.onended = () => {
            setPreviewId(null);
            setAudio(null);
          };
        }
      },
      onError: (err) => {
        console.error("Failed to load stream", err);
      }
    });
  };

  const handleSelect = (song: any) => {
    if (audio) audio.pause();
    selectMutation.mutate(song.encodeId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-full animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Music size={20} className="text-indigo-500" />
            {t("select") || "Choose a song"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100">
          <form onSubmit={searchMusic} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tCommon("search") || "Search..."}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {searchMutation.isPending ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
              <p className="text-sm">{tCommon("loading") || "Loading..."}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <Music size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium">Search for your favorite song</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((song: any) => (
                <div key={song.encodeId} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 shadow-sm border border-slate-200">
                    <img src={song.thumbnail || song.thumbnailM} alt={song.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => togglePreview(song)}
                      className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${previewId === song.encodeId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      {previewId === song.encodeId ? (
                        <Pause size={18} className="text-white fill-white" />
                      ) : (
                        <Play size={18} className="text-white fill-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{song.title}</p>
                    <p className="text-xs text-slate-500 truncate">{song.artistsNames}</p>
                  </div>

                  <button
                    onClick={() => handleSelect(song)}
                    disabled={selectMutation.isPending}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 text-sm font-bold rounded-lg transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1"
                  >
                    {selectMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Select"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
