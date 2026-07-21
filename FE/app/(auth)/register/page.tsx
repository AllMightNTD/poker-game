import RegisterClient from "./RegisterClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Poker Account to Receive Free Chips | PKCG",
  description: "Register a PKCG account now to receive free daily chips. Join Vietnam's leading reputable poker community and compete with thousands of players.",
  alternates: {
    canonical: "https://pkcg.com/register",
  },
  openGraph: {
    title: "Register Poker Account to Receive Free Chips | PKCG",
    description: "Register a PKCG account now to receive free daily chips. Join Vietnam's leading reputable poker community.",
    url: "https://pkcg.com/register",
    type: "website",
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}