"use client";
import React from "react";
import { Lock, Zap } from "lucide-react";
import Link from "next/link";

export default function ChangePasswordPage() {
  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left side - Illustration (Desktop Only) */}
      <div className="hidden lg:flex lg:w-5/12 bg-blue-50/50 flex-col p-12 relative overflow-hidden">
        <div className="flex items-center gap-2 text-blue-600 mb-12">
          <Zap size={32} fill="currentColor" className="text-emerald-400" />
          <span className="text-3xl font-black tracking-tight">Sociala.</span>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
            {/* Detailed SVG Illustration representing Video Call/Collab (matching Register/Image) */}
            <svg
                viewBox="0 0 500 450"
                className="w-full max-w-lg drop-shadow-xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Monitor/Screen */}
                <rect x="80" y="50" width="340" height="240" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="2" />
                <rect x="85" y="55" width="330" height="200" fill="#F8FAFC" />

                {/* Video Call Grid */}
                <rect x="95" y="65" width="155" height="90" fill="#BFDBFE" rx="2" />
                <rect x="260" y="65" width="155" height="90" fill="#E0F2FE" rx="2" />
                <rect x="95" y="165" width="155" height="80" fill="#DBEAFE" rx="2" />
                <rect x="260" y="165" width="155" height="80" fill="#F1F5F9" rx="2" />

                {/* Avatars in grid */}
                <circle cx="172" cy="100" r="15" fill="#1E40AF" />
                <circle cx="337" cy="100" r="15" fill="#0369A1" />
                <circle cx="172" cy="195" r="15" fill="#1D4ED8" />
                <circle cx="337" cy="195" r="15" fill="#94A3B8" />

                {/* People working at desk */}
                <path d="M120 300 Q110 320 100 400" stroke="#1E293B" strokeWidth="4" />
                <circle cx="125" cy="400" r="30" fill="#2563EB" />
                <circle cx="120" cy="280" r="18" fill="#1E293B" />

                <path d="M380 300 Q390 320 400 400" stroke="#1E293B" strokeWidth="4" />
                <circle cx="375" cy="400" r="30" fill="#2563EB" />
                <circle cx="380" cy="280" r="18" fill="#4B5563" />

                {/* Table Detail */}
                <rect x="60" y="420" width="380" height="8" rx="4" fill="#E2E8F0" />
            </svg>
        </div>
      </div>

      {/* Right side - Change Password Form */}
      <div className="w-full lg:w-7/12 flex flex-col items-center px-6 lg:px-20 py-12">
        {/* Top Buttons */}
        <div className="w-full flex justify-end gap-3 mb-16">
          <Link
            href="/login"
            className="px-8 py-2.5 rounded-full bg-slate-800 text-white text-sm font-bold shadow-lg"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg"
          >
            Register
          </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md flex flex-col">
          <h1 className="text-3xl font-bold text-slate-800 mb-10">
            Change your password
          </h1>

          <form className="space-y-5">
            {/* Old Password Input */}
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="password"
                placeholder="Old Password"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-600 placeholder:text-slate-400"
              />
            </div>

            {/* New Password Input */}
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-600 placeholder:text-slate-400"
              />
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm font-semibold text-slate-400 cursor-pointer hover:text-slate-600">
                Accept Term and Conditions
              </label>
            </div>

            {/* Change Password Button */}
            <button className="w-full py-4 rounded-xl bg-slate-800 text-white font-bold text-lg shadow-xl hover:bg-slate-700 transition-colors">
                Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
