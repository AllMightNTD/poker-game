// src/components/feed/CreatePostMini.tsx
import { Sparkles } from "lucide-react";
import Image from "next/image"; // Import thẻ Image chuẩn Next.js
import { useTranslations } from "next-intl";

export const CreatePostMini = () => {
  const t = useTranslations("post");
  return (
    <section
      aria-label="Tạo bài viết nhanh"
      className="bg-white rounded-[2.5rem] p-5 shadow-[0_10px_40px_rgba(0,194,255,0.08)] border border-[#BEEFFF] mb-6"
    >
      <div className="flex items-center gap-4">
        {/* Avatar tối ưu với Next.js Image */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 relative rounded-2xl overflow-hidden border-2 border-[#00FFD1]/20 shadow-sm">
            <Image
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt={t("avatarAria")}
              fill
              sizes="48px"
              className="object-cover"
              priority // Ưu tiên load vì nằm ở đầu trang (Above the fold)
            />
          </div>
          {/* Trạng thái hoạt động */}
          <div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00FFD1] rounded-full border-2 border-white animate-pulse"
            aria-hidden="true"
          />
        </div>

        {/* Nút mở Modal - Chuyển thành button với thông tin rõ ràng */}
        <button
          aria-label={t("sharePromptAria")}
          className="flex-1 text-left bg-[#F4FDFF] hover:bg-[#00C2FF]/10 px-6 py-3.5 rounded-[1.8rem] text-[#00AEEF] font-black text-sm transition-all border border-transparent hover:border-[#00C2FF]/20 group flex items-center justify-between outline-none focus-visible:ring-2 focus-visible:ring-[#00C2FF]"
        >
          <span>{t("sharePrompt")}</span>
          <span
            className="group-hover:inline-block animate-bounce hidden text-lg"
            aria-hidden="true"
          >
            🚀
          </span>
        </button>

        {/* Nút Sparkles Action */}
        <button
          aria-label={t("sparklesAria")}
          className="bg-[#00C2FF] p-3.5 rounded-2xl text-white shadow-lg shadow-[#00C2FF]/40 hover:scale-110 hover:rotate-3 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00FFD1]"
        >
          <Sparkles size={20} fill="white" />
        </button>
      </div>
    </section>
  );
};
