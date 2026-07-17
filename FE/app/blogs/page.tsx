import { Suspense } from "react";
import { BlogList, FeedPostSkeleton } from "@/features/blogs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cẩm Nang Chiến Thuật Poker & Tin Tức Mới Nhất | PKCG",
  description: "Tổng hợp các bài viết hướng dẫn luật chơi Poker, chiến thuật preflop, postflop nâng cao và tin tức giải đấu Poker hot nhất từ PKCG.",
  alternates: {
    canonical: "https://pkcg.com/blogs",
  },
  openGraph: {
    title: "Cẩm Nang Chiến Thuật Poker & Tin Tức Mới Nhất | PKCG",
    description: "Tổng hợp các bài viết hướng dẫn luật chơi Poker, chiến thuật preflop, postflop nâng cao và tin tức giải đấu Poker hot nhất từ PKCG.",
    type: "website",
  },
};

// Suspense boundary wraps the client BlogList component.
// FeedPostSkeleton is shown while initial blog list loads.
function BlogListFallback() {
  return (
    <div className="min-h-screen bg-[#050B14] text-white">
      <div className="relative py-16 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="h-12 w-64 bg-slate-800 rounded-lg animate-pulse mx-auto" />
      </div>
      <div className="max-w-3xl mx-auto px-6 pb-24 space-y-16">
        <FeedPostSkeleton />
        <FeedPostSkeleton />
      </div>
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense fallback={<BlogListFallback />}>
      <BlogList />
    </Suspense>
  );
}
