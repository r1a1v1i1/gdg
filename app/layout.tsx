import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrowdOS | AI Smart Stadium Operations",
  description: "AI-powered smart stadium and crowd operations system for live cricket events."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
