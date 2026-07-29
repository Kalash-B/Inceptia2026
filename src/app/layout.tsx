import type { Metadata } from "next";
import "./globals.css";
import WandCursor from "./components/wandCursor";

export const metadata: Metadata = {
  title: {
    default: "Inceptia 2K26 | National Level Hackathon",
    template: "%s | Inceptia 2K26",
  },
  description: "Assemble your house of wizards and showcase technical brilliance in Inceptia 2K26, a 24-hour national level hackathon at PCCOER, Pune.",
  keywords: [
    "Inceptia", "Inceptia 2026", "Inceptia 2K26", "Hackathon", "Pune Hackathon", 
    "PCCOER", "National Hackathon", "Coding Competition", "Wizards Theme", 
    "AI ML", "Web3", "Blockchain", "Healthcare Hackathon", "Open Innovation"
  ],
  authors: [{ name: "Inceptia Dev Team" }],
  creator: "Department of Information Technology, PCCOER Ravet",
  metadataBase: new URL("https://www.inceptiaitsa.com"),
  openGraph: {
    title: "Inceptia 2K26 | National Level Hackathon",
    description: "Assemble your house of wizards and showcase technical brilliance in Inceptia 2K26, a 24-hour national level hackathon.",
    url: "https://www.inceptiaitsa.com",
    siteName: "Inceptia 2K26",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/inceptia_logo.webp",
        width: 1200,
        height: 630,
        alt: "Inceptia 2K26 Hackathon Banner",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Inceptia 2K26 | National Level Hackathon",
    description: "Assemble your house of wizards and showcase technical brilliance in Inceptia 2K26, a 24-hour national level hackathon.",
    images: ["/hero-bg.webp"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-surface text-on-surface">
        <WandCursor />
        <main className="flex-1 flex flex-col w-full relative">
          {children}
        </main>
      </body>
    </html>
  );
}
