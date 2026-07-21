"use client";

import { FormButton } from "@/components/ui/form";
import { RHFInput, RHFTextArea } from "@/components/ui/form/RhfFields";
import httpClient from "@/core/api/http-client";
import { PokerHandPickerModal, PokerHandReplayer } from "@/features/blogs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { clsx } from "clsx"; // Giả sử bạn có tiện ích này, nếu không hãy thay bằng chuỗi template
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, FileText, Image as ImageIcon, Layers3, Save, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

const CATEGORIES = ["Strategy", "Tournament", "News", "Lifestyle"];

const blogFormSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  excerpt: z.string().max(100, "Excerpt cannot exceed 100 characters").optional().or(z.literal("")),
  thumbnail: z.string().optional().or(z.literal("")),
  category: z.string(),
  tags: z.string().optional().or(z.literal("")),
  content: z.string().min(1, "Content cannot be empty"),
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

// Component helper cho title section trong sidebar card
const SidebarCardTitle = ({ icon: Icon, children }: { icon: React.ElementType, children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/50">
    <Icon className="size-4 text-slate-500" />
    <h3 className="text-sm font-semibold text-slate-300 tracking-tight">{children}</h3>
  </div>
);

export default function AdminBlogEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = !!editId;

  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: INITIAL,
    mode: "onChange",
  });

  const contentValue = useWatch({ control, name: "content" }) || "";
  const titleValue = useWatch({ control, name: "title" }) || "";
  const thumbnailValue = useWatch({ control, name: "thumbnail" }) || "";
  const categoryValue = useWatch({ control, name: "category" }) || "Strategy";
  const isPublishedValue = useWatch({ control, name: "is_published" }) ?? true;

  const insertHandReplayer = (handId: string) => {
    const textarea = document.getElementById("blog-content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const shortcode = `[hand-replayer id="${handId}"]`;

    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newValue = before + shortcode + after;
    setValue("content", newValue, { shouldValidate: true });

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + shortcode.length;
    }, 50);

    setIsPickerOpen(false);
  };

  function renderPreviewContent(raw: string): React.ReactNode[] {
    const SHORTCODE_RE = /\[hand-replayer id="([^"]+)"\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const proseClasses = clsx(
      "prose prose-invert prose-sm max-w-none",
      "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white",
      "prose-a:text-yellow-400 prose-a:no-underline hover:prose-a:underline",
      "prose-p:text-slate-300 prose-p:leading-relaxed",
      "prose-strong:text-white prose-strong:font-semibold",
      "prose-code:bg-slate-800 prose-code:text-yellow-300 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-[''] prose-code:after:content-['']",
      "prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-300"
    );

    while ((match = SHORTCODE_RE.exec(raw)) !== null) {
      const before = raw.slice(lastIndex, match.index);
      if (before) {
        parts.push(
          <div
            key={`html-${lastIndex}`}
            className={proseClasses}
            dangerouslySetInnerHTML={{ __html: before }}
          />
        );
      }
      parts.push(
        <div key={`replayer-${match[1]}`} className="my-6 border border-slate-700 rounded-xl overflow-hidden bg-black/20 p-2">
          <PokerHandReplayer handId={match[1]} />
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    const tail = raw.slice(lastIndex);
    if (tail) {
      parts.push(
        <div
          key="html-tail"
          className={proseClasses}
          dangerouslySetInnerHTML={{ __html: tail }}
        />
      );
    }

    return parts;
  }

  const { data: existingBlog } = useQuery({
    queryKey: ["admin-blog-edit", editId],
    queryFn: async () => {
      const res = await httpClient.get(`/api/v1/blogs/admin/all?limit=50`);
      const blogs = res.data?.data ?? [];
      return blogs.find((b: { id: string }) => b.id === editId) ?? null;
    },
    enabled: isEditing,
  });

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
        tags: data.tags?.split(",").map((t) => t.trim()).filter(Boolean) || [],
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
      setTimeout(() => router.push("/backstage/blogs"), 1000);
    },
  });

  const onSubmit = (data: BlogFormValues) => saveMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-[1600px] mx-auto pb-10">
      {/* Header - Phân chia khoảng cách rõ ràng, căn chỉnh tốt hơn */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-800 flex-wrap">
        <div className="flex items-center gap-4">
          <Link
            href="/backstage/blogs"
            className="size-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800 hover:border-slate-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-50 tracking-tight">
              {isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Quản lý nội dung bài viết, hỗ trợ HTML và Poker Shortcode.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className={clsx(
              "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border",
              preview
                ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400"
                : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
            )}
          >
            {preview ? <FileText size={16} /> : <Eye size={16} />}
            {preview ? "Back" : "Preview"}
          </button>

          <FormButton
            type="submit"
            disabled={saveMutation.isPending || saved || isSubmitting}
            isLoading={saveMutation.isPending}
            variant="contained"
            color="primary"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl !bg-yellow-500 hover:!bg-yellow-400 !text-black h-auto"
          >
            {saved ? (
              "Saved!"
            ) : (
              <>
                <Save size={16} className="mr-0.5" />
                {isEditing ? "Save changes" : "Publish now"}
              </>
            )}
          </FormButton>
        </div>
      </div>

      {saveMutation.isError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-950 border border-red-800 rounded-xl text-red-300 text-sm flex items-center gap-3"
        >
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-semibold">Failed to save</p>
            <p className="text-xs opacity-80">Error saving blog. Please try again later.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,380px] gap-8">
        {/* Main content area - Tập trung vào trải nghiệm viết */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                  <h1 className="text-4xl font-extrabold text-slate-50 tracking-tighter mb-8 pb-4 border-b border-slate-800">
                    {titleValue || "Tiêu đề bài viết sẽ hiển thị ở đây"}
                  </h1>
                  <div className="min-h-[600px]">
                    {renderPreviewContent(contentValue || "<p class='text-slate-500 italic'>Nội dung xem trước sẽ hiển thị ở đây. Hãy nhập nội dung vào tab Editor.</p>")}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="mb-8">
                  <RHFInput
                    control={control}
                    name="title"
                    placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
                    error={errors.title?.message}
                    className="px-6 py-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition-all shadow-inner"
                  />
                </div>

                <div className="relative bg-slate-900 border border-slate-800 rounded-2xl focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500/20 transition-all shadow-inner">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 z-10">
                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[11px] font-mono text-slate-400">HTML Supported</span>
                  </div>
                  <RHFTextArea
                    control={control}
                    name="content"
                    id="blog-content"
                    placeholder={`Bắt đầu viết nội dung bài viết tại đây...\n\nSử dụng HTML để định dạng. Để nhúng trình phát lại ván bài, hãy sử dụng nút "Chọn ván bài" bên phải hoặc gõ shortcode:\n[hand-replayer id="MÃ_VÁN_BÀI"]`}
                    rows={28}
                    error={errors.content?.message}
                    className="px-6 py-5 bg-transparent border-none rounded-2xl text-[15px] text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-0 resize-y transition-colors font-mono leading-relaxed"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar settings - Tổ chức lại thành các Card rõ ràng */}
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          {/* Publish & Category Card combined for better space */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <SidebarCardTitle icon={Settings}>Status & Category</SidebarCardTitle>

            <div className="space-y-5">
              {/* Publish toggle stylized as segment control */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-2 block">Status</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setValue("is_published", false)}
                    className={clsx("flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                      !isPublishedValue ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-100")}
                  >
                    <EyeOff size={14} /> Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("is_published", true)}
                    className={clsx("flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                      isPublishedValue ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-emerald-400")}
                  >
                    <Eye size={14} /> Public
                  </button>
                </div>
              </div>

              {/* Category selector stylized as tags */}
              <div>
                <label className="text-xs text-slate-500 font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue("category", cat, { shouldValidate: true })}
                      className={clsx(
                        "py-1.5 px-4 rounded-full text-xs font-medium border transition-all cursor-pointer",
                        categoryValue === cat
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-400 shadow-sm"
                          : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-100 hover:bg-slate-700"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Card (Tags & Thumbnail) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <SidebarCardTitle icon={Layers3}>Metadata & Hiển thị</SidebarCardTitle>

            <div className="space-y-4">
              <RHFInput
                control={control}
                name="tags"
                label="Thẻ (Tags)"
                placeholder="Ví dụ: preflop, bluff, tour..."
                className="bg-slate-800 border-slate-700 rounded-xl focus:border-yellow-500/50 focus:ring-yellow-500/10"
                error={errors.tags?.message}
              />

              <div className="border-t border-slate-800/50 pt-4">
                <RHFInput
                  control={control}
                  name="thumbnail"
                  label="Đường dẫn ảnh bìa (URL)"
                  placeholder="https://example.com/image.jpg"
                  className="bg-slate-800 border-slate-700 rounded-xl focus:border-yellow-500/50 focus:ring-yellow-500/10"
                  error={errors.thumbnail?.message}
                />

                <AnimatePresence>
                  {thumbnailValue && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 rounded-xl border border-slate-700 overflow-hidden bg-black/20 aspect-[16/9] flex items-center justify-center relative group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailValue}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement?.classList.add('bg-slate-800');
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="text-white/70" size={24} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Excerpt Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <SidebarCardTitle icon={FileText}>Mô tả ngắn (Excerpt)</SidebarCardTitle>
            <RHFTextArea
              control={control}
              name="excerpt"
              placeholder="Viết một đoạn tóm tắt ngắn gọn thu hút người đọc..."
              rows={4}
              className="bg-slate-800 border-slate-700 rounded-xl focus:border-yellow-500/50 focus:ring-yellow-500/10 resize-none text-sm leading-relaxed"
              error={errors.excerpt?.message}
            />
          </div>

          {/* Shortcode helper Card - Làm nổi bật hơn */}
          <div className="bg-slate-900 border-2 border-dashed border-blue-900/70 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-8 flex items-center justify-center rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                <Sparkles size={18} />
              </div>
              <h3 className="text-sm font-semibold text-blue-300 tracking-tight">Poker Hand Replayer</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Use this tool to insert a visual poker hand player into the article.
            </p>

            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md mb-4"
            >
              🃏 Poker Hand Replayer
            </button>

            <div className="relative group">
              <code className="block bg-black/30 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-yellow-300 font-mono select-all break-all leading-normal">
                [hand-replayer id=&quot;HAND_ID&quot;]
              </code>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Click để copy mã mẫu</span>
            </div>
          </div>
        </div>
      </div>

      <PokerHandPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={insertHandReplayer}
      />
    </form>
  );
}