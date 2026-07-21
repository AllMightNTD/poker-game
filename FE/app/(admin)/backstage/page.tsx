import { redirect } from "next/navigation";

export default function BackstageIndexPage() {
  // Chuyển hướng người dùng từ /backstage sang /backstage/dashboard
  redirect("/backstage/dashboard");
}
