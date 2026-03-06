import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { InstallPWA } from "@/components/install-pwa";
import { AiChat } from "@/components/ai-chat";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ninco.app"),
  title: {
    default: "Ninco",
    template: "%s | Ninco",
  },
  description: "Master your money with ease. Simple, powerful, and built for you.",
  keywords: ["Personal Finance", "Money Management", "Expense Tracker", "Budgeting", "Finance App", "Ninco"],
  applicationName: "Ninco",
  openGraph: {
    title: "Ninco",
    description: "Master your money with ease. Simple, powerful, and built for you.",
    url: "https://ninco.app",
    siteName: "Ninco",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ninco",
    description: "Master your money with ease. Simple, powerful, and built for you.",
    images: ["/icon-512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ninco",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInForceRedirectUrl="/home"
      signUpForceRedirectUrl="/home"
      appearance={{
        layout: {
          socialButtonsVariant: "iconButton",
          logoImageUrl: "/favicon.ico",
        },
        variables: {
          colorPrimary: "#10b981",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>
                {children}
                <AiChat />
              </AuthProvider>
            </QueryProvider>
            <InstallPWA />
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
