"use client";

import React, { useEffect, useRef } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTranslations } from "next-intl";

interface EmojiPickerPopupProps {
  onEmojiSelect: (emoji: any) => void;
  onClickOutside: () => void;
  position?: "top" | "bottom" | "left" | "right";
}

export default function EmojiPickerPopup({
  onEmojiSelect,
  onClickOutside,
  position = "top",
}: EmojiPickerPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("common");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClickOutside]);

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full mb-2";
      case "bottom":
        return "top-full mt-2";
      case "left":
        return "right-full mr-2";
      case "right":
        return "left-full ml-2";
      default:
        return "bottom-full mb-2";
    }
  };

  return (
    <div
      ref={ref}
      className={`absolute z-50 ${getPositionClasses()}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <Picker
          data={data}
          onEmojiSelect={onEmojiSelect}
          theme="auto"
          set="native"
          previewPosition="none"
          skinTonePosition="none"
          searchPosition="top"
          navPosition="bottom"
          perLine={8}
          maxFrequentRows={1}
        />
      </div>
    </div>
  );
}
