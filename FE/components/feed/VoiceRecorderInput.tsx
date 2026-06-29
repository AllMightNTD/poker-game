"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface VoiceRecorderInputProps {
  onRecordingComplete: (blob: Blob) => void;
  onCancel: () => void;
}

export default function VoiceRecorderInput({
  onRecordingComplete,
  onCancel,
}: VoiceRecorderInputProps) {
  const t = useTranslations("comment");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record voice comments.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && isRecording) {
      // stop without saving
      mediaRecorderRef.current.onstop = () => {};
      mediaRecorderRef.current.stop();
      const stream = mediaRecorderRef.current.stream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    onCancel();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex items-center gap-3 w-full bg-slate-50 dark:bg-slate-800/50 p-2 rounded-full border border-slate-200 dark:border-slate-700">
      <AnimatePresence mode="wait">
        {!isRecording ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 w-full"
          >
            <button
              onClick={startRecording}
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              title={t("holdToRecord")}
            >
              <Mic size={18} />
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t("holdToRecord")}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-500 min-w-[40px]">
                {formatTime(recordingTime)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCancel}
                className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                title={t("cancel")}
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={stopRecording}
                className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-full transition-colors"
                title={t("releaseToSend")}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
