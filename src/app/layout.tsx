import type React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UseGoogleAnalysic } from "@/components/use-google-analysic";

export const metadata: Metadata = {
  title: "TimeGuessr - Play Geography Game Online | Street View Quiz",
  description: "Play TimeGuessr, the ultimate geography guessing game! Test your world knowledge with street view challenges. Join millions playing TimeGuessr today.",
  keywords: "TimeGuessr, geography game, street view quiz, world geography, guessing game, location quiz, geography challenge, educational game, online geography, TimeGuessr game",
  authors: [{ name: "TimeGuessr Team" }],
  creator: "TimeGuessr",
  publisher: "TimeGuessr",
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  },
  openGraph: {
    title: "TimeGuessr - Play Geography Game Online",
    description: "Play TimeGuessr, the ultimate geography guessing game! Test your world knowledge with street view challenges.",
    type: "website",
    locale: "en_US",
    siteName: "TimeGuessr",
  },
  twitter: {
    card: "summary_large_image",
    title: "TimeGuessr - Play Geography Game Online",
    description: "Play TimeGuessr, the ultimate geography guessing game! Test your world knowledge with street view challenges.",
    creator: "@TimeGuessr",
  },
  category: "games",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#CF142B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <UseGoogleAnalysic />
      </body>
    </html>
  );
}
