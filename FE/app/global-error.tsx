'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <h2 className="text-3xl font-extrabold mb-4">A system error occurred!</h2>
        <p className="text-slate-400 mb-6 max-w-md">We are fixing the issue. Please try again later.</p>
        <button
          onClick={() => reset()}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 text-xs tracking-wider"
        >
          TRY AGAIN
                          </button>
      </body>
    </html>
  );
}
