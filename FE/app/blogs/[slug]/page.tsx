import { BlogDetail } from "@/features/blogs";
import { Metadata } from "next";
import axios from "axios";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  try {
    // Gọi API danh sách bài viết bằng URL tuyệt đối
    const res = await axios.get(`${apiBase}/api/v1/blogs/admin/all?limit=50`, {
      timeout: 5000,
    });
    const blogs = res.data?.data ?? [];
    const blog = blogs.find((b: any) => b.slug === slug);

    if (!blog) {
      return {
        title: "Bài viết không tồn tại | PKCG",
      };
    }

    const title = `${blog.title} - Cẩm nang Poker | PKCG`;
    const description = blog.excerpt || `Đọc bài viết ${blog.title} tại PKCG để nâng cao kiến thức chơi game bài Poker.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: blog.thumbnail ? [{ url: blog.thumbnail }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: blog.thumbnail ? [blog.thumbnail] : [],
      },
    };
  } catch (error) {
    console.error("Failed to generate blog detail metadata:", error);
    return {
      title: "Bài viết Poker | PKCG",
      description: "Tin tức chiến thuật, cẩm nang và hướng dẫn chơi Poker đỉnh cao tại PKCG.",
    };
  }
}

export default function BlogDetailPage() {
  return <BlogDetail />;
}
