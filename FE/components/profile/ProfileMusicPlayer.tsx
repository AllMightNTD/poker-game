"use client";
import api from "@/lib/axios";
import { Disc3, Edit2, Music, Pause, Play, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ProfileMusicModal } from "./ProfileMusicModal";
import { useQuery } from "@tanstack/react-query";

interface ProfileMusicPlayerProps {
  musicId?: string;
  isOwnProfile: boolean;
  onUpdateMusic?: (musicId: string) => Promise<void>;
}

export function ProfileMusicPlayer({ musicId, isOwnProfile, onUpdateMusic }: ProfileMusicPlayerProps) {
  const t = useTranslations("profile.music");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: streamUrl } = useQuery({
    queryKey: ["profileMusic", musicId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/stories/zingmp3/song/${musicId}`);
      return res.data?.data?.["128"] || res.data?.["128"] || null;
    },
    enabled: !!musicId,
  });

  useEffect(() => {
    if (streamUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(streamUrl);
        audioRef.current.loop = true;
        // Optionally auto-play if browsers allow
      } else {
        audioRef.current.src = streamUrl;
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [streamUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Autoplay prevented", err);
      });
    }
  };

  const handleSelectMusic = async (newMusicId: string) => {
    if (onUpdateMusic) {
      await onUpdateMusic(newMusicId);
    }
    // Update local state temporarily if needed
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  if (!musicId && !isOwnProfile) return null;

  return (
    <>
      <div className="absolute top-4 right-6 flex flex-col items-end gap-2 z-10">
        {!musicId && isOwnProfile ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-sm rounded-full text-xs font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:scale-105 transition-all group"
          >
            <Music size={14} className="group-hover:animate-bounce" />
            <span>Add Music</span>
            <Plus size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-sm rounded-full px-3 py-1.5 flex items-center gap-2 group transition-all hover:bg-white cursor-pointer" onClick={togglePlay}>
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 overflow-hidden shadow-inner ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                <Disc3 size={24} className="text-slate-700 absolute" />
                <div className="w-2 h-2 bg-slate-300 rounded-full z-10 border border-slate-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("playing") || "Now Playing"}</span>
                <span className="text-xs font-bold text-slate-700 w-24 truncate">Profile Music</span>
              </div>
              {isPlaying ? (
                <Pause size={14} className="text-indigo-500 ml-1" />
              ) : (
                <Play size={14} className="text-slate-400 ml-1 fill-slate-400" />
              )}
            </div>

            {isOwnProfile && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-8 h-8 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-sm rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-white transition-all"
                title="Change Music"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <ProfileMusicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectMusic={handleSelectMusic}
      />
    </>
  );
}
