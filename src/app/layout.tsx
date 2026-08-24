import type { Metadata } from "next";
import { Anton, Bangers, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getProfile } from "@/lib/content";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ComicFX } from "@/components/fx/comic-fx";
import { ComicTransition } from "@/components/fx/comic-transition";
import { SmoothScroll } from "@/components/fx/smooth-scroll";
import { PressFX } from "@/components/fx/press-fx";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"] });
const display = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});
const sfx = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: "400",
});

const profile = getProfile();

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.summary,
};

// Set theme before paint to avoid a flash of the wrong color scheme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${display.variable} ${sfx.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SmoothScroll />
        <ComicTransition>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ComicTransition>
        <ComicFX />
        <PressFX />
      </body>
    </html>
  );
}
