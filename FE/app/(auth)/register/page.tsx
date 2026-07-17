import RegisterClient from "./RegisterClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký Tài Khoản Chơi Poker Nhận Chips Miễn Phí | PKCG",
  description: "Đăng ký ngay tài khoản PKCG để nhận chips miễn phí hàng ngày. Tham gia cộng đồng Poker uy tín hàng đầu Việt Nam và tranh tài cùng hàng ngàn game thủ.",
  alternates: {
    canonical: "https://pkcg.com/register",
  },
  openGraph: {
    title: "Đăng Ký Tài Khoản Chơi Poker Nhận Chips Miễn Phí | PKCG",
    description: "Đăng ký ngay tài khoản PKCG để nhận chips miễn phí hàng ngày. Tham gia cộng đồng Poker uy tín hàng đầu Việt Nam.",
    url: "https://pkcg.com/register",
    type: "website",
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}