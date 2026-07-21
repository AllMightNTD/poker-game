// src/components/modals/CreateArticleModal.tsx
"use client";
import { Hash, LayoutGrid, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface CreateArticleModalProps {
  onClose: () => void;
}

export const CreateArticleModal = ({ onClose }: CreateArticleModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Khóa cuộn trang khi mở modal - Tốt cho trải nghiệm người dùng
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[#102A43]/30 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_30px_100px_rgba(0,194,255,0.25)] overflow-hidden border border-[#BEEFFF] animate-in zoom-in-95 duration-300"
      >
        <div className="p-8">
          {/* Header - Semantic Header */}
          <header className="flex justify-between items-center mb-8">
            <h2
              id="modal-title"
              className="text-2xl font-black text-[#102A43] flex items-center gap-2"
            >
              Sowing Seeds of Knowledge{" "}
              <Sparkles
                className="text-[#00FFD1] animate-pulse"
                size={24}
                aria-hidden="true"
              />
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#F4FDFF] text-[#102A43]/30 hover:text-[#00C2FF] hover:bg-[#00C2FF]/10 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00C2FF]"
            >
              <X size={24} strokeWidth={3} />
            </button>
          </header>

          {/* Form Content - Sử dụng thẻ form để chuẩn ngữ nghĩa */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="article-title" className="sr-only">
                Article Title
                                            </label>
              <input
                id="article-title"
                name="title"
                autoFocus
                className="w-full text-2xl font-black border-none focus:ring-0 placeholder:text-[#102A43]/20 text-[#102A43] bg-transparent"
                placeholder="Brilliant article title..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="article-content" className="sr-only">
                Article Content
                                            </label>
              <textarea
                id="article-content"
                name="content"
                className="w-full h-48 border-none focus:ring-0 placeholder:text-[#102A43]/20 resize-none text-[#102A43]/80 font-bold text-lg leading-relaxed bg-transparent"
                placeholder="What do you want to inspire today?"
              />
            </div>

            {/* Tagging & Category Section */}
            <nav
              className="flex items-center gap-3 flex-wrap mb-10"
              aria-label="Article Options"
            >
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F4FDFF] rounded-2xl text-[11px] font-black text-[#00C2FF] border border-[#BEEFFF] hover:bg-[#00C2FF] hover:text-white transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#00C2FF]"
              >
                <Hash size={14} />
                Add Hashtag
                                            </button>
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-[11px] font-black text-[#102A43]/40 border border-[#BEEFFF] hover:border-[#00C2FF]/30 transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#00C2FF]"
              >
                <LayoutGrid size={14} />
                Select Category
                                            </button>
            </nav>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-[2] py-5 bg-gradient-to-r from-[#00C2FF] to-[#00AEEF] text-white rounded-[1.8rem] font-black text-lg shadow-lg shadow-[#00C2FF]/30 hover:shadow-[#00C2FF]/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 outline-none focus-visible:ring-4 focus-visible:ring-[#00FFD1]"
              >
                Publish Now ✨
                                            </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-5 bg-[#F4FDFF] text-[#102A43]/40 rounded-[1.8rem] font-black hover:bg-[#BEEFFF]/30 hover:text-[#102A43]/60 transition-all outline-none"
              >
                Later
                                            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
