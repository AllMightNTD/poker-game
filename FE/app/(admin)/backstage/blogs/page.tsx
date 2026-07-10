"use client";

import httpClient from "@/core/api/http-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenSquare,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  BookOpen,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  views_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

async function fetchAdminBlogs(cursor?: string, category?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (category) params.set("category", category);
  params.set("limit", "20");
  const res = await httpClient.get(`/api/v1/blogs/admin/all?${params}`);
  return res.data as { data: BlogPost[]; meta: { has_next_page: boolean; next_cursor: string | null } };
}

export default function AdminBlogsPage() {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-blogs", cursor, category],
    queryFn: () => fetchAdminBlogs(cursor, category),
  });

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle publish status
  const togglePublish = useMutation({
    mutationFn: async (blog: BlogPost) => {
      await httpClient.put(`/api/v1/blogs/admin/${blog.id}`, {
        is_published: !blog.is_published,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      showToast("Đã cập nhật trạng thái xuất bản", "success");
    },
    onError: () => showToast("Cập nhật thất bại", "error"),
  });

  // Delete blog
  const deleteBlog = useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/api/v1/blogs/admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      setDeleteTarget(null);
      showToast("Đã xóa bài viết", "success");
    },
    onError: () => showToast("Xóa thất bại", "error"),
  });

  const blogs = data?.data ?? [];
  const filtered = search
    ? blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.category.toLowerCase().includes(search.toLowerCase())
      )
    : blogs;

  const CATEGORIES = ["Strategy", "Tournament", "News", "Lifestyle"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen size={22} className="text-yellow-400" />
            Quản lý bài viết Blog
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tạo, biên tập và quản lý nội dung chiến thuật Poker.
          </p>
        </div>
        <Link
          href="/backstage/blogs/editor"
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition-all"
          id="btn-new-blog"
        >
          <Plus size={16} />
          Bài viết mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="blog-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bài viết..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-yellow-500/60"
          />
        </div>
        <select
          id="blog-category-filter"
          value={category ?? ""}
          onChange={(e) => { setCursor(undefined); setCategory(e.target.value || undefined); }}
          className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-yellow-500/60"
        >
          <option value="">Tất cả danh mục</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => refetch()}
          className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="Làm mới"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-600 animate-pulse">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-600">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có bài viết nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4">Tiêu đề</th>
                <th className="text-left py-3 px-4">Danh mục</th>
                <th className="text-center py-3 px-4">Lượt xem</th>
                <th className="text-center py-3 px-4">Trạng thái</th>
                <th className="text-left py-3 px-4">Ngày tạo</th>
                <th className="text-right py-3 px-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((blog, i) => (
                  <motion.tr
                    key={blog.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 line-clamp-1 max-w-xs">
                        {blog.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                        {blog.slug}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded-md">
                        {blog.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">
                      {blog.views_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => togglePublish.mutate(blog)}
                        disabled={togglePublish.isPending}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          blog.is_published
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-slate-700 text-slate-500 hover:bg-slate-600"
                        }`}
                      >
                        {blog.is_published ? (
                          <><Eye size={11} /> Published</>
                        ) : (
                          <><EyeOff size={11} /> Draft</>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/backstage/blogs/editor?id=${blog.id}`}
                          className="p-1.5 text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <PenSquare size={14} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(blog)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data?.meta.has_next_page && (
        <div className="text-center">
          <button
            onClick={() => setCursor(data.meta.next_cursor ?? undefined)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
          >
            Tải thêm →
          </button>
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Trash2 size={20} className="text-red-400" />
                Xác nhận xóa
              </div>
              <p className="text-slate-400 text-sm mb-1">
                Bạn sắp xóa bài viết:
              </p>
              <p className="text-slate-200 font-medium mb-6 line-clamp-2">
                &ldquo;{deleteTarget.title}&rdquo;
              </p>
              <p className="text-red-400/80 text-xs mb-6">
                ⚠️ Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => deleteBlog.mutate(deleteTarget.id)}
                  disabled={deleteBlog.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {deleteBlog.isPending ? "Đang xóa..." : "Xóa vĩnh viễn"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
