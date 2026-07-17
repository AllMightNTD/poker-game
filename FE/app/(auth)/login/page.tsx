import { LoginForm } from "@/features/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập Tài Khoản Poker - PKCG",
  description: "Đăng nhập cổng game PKCG để tham gia các bàn đấu Texas Hold'em, Omaha đỉnh cao cùng hàng ngàn người chơi khác.",
  alternates: {
    canonical: "https://pkcg.com/login",
  },
  openGraph: {
    title: "Đăng Nhập Tài Khoản Poker - PKCG",
    description: "Đăng nhập cổng game PKCG để tham gia các bàn đấu Texas Hold'em, Omaha đỉnh cao.",
    url: "https://pkcg.com/login",
    type: "website",
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
