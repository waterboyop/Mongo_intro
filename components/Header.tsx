"use client";

import { useState } from "react";

const links = [
  { href: "/#varieties", label: "品種" },
  { href: "/#calendar", label: "產季" },
  { href: "/#gift", label: "禮盒" },
  { href: "/#story", label: "產地故事" },
  { href: "/blog", label: "芒果誌" },
  { href: "/game", label: "小遊戲" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-baseline gap-3" onClick={() => setOpen(false)}>
          <span className="font-serif text-xl font-black tracking-widest sm:text-2xl">芒果日記</span>
          <span className="font-display hidden text-sm italic text-muted sm:inline">
            Mango Diary
          </span>
        </a>

        {/* 平板以上：橫向導覽 */}
        <nav className="hidden items-center gap-5 text-sm text-ink/80 md:flex lg:gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="underline-offset-8 decoration-ink/40 hover:underline"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#order"
            className="rounded-full bg-ink px-5 py-2 text-paper transition-colors hover:bg-mango hover:text-ink"
          >
            預購
          </a>
        </nav>

        {/* 手機：預購 + 漢堡選單 */}
        <div className="flex items-center gap-3 md:hidden">
          <a
            href="/#order"
            className="rounded-full bg-ink px-4 py-1.5 text-sm text-paper"
            onClick={() => setOpen(false)}
          >
            預購
          </a>
          <button
            type="button"
            aria-label={open ? "關閉選單" : "開啟選單"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`h-0.5 w-6 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span className={`h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
            <span
              className={`h-0.5 w-6 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-ink/10 bg-paper px-4 pb-4 md:hidden"
        >
          <ul>
            {links.map((l) => (
              <li key={l.href} className="border-b border-ink/10 last:border-b-0">
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 font-serif text-lg"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
