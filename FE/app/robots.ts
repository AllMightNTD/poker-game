import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pkcg.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/backstage/",       // Chặn bot cào dữ liệu trang quản trị admin
          "/api/",             // Chặn bot cào các API endpoints cục bộ
          "/verify-otp",       // Chặn trang xác thực OTP nhạy cảm
          "/forgot-password",  // Chặn trang quên mật khẩu
          "/change-password",  // Chặn trang đổi mật khẩu
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
