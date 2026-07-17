"use client";

import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, Suspense } from "react";
import { blogsApi } from "../api/blogsApi";
import type { BlogListItem, BlogListPage, BlogPost } from "../types";

// ── Skeletons ────────────────────────────────────────────────────────────────

export function FeedPostSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="w-full h-[40vh] min-h-[300px] rounded-3xl bg-slate-800" />
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-4">
        <div className="h-4 bg-slate-700 rounded-md w-1/4" />
        <div className="h-8 bg-slate-700 rounded-md w-full" />
        <div className="h-8 bg-slate-700 rounded-md w-3/4" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-800 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Single post — uses useSuspenseQuery, no early-return ─────────────────────

function FeedPostContent({
  item,
  isLast,
}: {
  item: BlogListItem;
  isLast: boolean;
}): React.ReactElement {
  const { data: post } = useSuspenseQuery<BlogPost>({
    queryKey: ["blog", item.slug],
    queryFn: () => blogsApi.getBySlug(item.slug),
    staleTime: 5 * 60 * 1000,
  });

  const formattedDate = new Date(post.created_at).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const readingTime = Math.ceil(
    (post.content?.replace(/<[^>]+>/g, "").length ?? 0) / 1000
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={!isLast ? "border-b border-white/10 pb-16 mb-16" : ""}
    >
      {/* Cinematic Hero */}
      <div className="relative w-full h-[45vh] min-h-[340px] rounded-3xl overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-slate-900">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover opacity-40"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-10">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-black uppercase tracking-wider rounded-md">
              {post.category || "Strategy"}
            </span>
            {post.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-white/10 text-slate-300 text-xs font-medium rounded-md border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4 leading-[1.1]">
            {post.title}
          </h2>

          <div className="flex items-center gap-5 text-sm text-slate-400 font-medium">
            <span>📅 {formattedDate}</span>
            <span>👁 {post.views_count.toLocaleString()} views</span>
            {readingTime > 0 && <span>⏱ {readingTime} min read</span>}
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="w-full max-w-3xl mx-auto px-6 pt-10">
        {post.excerpt && (
          <div className="mb-10 pl-5 border-l-4 border-yellow-500/60 text-slate-300 text-lg italic leading-relaxed">
            {post.excerpt}
          </div>
        )}

        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-white
            prose-a:text-yellow-400 hover:prose-a:text-yellow-300
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-strong:text-white
            prose-li:text-slate-300
            prose-blockquote:border-yellow-500 prose-blockquote:text-slate-300 prose-blockquote:bg-white/5 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4
            prose-code:bg-white/10 prose-code:text-yellow-300 prose-code:rounded prose-code:px-1 prose-code:text-sm"
          dangerouslySetInnerHTML={{ __html: post.content || "<p>Content not available.</p>" }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mr-2">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-xs font-medium rounded-full hover:border-yellow-500/40 hover:text-yellow-400 transition-all cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

// Wrap each post in its own Suspense boundary so they load independently
function FeedPost({ item, isLast }: { item: BlogListItem; isLast: boolean }): React.ReactElement {
  return (
    <Suspense fallback={<FeedPostSkeleton />}>
      <FeedPostContent item={item} isLast={isLast} />
    </Suspense>
  );
}

// ── Feed ─────────────────────────────────────────────────────────────────────

export function BlogList(): React.ReactElement {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteQuery<BlogListPage>({
    queryKey: ["blogs-feed"],
    queryFn: ({ pageParam }) =>
      blogsApi.list({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next_page ? (lastPage.meta.next_cursor ?? undefined) : undefined,
  });

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: "400px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  const allItems = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="min-h-screen bg-[#050B14] text-white selection:bg-yellow-500/30">
      {/* Page header */}
      <div className="relative py-16 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-4xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-4"
        >
          POKER{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">
            STRATEGIES
          </span>
        </motion.h1>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/40 to-slate-900/80 border border-blue-500/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md"
          >
            <div>
              <h2 className="text-3xl font-black uppercase tracking-wide text-white mb-2">
                Ready to hit the tables?
              </h2>
              <p className="text-blue-300">
                Apply these strategies right now in our high-stakes rooms.
              </p>
            </div>

            <Link href="/poker-game" className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500" />
              <button className="relative px-10 py-4 bg-gradient-to-b from-[#FFF6B3] via-[#FFD84D] to-[#C79500] rounded-xl text-slate-900 font-black uppercase tracking-[0.2em] text-sm hover:-translate-y-1 transition-transform shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                Play Now
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        {isError && (
          <div className="text-center text-red-400 py-20 font-medium">
            Không thể tải bài viết. Vui lòng thử lại sau.
          </div>
        )}

        {allItems.length === 0 && !isError && (
          <div className="text-center text-slate-500 py-20">
            Chưa có bài viết nào. Quay lại sau nhé!
          </div>
        )}

        {allItems.map((item, i) => (
          <FeedPost key={item.id} item={item} isLast={i === allItems.length - 1} />
        ))}

        {/* Infinite scroll trigger */}
        <div ref={sentinelRef} className="h-1 w-full" />

        {isFetchingNextPage && (
          <div className="flex justify-center mt-4">
            <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* End of feed CTA */}
        {!hasNextPage && allItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mt-8 p-10 rounded-3xl relative overflow-hidden bg-gradient-to-br from-blue-900/30 to-black border border-white/10 backdrop-blur-md text-center flex flex-col items-center"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="relative text-2xl md:text-3xl font-black uppercase tracking-wide text-white mb-4">
              Bạn đã đọc hết bài viết
            </h3>
            <p className="relative text-blue-300 mb-8 max-w-xl">
              Đừng chỉ đọc — thử sức ngay với người chơi thật tại phòng cược cao của chúng tôi.
            </p>
            <Link href="/poker-game" className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-500" />
              <button className="relative px-12 py-5 bg-gradient-to-b from-[#FFF6B3] via-[#FFD84D] to-[#C79500] rounded-xl text-[#091321] font-black uppercase tracking-[0.25em] text-sm hover:-translate-y-1 transition-transform shadow-[0_0_40px_rgba(255,215,0,0.4)]">
                🎰 Play Now
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}