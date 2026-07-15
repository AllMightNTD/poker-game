import { BlogList } from "@/features/blogs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cẩm Nang Chiến Thuật Poker & Tin Tức Mới Nhất | PKCG",
  description: "Tổng hợp các bài viết hướng dẫn luật chơi Poker, chiến thuật preflop, postflop nâng cao và tin tức giải đấu Poker hot nhất từ PKCG.",
  openGraph: {
    title: "Cẩm Nang Chiến Thuật Poker & Tin Tức Mới Nhất | PKCG",
    description: "Tổng hợp các bài viết hướng dẫn luật chơi Poker, chiến thuật preflop, postflop nâng cao và tin tức giải đấu Poker hot nhất từ PKCG.",
    type: "website",
  },
};

export default function BlogsPage() {
  return <BlogList />;
}
