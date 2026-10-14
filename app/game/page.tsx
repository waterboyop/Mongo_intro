import type { Metadata } from "next";
import CatchGame from "@/components/CatchGame";

export const metadata: Metadata = {
  title: "接芒果小遊戲 | 芒果日記",
  description: "15 秒接芒果小遊戲，單純好玩，看你能拿幾分。",
};

export default function GamePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:pb-28">
      <header className="mx-auto max-w-md text-center">
        <p className="font-display text-lg italic text-muted">Just for fun</p>
        <h1 className="mt-3 font-serif text-5xl font-black leading-[1.1] sm:text-6xl">
          接芒果<span className="text-mango">。</span>
        </h1>
        <p className="mt-5 text-sm leading-7 text-muted">
          休息一下，玩 15 秒。單純娛樂，沒有獎品，只有分數。
        </p>
      </header>
      <div className="mt-10">
        <CatchGame />
      </div>
    </div>
  );
}
