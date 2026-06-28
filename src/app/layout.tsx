import type { Metadata, Viewport } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Toaster } from "sonner";

import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "أمانة — حجز مقاعد ونقل بريد بين المحافظات",
    template: "%s — أمانة",
  },
  description:
    "منصة عراقية لحجز مقاعد السفر بين المحافظات وإرسال الأمانات والبريد مع سائقين موثوقين.",
  applicationName: "أمانة",
  appleWebApp: { capable: true, title: "أمانة", statusBarStyle: "default" },
  icons: { apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0B5D51",
  width: "device-width",
  initialScale: 1,
};

// Applies the persisted theme before first paint (reads the `theme` cookie, not
// localStorage). Kept inline so the root layout stays static — calling cookies()
// here would force every route, including /_not-found, to render dynamically.
const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(dark|light)/);if(m&&m[1]==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
        <Toaster
          position="top-center"
          dir="rtl"
          richColors
          toastOptions={{ className: "font-sans" }}
        />
      </body>
    </html>
  );
}
