import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Scanner Portal",
  description: "Administrative console for managing event check-ins and scanning participant credentials.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
