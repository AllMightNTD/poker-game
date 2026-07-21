import { Suspense } from "react";
import { BlogList, FeedPostSkeleton } from "@/features/blogs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poker Strategy Guide & Latest News | PKCG",
  description: "Compilation of Poker guide articles, advanced preflop and postflop strategies, and the hottest Poker tournament news from PKCG.",
  alternates: {
    canonical: "https://pkcg.com/blogs",
  },
  openGraph: {
    title: "Poker Strategy Guide & Latest News | PKCG",
    description: "Compilation of Poker guide articles, advanced preflop and postflop strategies, and the hottest Poker tournament news from PKCG.",
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
