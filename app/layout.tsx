import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LuckyDraw from "@/components/LuckyDraw";
import { VisitorProvider } from "@/components/Visitor";
import { VISITOR_KEY } from "@/lib/visitor";

const sansTC = Noto_Sans_TC({
  variable: "--font-sans-tc",
  weight: ["300", "400", "500"],
  preload: false,
});

const serifTC = Noto_Serif_TC({
  variable: "--font-serif-tc",
  weight: ["400", "600", "900"],
  preload: false,
});

const displayLatin = Cormorant_Garamond({
  variable: "--font-display-latin",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "芒果日記 Mango Diary | 產地直送台灣芒果",
  description: "當季採收、產地直送。愛文、金煌、海頓、凱特，預購台灣好芒果。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      suppressHydrationWarning
      className={`${sansTC.variable} ${serifTC.variable} ${displayLatin.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        {/* 一般內嵌腳本，HTML 解析到就會立刻執行（早於第一次繪製與水合）：
            有存過稱呼就在 <html> 上加 data-visitor，CSS 會先把進站畫面藏起來 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var v=localStorage.getItem(${JSON.stringify(VISITOR_KEY)});if(v&&v.trim())document.documentElement.setAttribute("data-visitor","1")}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <VisitorProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <LuckyDraw />
        </VisitorProvider>
      </body>
    </html>
  );
}
