import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soul Writer",
  description: "AI-powered structured novel writing workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
