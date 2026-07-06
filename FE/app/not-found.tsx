import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center font-sans">
      {/* Illustration - Person sitting on books */}
      <div className="relative w-full max-w-[400px] mb-12">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stack of Books */}
          <rect x="140" y="240" width="120" height="15" rx="2" fill="#FBBF24" />
          <rect x="150" y="225" width="100" height="15" rx="2" fill="#3B82F6" />
          <rect x="145" y="210" width="110" height="15" rx="2" fill="#22C55E" />
          <rect x="155" y="195" width="90" height="15" rx="2" fill="#3B82F6" />

          {/* Person */}
          <path d="M185 130 L215 130 L225 195 L175 195 Z" fill="#FACC15" />
          <path d="M175 195 L160 220 L240 220 L225 195 Z" fill="#1E293B" />
          <rect x="160" y="220" width="15" height="5" fill="#94A3B8" />
          <rect x="225" y="220" width="15" height="5" fill="#94A3B8" />
          <circle cx="200" cy="110" r="20" fill="#4B5563" />
          <path d="M200 120 Q190 125 185 135" stroke="#4B5563" strokeWidth="2" />

          {/* Thought Bubble */}
          <path
            d="M220 100 Q260 50 300 80 Q320 100 300 120 Q280 130 240 110"
            fill="#3B82F6"
          />
          <rect x="265" y="85" width="15" height="20" rx="1" fill="#EF4444" />
          <rect x="263" y="83" width="19" height="3" fill="#1E293B" />
        </svg>
      </div>

      {/* Text Content */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight">
        Oops! It looks like <br /> you&apos;re lost.
      </h1>
      <p className="text-slate-400 font-semibold mb-10 max-w-md mx-auto leading-relaxed">
        The page you&apos;re looking for isn&apos;t available. Try to search
        again or use the go to.
      </p>

      {/* Back to home Button */}
      <Link
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95 text-xs tracking-[0.2em]"
      >
        HOME PAGE
      </Link>
    </div>
  );
}
