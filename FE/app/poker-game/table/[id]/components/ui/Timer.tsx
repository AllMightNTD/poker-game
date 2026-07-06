"use client";

import React from "react";

interface TimerProps {
  value: number;
  max: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CircularTimer: React.FC<TimerProps> = ({
  value,
  max,
  size = "md",
  className = "",
}) => {
  const radius = size === "sm" ? 10 : size === "md" ? 16 : 22;
  const stroke = size === "sm" ? 2 : size === "md" ? 2.5 : 3;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  const svgSize = (radius + stroke + 2) * 2;

  const color =
    value > max * 0.5
      ? "#10b981" // emerald
      : value > max * 0.25
      ? "#f59e0b" // amber
      : "#ef4444"; // red

  const sizeStyle = {
    sm: "w-7 h-7 text-[9px]",
    md: "w-11 h-11 text-xs",
    lg: "w-14 h-14 text-sm",
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeStyle[size]} ${className}`}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="absolute inset-0 w-full h-full -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke="rgba(100,116,139,0.3)"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <span
        className="relative z-10 font-black tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
};

interface LinearTimerProps {
  value: number;
  max: number;
  className?: string;
}

export const LinearTimer: React.FC<LinearTimerProps> = ({ value, max, className = "" }) => {
  const pct = (value / max) * 100;
  const color =
    value > max * 0.5
      ? "bg-emerald-500"
      : value > max * 0.25
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className={`h-1 bg-slate-900 overflow-hidden ${className}`}>
      <div
        className={`h-full ${color} transition-all duration-1000`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
