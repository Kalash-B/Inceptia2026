import type { Metadata } from "next";
import "./globals.css";
import WandCursor from "./components/wandCursor";

export const metadata: Metadata = {
  title: "Inceptia 2K26 - Hackathon",
  description: "Assemble your house of wizards and showcase technical brilliance in a 24-hour national hackathon.",
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
