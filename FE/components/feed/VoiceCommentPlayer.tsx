"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceCommentPlayerProps {
  url: string;
}

export default function VoiceCommentPlayer({ url }: VoiceCommentPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#94a3b8", // slate-400
      progressColor: "#3b82f6", // blue-500
      cursorColor: "#3b82f6",
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 36,
      url: url,
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on("ready", () => {
      setIsReady(true);
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on("audioprocess", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [url]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(wavesurferRef.current.isPlaying());
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 px-3 rounded-2xl max-w-sm w-full">
      <button
        onClick={togglePlay}
        disabled={!isReady}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <div className="flex-1 min-w-[150px]">
        <div ref={containerRef} className="w-full" />
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium min-w-[36px] text-right">
        {formatTime(isPlaying ? currentTime : duration)}
      </div>
    </div>
  );
}
