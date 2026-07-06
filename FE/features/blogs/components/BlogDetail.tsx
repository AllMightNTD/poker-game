"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import httpClient from "@/core/api/http-client";

export function BlogDetail() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      try {
        const res = await httpClient.get(`/api/v1/blogs/${slug}`);
        return res.data;
      } catch (err) {
        return null;
      }
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050B14] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#050B14] text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black uppercase text-slate-400 mb-4">Blog not found</h1>
        <Link href="/blogs" className="text-yellow-500 hover:underline">← Back to Blogs</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B14] text-white">
      {/* Article Header */}
      <div className="relative w-full h-[50vh] min-h-[400px] flex items-end">
        <div className="absolute inset-0 bg-slate-900">
          {blog.thumbnail ? (
            <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-black uppercase tracking-wider rounded-md">
                {blog.category || "Strategy"}
              </span>
              <span className="text-slate-400 text-sm font-medium">
                {new Date(blog.created_at).toLocaleDateString()}
              </span>
              <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                👁 {blog.views_count || 0}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4 leading-tight">
              {blog.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Article Content */}
      <div className="w-full max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-yellow-500 hover:prose-a:text-yellow-400 prose-p:text-slate-300"
          dangerouslySetInnerHTML={{ __html: blog.content || "<p>Content not available.</p>" }}
        />
        
        {/* Play Now CTA Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-10 rounded-3xl relative overflow-hidden bg-gradient-to-br from-blue-900/30 to-black border border-white/10 backdrop-blur-md text-center flex flex-col items-center"
        >
          <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <h3 className="relative text-3xl font-black uppercase tracking-wide text-white mb-4">
            Apply this strategy at the tables today
          </h3>
          <p className="relative text-blue-300 mb-8 max-w-xl">
            Don't just read about it. Test your skills against real players and prove your worth in our high-stakes rooms.
          </p>
          
          <Link href="/poker-game" className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-500"></div>
            <button className="relative px-12 py-5 bg-gradient-to-b from-[#FFF6B3] via-[#FFD84D] to-[#C79500] rounded-xl text-[#091321] font-black uppercase tracking-[0.25em] text-sm hover:-translate-y-1 transition-transform shadow-[0_0_40px_rgba(255,215,0,0.4)]">
              Play Now
            </button>
          </Link>
        </motion.div>

        <div className="mt-12 text-center">
          <Link href="/blogs" className="text-slate-500 hover:text-white font-bold uppercase tracking-wider text-sm transition-colors">
            ← Back to all articles
          </Link>
        </div>
      </div>
    </div>
  );
}
