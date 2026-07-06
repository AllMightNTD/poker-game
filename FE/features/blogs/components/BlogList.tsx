"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import httpClient from "@/core/api/http-client";

export function BlogList() {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      try {
        const res = await httpClient.get("/api/v1/blogs");
        return res.data.data;
      } catch (err) {
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#050B14] text-white selection:bg-yellow-500/30">
      {/* Hero Header */}
      <div className="relative py-20 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-5xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-6 drop-shadow-lg"
        >
          POKER <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">STRATEGIES</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative text-lg md:text-xl text-slate-400 max-w-2xl font-medium"
        >
          Master the game with exclusive insights, tournament news, and high-roller strategies.
        </motion.p>
      </div>

      {/* CTA Banner */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/40 to-slate-900/80 border border-blue-500/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
          
          <div>
            <h2 className="text-3xl font-black uppercase tracking-wide text-white mb-2">Ready to hit the tables?</h2>
            <p className="text-blue-300">Apply these strategies right now in our high-stakes rooms.</p>
          </div>
          
          <Link href="/poker-game" className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
            <button className="relative px-10 py-4 bg-gradient-to-b from-[#FFF6B3] via-[#FFD84D] to-[#C79500] rounded-xl text-slate-900 font-black uppercase tracking-[0.2em] text-sm hover:-translate-y-1 transition-transform shadow-[0_0_30px_rgba(255,215,0,0.3)]">
              Play Now
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blogs?.length === 0 ? (
          <div className="text-center text-slate-500 py-20">No articles found. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs?.map((blog: any, i: number) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
              >
                <Link href={`/blogs/${blog.slug}`} className="group block h-full">
                  <div className="h-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-yellow-500/50 hover:shadow-[0_10px_40px_rgba(255,215,0,0.1)] hover:-translate-y-2 flex flex-col">
                    {/* Thumbnail placeholder or actual image */}
                    <div className="h-48 bg-slate-800 relative overflow-hidden flex-shrink-0">
                      {blog.thumbnail ? (
                        <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black opacity-80" />
                      )}
                      
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-yellow-500/90 text-black text-xs font-black uppercase tracking-wider rounded-md shadow-md backdrop-blur-md">
                          {blog.category || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-yellow-400 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                        {blog.excerpt || "Click to read more about this exciting topic and master your skills."}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-medium text-slate-500">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-bold text-yellow-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          READ MORE <span>→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
