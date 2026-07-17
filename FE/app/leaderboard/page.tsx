import { UserProvider } from "@/core/providers/user-provider";
import LeaderboardContent from "./LeaderboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng Xếp Hạng Cao Thủ Poker - Hall of Fame | PKCG",
  description: "Bảng xếp hạng cập nhật liên tục các game thủ Poker xuất sắc nhất tuần, tháng tại cổng game PKCG. Xem số ván thắng và tổng số chips thắng cược.",
  alternates: {
    canonical: "https://pkcg.com/leaderboard",
  },
  openGraph: {
    title: "Bảng Xếp Hạng Cao Thủ Poker - Hall of Fame | PKCG",
    description: "Bảng xếp hạng cập nhật liên tục các game thủ Poker xuất sắc nhất tuần, tháng tại cổng game PKCG.",
    url: "https://pkcg.com/leaderboard",
    type: "website",
  },
};

export default function LeaderboardPage() {
  return (
    <UserProvider>
      <LeaderboardContent />
    </UserProvider>
  );
}
