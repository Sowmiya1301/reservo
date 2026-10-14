import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reservo",
  description: "Resource reservation management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-stone-50 font-sans text-sm text-zinc-900 antialiased`}
      >
        <div className="flex min-h-screen">
                    <Suspense
            fallback={
              <div className="w-56 shrink-0 border-r border-stone-200 bg-white" />
            }
          >
            <Sidebar />
          </Suspense>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}