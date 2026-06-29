'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <h2 className="text-3xl font-extrabold mb-4">Đã xảy ra lỗi!</h2>
      <p className="text-slate-400 mb-6 max-w-md">Vui lòng tải lại trang hoặc quay lại sau.</p>
      <button
        onClick={() => reset()}
        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 text-xs tracking-wider"
      >
        THỬ LẠI
      </button>
    </div>
  );
}
