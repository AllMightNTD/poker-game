import { UserProvider } from "@/core/providers/user-provider";
import LeaderboardContent from "./LeaderboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poker Masters Leaderboard - Hall of Fame | PKCG",
  description: "Leaderboard continuously updating the best Poker players of the week and month on PKCG. View wins and total chips won.",
  alternates: {
    canonical: "https://pkcg.com/leaderboard",
  },
  openGraph: {
    title: "Poker Masters Leaderboard - Hall of Fame | PKCG",
    description: "Leaderboard continuously updating the best Poker players of the week and month on PKCG.",
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
