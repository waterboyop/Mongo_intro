export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="sm:col-span-2 md:col-span-1">
            <p className="font-serif text-3xl font-black tracking-widest">芒果日記</p>
            <p className="font-display mt-1 text-lg italic text-paper/60">Mango Diary</p>
            <p className="mt-6 max-w-xs text-sm leading-7 text-paper/60">
              只賣當季、只賣熟度剛好的台灣芒果。
            </p>
          </div>
          <nav className="flex flex-col gap-3 text-sm">
            <p className="mb-1 text-xs tracking-[0.25em] text-paper/45">INDEX</p>
            <a href="/#varieties" className="hover:text-mango">品種</a>
            <a href="/#calendar" className="hover:text-mango">產季</a>
            <a href="/#gift" className="hover:text-mango">禮盒</a>
            <a href="/#story" className="hover:text-mango">產地故事</a>
            <a href="/blog" className="hover:text-mango">芒果誌</a>
            <a href="/game" className="hover:text-mango">小遊戲</a>
          </nav>
          <div className="flex flex-col gap-3 text-sm">
            <p className="mb-1 text-xs tracking-[0.25em] text-paper/45">CONTACT</p>
            <a href="mailto:hello@example.com" className="hover:text-mango">
              hello@example.com
            </a>
            <span className="text-paper/60">Taiwan</span>
          </div>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-2 border-t border-paper/15 pt-6 text-xs text-paper/45 sm:flex-row">
          <span>© 2026 芒果日記 Mango Diary</span>
          <span>示範網站 · 圖片來自 Unsplash</span>
        </div>
      </div>
    </footer>
  );
}
