import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Participant Dashboard",
  description: "Access your participant profile, food ration status, and event pass.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
