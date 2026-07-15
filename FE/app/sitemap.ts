import axios from "axios";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pkcg.com";
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Các route tĩnh mặc định
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), changeFrequency: "always", priority: 0.9 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await axios.get(`${apiBase}/api/v1/blogs/admin/all?limit=100`, {
      timeout: 5000,
    });
    const blogs = res.data?.data ?? [];

    blogRoutes = blogs.map((blog: any) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: new Date(blog.updated_at || blog.created_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to fetch dynamic blogs for sitemap:", error);
  }

  return [...staticRoutes, ...blogRoutes];
}
