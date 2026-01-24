import type { Metadata, Viewport } from "next";
import "./globals.css";
import MobileFullscreen from "./components/MobileFullscreen";
import InstallPrompt from "./components/InstallPrompt";

export const metadata: Metadata = {
  title: "TwoDo",
  description: "Совместное планирование для пар",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TwoDo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#8B5CF6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" style={{ margin: 0, padding: 0 }}>
      <head>
        <link rel="icon" href="/icon.svg?v=2" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0 }}>
        <MobileFullscreen />
        {children}
      </body>
    </html>
  );
}
