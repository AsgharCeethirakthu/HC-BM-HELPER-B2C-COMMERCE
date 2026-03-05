import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SFRA AI Agent",
  description: "Gap analysis and FSD generator for SFRA requirements.",
  icons: {
    icon: [
      { url: "/scout-icon.png", media: "(prefers-color-scheme: light)" },
      { url: "/scout-icon-white.png", media: "(prefers-color-scheme: dark)" },
      { url: "/scout-icon.png" },
    ],
    shortcut: "/scout-icon.png",
    apple: "/scout-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
