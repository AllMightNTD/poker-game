'use client';

import React from 'react';

export default function GlobalNotFound() {
  return (
    <html>
      <body className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-4xl font-extrabold mb-4">404 - Page Not Found</h1>
        <p className="text-slate-400 mb-6">The page you are looking for does not exist.</p>
        <a
          href="/"
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 text-xs tracking-wider"
        >
          GO HOME
        </a>
      </body>
    </html>
  );
}
