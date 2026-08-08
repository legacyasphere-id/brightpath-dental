import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { ChatWidget } from "@/components/chat/ChatWidget";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brightpath-dental.vercel.app"),
  title: "BrightPath Dental — Modern Dental Care in Bekasi",
  // Distinct from openGraph.description on purpose: this one is written for
  // a search result, the other for a one-line pitch read in a chat list.
  description:
    "BrightPath Dental — book appointments, chat with our AI assistant, and get transparent pricing for dental care in Bekasi.",
  openGraph: {
    title: "BrightPath Dental",
    description: "Perawatan gigi modern di Bekasi — booking mudah lewat WhatsApp.",
    url: "/",
    siteName: "BrightPath Dental",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrightPath Dental",
    description: "Perawatan gigi modern di Bekasi — booking mudah lewat WhatsApp.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${inter.variable} antialiased`}>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
