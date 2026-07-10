"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/core/providers/SocketProvider";
import { useAnimationRegistry } from "./AnimationRegistryContext";
import { usePokerGame } from "../hooks/usePokerGame";

interface ThrowableItem {
  id: string;
  itemId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  status: "flying" | "impact";
}

const playAudio = (path: string, volume: number = 0.5) => {
  try {
    const audio = new Audio(path);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {
    // Graceful fallback if audio is not supported/loaded
  }
};

export const ThrowableOverlay: React.FC = () => {
  const { socket } = useSocket();
  const { getSeatCoords } = useAnimationRegistry();
  const { soundEffectsVol } = usePokerGame();
  
  const [activeThrowables, setActiveThrowables] = useState<ThrowableItem[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleThrowableReceived = (data: {
      sender_seat: number;
      target_seat: number;
      item_id: string;
      timestamp: number;
    }) => {
      const senderCoords = getSeatCoords(data.sender_seat);
      const targetCoords = getSeatCoords(data.target_seat);

      if (senderCoords && targetCoords) {
        // Calculate volume based on settings
        const vol = (soundEffectsVol || 100) / 200; // max 0.5
        playAudio("/sounds/throw.mp3", vol);

        const newId = `${data.item_id}-${data.timestamp}-${Math.random()}`;
        setActiveThrowables((prev) => [
          ...prev,
          {
            id: newId,
            itemId: data.item_id,
            startX: senderCoords.x,
            startY: senderCoords.y,
            endX: targetCoords.x,
            endY: targetCoords.y,
            status: "flying",
          },
        ]);
      }
    };

    socket.on("table:throwable-item-received", handleThrowableReceived);
    return () => {
      socket.off("table:throwable-item-received", handleThrowableReceived);
    };
  }, [socket, getSeatCoords, soundEffectsVol]);

  const handleFlightComplete = (item: ThrowableItem) => {
    const vol = (soundEffectsVol || 100) / 200;
    
    // Play impact audio
    if (item.itemId === "tomato") playAudio("/sounds/splat.mp3", vol);
    else if (item.itemId === "beer") playAudio("/sounds/clink.mp3", vol);
    else if (item.itemId === "rose") playAudio("/sounds/heart.mp3", vol);
    else if (item.itemId === "bomb") playAudio("/sounds/explosion.mp3", vol);

    // Update status to impact
    setActiveThrowables((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, status: "impact" } : t))
    );

    // Auto cleanup after impact animation finishes
    setTimeout(() => {
      setActiveThrowables((prev) => prev.filter((t) => t.id !== item.id));
    }, 1200);
  };

  const getItemEmoji = (itemId: string) => {
    switch (itemId) {
      case "tomato":
        return "🍅";
      case "beer":
        return "🍺";
      case "rose":
        return "🌹";
      case "bomb":
        return "💣";
      default:
        return "🍅";
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {activeThrowables.map((item) => {
          if (item.status === "flying") {
            const peakY = Math.min(item.startY, item.endY) - 120;
            return (
              <motion.div
                key={item.id}
                initial={{
                  x: item.startX,
                  y: item.startY,
                  scale: 0.6,
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  x: item.endX,
                  y: [item.startY, peakY, item.endY],
                  scale: [0.6, 1.3, 1.0],
                  rotate: 360,
                }}
                transition={{
                  duration: 0.9,
                  ease: "easeInOut",
                }}
                onAnimationComplete={() => handleFlightComplete(item)}
                className="absolute text-3xl select-none"
                style={{
                  left: 0,
                  top: 0,
                  marginLeft: "-16px",
                  marginTop: "-16px",
                }}
              >
                {getItemEmoji(item.itemId)}
              </motion.div>
            );
          }

          // Impact Animations
          if (item.status === "impact") {
            return (
              <div
                key={item.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: item.endX,
                  top: item.endY,
                  width: "1px",
                  height: "1px",
                }}
              >
                {/* 🍅 Tomato Splat */}
                {item.itemId === "tomato" && (
                  <div className="relative flex items-center justify-center">
                    {/* Splat Background */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: [0, 0.9, 0.7] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute w-12 h-12 bg-red-600 rounded-full blur-[2px] opacity-70"
                    />
                    {/* Tomato slice pieces popping out */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const angle = (i * 360) / 6;
                      const rad = (angle * Math.PI) / 180;
                      const dist = 30 + Math.random() * 15;
                      return (
                        <motion.div
                          key={i}
                          initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
                          animate={{
                            x: Math.cos(rad) * dist,
                            y: Math.sin(rad) * dist,
                            scale: 0.3,
                            opacity: 0,
                            rotate: angle * 2,
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute text-xs"
                        >
                          🍅
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* 🍺 Beer Clink Splash */}
                {item.itemId === "beer" && (
                  <div className="relative flex items-center justify-center">
                    {/* Two clinking glasses animation */}
                    <motion.div
                      initial={{ scale: 0.2, rotate: -45, opacity: 0 }}
                      animate={{
                        scale: [0.2, 1.2, 1.0],
                        rotate: [-45, 0, -10],
                        opacity: [0, 1, 0],
                      }}
                      transition={{ duration: 0.6 }}
                      className="absolute text-4xl"
                    >
                      🍻
                    </motion.div>
                    {/* Splash particles */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = (i * 360) / 8;
                      const rad = (angle * Math.PI) / 180;
                      const dist = 25 + Math.random() * 20;
                      return (
                        <motion.div
                          key={i}
                          initial={{ x: 0, y: 0, scale: 0.6, opacity: 1 }}
                          animate={{
                            x: Math.cos(rad) * dist,
                            y: Math.sin(rad) * dist - 10, // float upwards slightly
                            scale: 0.2,
                            opacity: 0,
                          }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="absolute w-2 h-2 bg-yellow-300 rounded-full border border-white"
                        />
                      );
                    })}
                  </div>
                )}

                {/* 🌹 Rose Tặng Hoa Lãng Mạn */}
                {item.itemId === "rose" && (
                  <div className="relative flex items-center justify-center">
                    {/* Big rose scaling up */}
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{
                        scale: [0.2, 1.4, 1.0],
                        y: [0, -15, 0],
                        opacity: [0, 1, 0.8, 0],
                      }}
                      transition={{ duration: 1.1 }}
                      className="absolute text-4xl"
                    >
                      🌹
                    </motion.div>
                    {/* Floating hearts */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const angle = (i * 360) / 6;
                      const rad = (angle * Math.PI) / 180;
                      const dist = 20 + Math.random() * 15;
                      return (
                        <motion.div
                          key={i}
                          initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
                          animate={{
                            x: Math.cos(rad) * dist,
                            y: Math.sin(rad) * dist - 25, // Hearts float up
                            scale: [0.4, 0.9, 0.3],
                            opacity: [0, 0.9, 0],
                          }}
                          transition={{ duration: 1.0, delay: i * 0.05 }}
                          className="absolute text-xs"
                        >
                          💖
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* 💣 Bomb Explosion */}
                {item.itemId === "bomb" && (
                  <div className="relative flex items-center justify-center">
                    {/* Explosion flash */}
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{
                        scale: [0.2, 1.8, 1.6],
                        opacity: [0, 1, 0],
                      }}
                      transition={{ duration: 0.4 }}
                      className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 blur-[4px]"
                    />
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{
                        scale: [0.2, 1.3, 0.9],
                        opacity: [0, 1, 0],
                      }}
                      transition={{ duration: 0.5 }}
                      className="absolute text-4xl"
                    >
                      💥
                    </motion.div>
                    {/* Smoke particles */}
                    {Array.from({ length: 10 }).map((_, i) => {
                      const angle = Math.random() * 360;
                      const rad = (angle * Math.PI) / 180;
                      const dist = 35 + Math.random() * 25;
                      return (
                        <motion.div
                          key={i}
                          initial={{ x: 0, y: 0, scale: 0.8, opacity: 0.9 }}
                          animate={{
                            x: Math.cos(rad) * dist,
                            y: Math.sin(rad) * dist,
                            scale: 1.5,
                            opacity: 0,
                          }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="absolute w-4 h-4 bg-slate-500/30 rounded-full blur-[2px]"
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </AnimatePresence>
    </div>
  );
};
