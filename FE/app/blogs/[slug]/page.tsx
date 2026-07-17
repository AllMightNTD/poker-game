import { Suspense } from "react";
import { BlogDetail, BlogDetailSkeleton } from "@/features/blogs";
import type { Metadata } from "next";
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
    const blogs = (res.data?.data ?? []) as Array<{ slug: string; title: string; excerpt?: string; thumbnail?: string }>;
    const blog = blogs.find((b) => b.slug === slug);

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
      alternates: {
        canonical: `https://pkcg.com/blogs/${slug}`,
      },
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
      alternates: {
        canonical: "https://pkcg.com/blogs",
      },
    };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  let blog: { title: string; thumbnail?: string; created_at: string; updated_at?: string; excerpt?: string } | null = null;
  try {
    const res = await axios.get(`${apiBase}/api/v1/blogs/admin/all?limit=50`, {
      timeout: 5000,
    });
    const blogs = (res.data?.data ?? []) as Array<{ slug: string; title: string; thumbnail?: string; created_at: string; updated_at?: string; excerpt?: string }>;
    blog = blogs.find((b) => b.slug === slug) ?? null;
  } catch (error) {
    console.error("Failed to fetch blog for schema:", error);
  }

  const jsonLd = blog ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.thumbnail ? [blog.thumbnail] : [],
    "datePublished": blog.created_at,
    "dateModified": blog.updated_at || blog.created_at,
    "author": [{
      "@type": "Person",
      "name": "PKCG Expert",
      "url": "https://pkcg.com"
    }],
    "description": blog.excerpt || blog.title,
    "publisher": {
      "@type": "Organization",
      "name": "PKCG",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pkcg.com/favicon.ico"
      }
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Suspense fallback={<BlogDetailSkeleton />}>
        <BlogDetail />
      </Suspense>
    </>
  );
}
