import { LoginForm } from "@/features/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In Poker Account - PKCG",
  description: "Log in to the PKCG gaming portal to join top-tier Texas Hold'em and Omaha tables with thousands of other players.",
  alternates: {
    canonical: "https://pkcg.com/login",
  },
  openGraph: {
    title: "Log In Poker Account - PKCG",
    description: "Log in to the PKCG gaming portal to join top-tier Texas Hold'em and Omaha tables.",
    url: "https://pkcg.com/login",
    type: "website",
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
