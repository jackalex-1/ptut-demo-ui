import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PTUT Sovereign AI - Punjab Tianjin University of Technology",
  description:
    "Chat with PTUT Sovereign AI, the official AI assistant for Punjab Tianjin University of Technology. Get instant help with admissions, programs, and university queries.",
  keywords: ["PTUT", "Punjab Tianjin University of Technology", "Sovereign AI", "AI assistant", "chatbot", "University"],
  openGraph: {
    title: "PTUT Sovereign AI - Punjab Tianjin University of Technology",
    description: "Your official AI companion for PTUT services and information.",
    type: "website",
  },
  icons: {
    icon: "/favicon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
