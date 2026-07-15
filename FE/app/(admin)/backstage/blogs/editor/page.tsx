"use client";

import { FormInput, FormTextArea } from "@/components/ui/form";
import httpClient from "@/core/api/http-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

const CATEGORIES = ["Strategy", "Tournament", "News", "Lifestyle"];

const blogFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  excerpt: z.string().optional().or(z.literal("")),
  thumbnail: z.string().optional().or(z.literal("")),
  category: z.string(),
  tags: z.string().optional().or(z.literal("")),
  content: z.string().min(1, "Nội dung không được để trống"),
  is_published: z.boolean(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const INITIAL: BlogFormValues = {
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

  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: INITIAL,
    mode: "onChange",
  });

  // Watch form fields for custom rendering/interactions
  const titleValue = useWatch({ control, name: "title" }) || "";
  const contentValue = useWatch({ control, name: "content" }) || "";
  const thumbnailValue = useWatch({ control, name: "thumbnail" }) || "";
  const categoryValue = useWatch({ control, name: "category" }) || "Strategy";
  const isPublishedValue = useWatch({ control, name: "is_published" }) ?? true;

  // 2. Sync form to fetched data when available
  const derivedInitial = useMemo<BlogFormValues>(() => {
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

  useEffect(() => {
    if (existingBlog) {
      reset(derivedInitial);
    }
  }, [existingBlog, derivedInitial, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      const payload = {
        title: data.title.trim(),
        excerpt: data.excerpt?.trim() || undefined,
        thumbnail: data.thumbnail?.trim() || undefined,
        category: data.category,
        tags: data.tags
          ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
          : [],
        content: data.content.trim(),
        is_published: data.is_published,
      };

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

  const onSubmit = (data: BlogFormValues) => {
    saveMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors cursor-pointer"
            id="btn-toggle-preview"
          >
            {preview ? <EyeOff size={15} /> : <Eye size={15} />}
            {preview ? "Editor" : "Preview"}
          </button>

          <button
            type="submit"
            disabled={!isValid || saveMutation.isPending || saved || isSubmitting}
            id="btn-save-blog"
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-bold rounded-lg text-sm transition-all cursor-pointer disabled:cursor-not-allowed"
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
          {preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[500px] bg-slate-900 border border-slate-700 rounded-xl p-6 prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: titleValue || "<p class='text-slate-600'>Preview sẽ hiển thị ở đây...</p>" }}
            />
          ) : (
            <FormInput
              id="blog-title"
              placeholder="Tiêu đề bài viết..."
              error={errors.title?.message}
              className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-lg font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-500/60 focus:ring-0 transition-colors"
              {...register("title")} />
          )}


          {preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[500px] bg-slate-900 border border-slate-700 rounded-xl p-6 prose prose-invert prose-sm max-w-none
                prose-headings:font-black prose-headings:uppercase prose-headings:text-white
                prose-a:text-yellow-400 prose-p:text-slate-300 prose-strong:text-white
                prose-code:bg-white/10 prose-code:text-yellow-300 prose-code:rounded prose-code:px-1"
              dangerouslySetInnerHTML={{ __html: contentValue || "<p class='text-slate-600'>Preview sẽ hiển thị ở đây...</p>" }}
            />
          ) : (
            <FormTextArea
              id="blog-content"
              placeholder={`Nội dung bài viết (HTML được hỗ trợ)...\n\nVí dụ nhúng trình phát lại ván bài:\n[hand-replayer id="123456789"]`}
              rows={22}
              error={errors.content?.message}
              className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-yellow-500/60 resize-y transition-colors font-mono leading-relaxed"
              {...register("content")}
            />
          )}
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          {/* Publish control */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Xuất bản</h3>
            <button
              type="button"
              onClick={() => setValue("is_published", !isPublishedValue, { shouldValidate: true })}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm font-medium cursor-pointer ${isPublishedValue
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-slate-700 bg-slate-800 text-slate-500"
                }`}
              id="btn-toggle-published"
            >
              <span className="flex items-center gap-2">
                {isPublishedValue ? <Eye size={14} /> : <EyeOff size={14} />}
                {isPublishedValue ? "Công khai" : "Nháp"}
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
                  type="button"
                  onClick={() => setValue("category", cat, { shouldValidate: true })}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${categoryValue === cat
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
            <FormInput
              id="blog-tags"
              placeholder="preflop, bluff, strategy..."
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-yellow-500/40"
              error={errors.tags?.message}
              {...register("tags")}
            />
            <p className="text-slate-700 text-[10px] mt-1.5">Cách nhau bằng dấu phẩy</p>
          </div>

          {/* Thumbnail */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ảnh bìa (URL)</h3>
            <FormInput
              id="blog-thumbnail"
              placeholder="https://images.unsplash.com/..."
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-yellow-500/40"
              error={errors.thumbnail?.message}
              {...register("thumbnail")}
            />
            {thumbnailValue && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailValue}
                alt="thumbnail preview"
                className="mt-3 w-full h-32 object-cover rounded-lg opacity-70"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tóm tắt (excerpt)</h3>
            <FormTextArea
              id="blog-excerpt"
              placeholder="Mô tả ngắn gọn về bài viết..."
              rows={3}
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-yellow-500/40 resize-none"
              error={errors.excerpt?.message}
              {...register("excerpt")}
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
    </form>
  );
}
