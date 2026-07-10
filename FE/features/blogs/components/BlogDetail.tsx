"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import httpClient from "@/core/api/http-client";
import { PokerHandReplayer } from "./PokerHandReplayer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  content: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  author_id: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

async function fetchBlog(slug: string): Promise<BlogPost> {
  const res = await httpClient.get(`/api/v1/blogs/${slug}`);
  return res.data;
}

function BlogDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#050B14] animate-pulse">
      <div className="w-full h-[50vh] min-h-[400px] bg-slate-800" />
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-4">
        <div className="h-5 bg-slate-700 rounded-md w-1/4" />
        <div className="h-8 bg-slate-700 rounded-md w-full" />
        <div className="h-8 bg-slate-700 rounded-md w-3/4" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-800 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: blog, isLoading, isError } = useQuery<BlogPost>({
    queryKey: ["blog", slug],
    queryFn: () => fetchBlog(slug),
    enabled: !!slug,
    retry: 1,
  });

  if (isLoading) return <BlogDetailSkeleton />;

  if (isError || !blog) {
    return (
      <div className="min-h-screen bg-[#050B14] text-white flex flex-col items-center justify-center gap-6">
        <div className="text-6xl">🃏</div>
        <h1 className="text-3xl font-black uppercase text-slate-400">
          Article not found
        </h1>
        <p className="text-slate-500 text-sm">
          The post you&apos;re looking for may have been removed or the link is broken.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white font-bold uppercase tracking-wider text-sm transition-colors"
          >
            ← Go Back
          </button>
          <Link
            href="/blogs"
            className="px-6 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold uppercase tracking-wider text-sm rounded-lg transition-all"
          >
            All Articles
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const readingTime = Math.ceil((blog.content?.replace(/<[^>]+>/g, "").length ?? 0) / 1000);

  // Parse [hand-replayer id="xxx"] shortcodes from content
  function renderContent(raw: string): React.ReactNode[] {
    const SHORTCODE_RE = /\[hand-replayer id="([^"]+)"\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = SHORTCODE_RE.exec(raw)) !== null) {
      // HTML chunk before this shortcode
      const before = raw.slice(lastIndex, match.index);
      if (before) {
        parts.push(
          <div
            key={`html-${lastIndex}`}
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-white
              prose-a:text-yellow-400 hover:prose-a:text-yellow-300
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-strong:text-white
              prose-li:text-slate-300
              prose-blockquote:border-yellow-500 prose-blockquote:text-slate-300 prose-blockquote:bg-white/5 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4
              prose-code:bg-white/10 prose-code:text-yellow-300 prose-code:rounded prose-code:px-1 prose-code:text-sm"
            dangerouslySetInnerHTML={{ __html: before }}
          />
        );
      }
      // Replayer embed
      parts.push(<PokerHandReplayer key={`replayer-${match[1]}`} handId={match[1]} />);
      lastIndex = match.index + match[0].length;
    }

    // Remaining HTML after last shortcode
    const tail = raw.slice(lastIndex);
    if (tail) {
      parts.push(
        <div
          key="html-tail"
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-white
            prose-a:text-yellow-400 hover:prose-a:text-yellow-300
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-strong:text-white
            prose-li:text-slate-300
            prose-blockquote:border-yellow-500 prose-blockquote:text-slate-300 prose-blockquote:bg-white/5 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4
            prose-code:bg-white/10 prose-code:text-yellow-300 prose-code:rounded prose-code:px-1 prose-code:text-sm"
          dangerouslySetInnerHTML={{ __html: tail }}
        />
      );
    }

    return parts;
  }

  return (
    <div className="min-h-screen bg-[#050B14] text-white">
      {/* Cinematic Hero */}
      <div className="relative w-full h-[55vh] min-h-[420px] flex items-end">
        <div className="absolute inset-0 bg-slate-900">
          {blog.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blog.thumbnail}
              alt={blog.title}
              className="w-full h-full object-cover opacity-40"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black" />
          )}
          {/* Multi-layer fade for cinematic look */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050B14]/60 via-transparent to-transparent" />
        </div>

        {/* Back button floating */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            ← Back to Articles
          </Link>
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-black uppercase tracking-wider rounded-md">
                {blog.category || "Strategy"}
              </span>
              {blog.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/10 text-slate-300 text-xs font-medium rounded-md border border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-5 leading-[1.05]">
              {blog.title}
            </h1>

            {/* Stats row */}
            <div className="flex items-center gap-5 text-sm text-slate-400 font-medium">
              <span>📅 {formattedDate}</span>
              <span>👁 {blog.views_count.toLocaleString()} views</span>
              {readingTime > 0 && <span>⏱ {readingTime} min read</span>}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article body */}
      <div className="w-full max-w-4xl mx-auto px-6 py-12">
        {/* Excerpt callout */}
        {blog.excerpt && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 pl-5 border-l-4 border-yellow-500/60 text-slate-300 text-lg italic leading-relaxed"
          >
            {blog.excerpt}
          </motion.div>
        )}

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {renderContent(blog.content || "<p>Content not available.</p>")}
        </motion.div>

        {/* Tags section */}
        {blog.tags && blog.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap gap-2"
          >
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider mr-2">
              Tags:
            </span>
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 text-xs font-medium rounded-full hover:border-yellow-500/40 hover:text-yellow-400 transition-all cursor-default"
              >
                #{tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* Play Now CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-20 p-10 rounded-3xl relative overflow-hidden bg-gradient-to-br from-blue-900/30 to-black border border-white/10 backdrop-blur-md text-center flex flex-col items-center"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />

          <h3 className="relative text-3xl font-black uppercase tracking-wide text-white mb-4">
            Apply this strategy at the tables today
          </h3>
          <p className="relative text-blue-300 mb-8 max-w-xl">
            Don&apos;t just read about it — test your skills against real players
            and prove your worth in our high-stakes rooms.
          </p>

          <Link href="/poker-game" className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-500" />
            <button className="relative px-12 py-5 bg-gradient-to-b from-[#FFF6B3] via-[#FFD84D] to-[#C79500] rounded-xl text-[#091321] font-black uppercase tracking-[0.25em] text-sm hover:-translate-y-1 transition-transform shadow-[0_0_40px_rgba(255,215,0,0.4)]">
              🎰 Play Now
            </button>
          </Link>
        </motion.div>

        {/* Bottom nav */}
        <div className="mt-12 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => router.back()}
            className="text-slate-500 hover:text-white font-bold uppercase tracking-wider text-sm transition-colors"
          >
            ← Previous
          </button>
          <Link
            href="/blogs"
            className="text-slate-500 hover:text-white font-bold uppercase tracking-wider text-sm transition-colors"
          >
            ← All articles
          </Link>
        </div>
      </div>
    </div>
  );
}
