"use client";

import httpClient from "@/core/api/http-client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const CATEGORIES = ["Strategy", "Tournament", "News", "Lifestyle"];

interface FormState {
  title: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  tags: string;
  content: string;
  is_published: boolean;
}

const INITIAL: FormState = {
  title: "",
  excerpt: "",
  thumbnail: "",
  category: "Strategy",
  tags: "",
  content: "",
  is_published: true,
};

export default function AdminBlogEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = !!editId;

  // 1. Fetch existing blog data when editing
  const { data: existingBlog } = useQuery({
    queryKey: ["admin-blog-edit", editId],
    queryFn: async () => {
      const res = await httpClient.get(`/api/v1/blogs/admin/all?limit=50`);
      const blogs = res.data?.data ?? [];
      return blogs.find((b: { id: string }) => b.id === editId) ?? null;
    },
    enabled: isEditing,
  });

  // 2. Derive form default from fetched blog (avoids setState-in-effect lint error)
  const derivedInitial = useMemo<FormState>(() => {
    if (!existingBlog) return INITIAL;
    return {
      title: existingBlog.title ?? "",
      excerpt: existingBlog.excerpt ?? "",
      thumbnail: existingBlog.thumbnail ?? "",
      category: existingBlog.category ?? "Strategy",
      tags: (existingBlog.tags ?? []).join(", "),
      content: existingBlog.content ?? "",
      is_published: existingBlog.is_published ?? true,
    };
  }, [existingBlog]);

  // 3. Local UI state — sync once when derivedInitial becomes non-empty
  const [form, setForm] = useState<FormState>(INITIAL);
  const [synced, setSynced] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form to fetched data exactly once (render-phase conditional call — safe per React rules)
  if (existingBlog && !synced) {
    setForm(derivedInitial);
    setSynced(true);
  }

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const buildPayload = () => ({
    title: form.title.trim(),
    excerpt: form.excerpt.trim() || undefined,
    thumbnail: form.thumbnail.trim() || undefined,
    category: form.category,
    tags: form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    content: form.content.trim(),
    is_published: form.is_published,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (isEditing) {
        await httpClient.put(`/api/v1/blogs/admin/${editId}`, payload);
      } else {
        await httpClient.post("/api/v1/blogs/admin", payload);
      }
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => {
        router.push("/backstage/blogs");
      }, 1000);
    },
  });

  const isValid = form.title.trim().length > 0 && form.content.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/backstage/blogs"
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">
              {isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
            </h1>
            <p className="text-slate-600 text-xs mt-0.5">
              Nội dung hỗ trợ HTML và shortcode{" "}
              <code className="text-yellow-500/80">[hand-replayer id=&quot;HAND_ID&quot;]</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
            id="btn-toggle-preview"
          >
            {preview ? <EyeOff size={15} /> : <Eye size={15} />}
            {preview ? "Editor" : "Preview"}
          </button>

          <button
            onClick={() => saveMutation.mutate()}
            disabled={!isValid || saveMutation.isPending || saved}
            id="btn-save-blog"
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-bold rounded-lg text-sm transition-all"
          >
            {saveMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : saved ? (
              "✅ Đã lưu!"
            ) : (
              <>
                <Save size={15} />
                {isEditing ? "Lưu thay đổi" : "Xuất bản"}
              </>
            )}
          </button>
        </div>
      </div>

      {saveMutation.isError && (
        <div className="p-3 bg-red-900/30 border border-red-700/40 rounded-lg text-red-400 text-sm">
          ⚠️ Lưu thất bại. Kiểm tra kết nối và thử lại.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-4">
          <input
            id="blog-title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Tiêu đề bài viết..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-lg font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-500/60 transition-colors"
          />

          {preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[500px] bg-slate-900 border border-slate-700 rounded-xl p-6 prose prose-invert prose-sm max-w-none
                prose-headings:font-black prose-headings:uppercase prose-headings:text-white
                prose-a:text-yellow-400 prose-p:text-slate-300 prose-strong:text-white
                prose-code:bg-white/10 prose-code:text-yellow-300 prose-code:rounded prose-code:px-1"
              dangerouslySetInnerHTML={{ __html: form.content || "<p class='text-slate-600'>Preview sẽ hiển thị ở đây...</p>" }}
            />
          ) : (
            <textarea
              id="blog-content"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder={`Nội dung bài viết (HTML được hỗ trợ)...\n\nVí dụ nhúng trình phát lại ván bài:\n[hand-replayer id="123456789"]`}
              rows={22}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-yellow-500/60 resize-y transition-colors font-mono leading-relaxed"
            />
          )}
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          {/* Publish control */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Xuất bản</h3>
            <button
              onClick={() => set("is_published", !form.is_published)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm font-medium ${
                form.is_published
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-slate-700 bg-slate-800 text-slate-500"
              }`}
              id="btn-toggle-published"
            >
              <span className="flex items-center gap-2">
                {form.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                {form.is_published ? "Công khai" : "Nháp"}
              </span>
              <span className="text-xs opacity-70">click để đổi</span>
            </button>
          </div>

          {/* Category */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Danh mục</h3>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => set("category", cat)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    form.category === cat
                      ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                      : "border-slate-700 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tags</h3>
            <input
              id="blog-tags"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="preflop, bluff, strategy..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-yellow-500/40"
            />
            <p className="text-slate-700 text-xs mt-1.5">Cách nhau bằng dấu phẩy</p>
          </div>

          {/* Thumbnail */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ảnh bìa (URL)</h3>
            <input
              id="blog-thumbnail"
              value={form.thumbnail}
              onChange={(e) => set("thumbnail", e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-yellow-500/40"
            />
            {form.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.thumbnail}
                alt="thumbnail preview"
                className="mt-3 w-full h-32 object-cover rounded-lg opacity-70"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tóm tắt (excerpt)</h3>
            <textarea
              id="blog-excerpt"
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Mô tả ngắn gọn về bài viết..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-yellow-500/40 resize-none"
            />
          </div>

          {/* Shortcode helper */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">🃏 Shortcode Replayer</h3>
            <p className="text-xs text-slate-500 mb-2">Chèn vào content để nhúng trình phát ván bài:</p>
            <code className="block bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-yellow-300 font-mono select-all">
              {`[hand-replayer id="HAND_ID"]`}
            </code>
            <p className="text-xs text-slate-600 mt-2">Thay HAND_ID bằng ID ván bài từ Admin &gt; Lịch sử ván bài.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
