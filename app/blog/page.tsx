import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatDate, posts, readingMinutes } from "@/lib/posts";

export const metadata: Metadata = {
  title: "芒果誌 Mango Journal | 芒果日記",
  description: "怎麼挑、怎麼放、怎麼吃。三篇關於芒果的小文章。",
};

export default function BlogIndex() {
  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:pb-28">
      {/* 標題 */}
      <header className="grid gap-6 border-b border-ink/15 pb-10 md:grid-cols-12 md:items-end sm:pb-14">
        <div className="md:col-span-8">
          <p className="font-display text-lg italic text-muted">Mango Journal</p>
          <h1 className="mt-3 font-serif text-5xl font-black leading-[1.1] sm:text-7xl">
            芒果誌<span className="text-mango">。</span>
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-7 text-muted md:col-span-4">
          怎麼挑、怎麼放、怎麼吃。把我們常被問到的事，寫成三篇小文章。
        </p>
      </header>

      {/* 主打文章 */}
      <Link
        href={`/blog/${featured.slug}`}
        className="group grid gap-8 border-b border-ink/15 py-10 sm:py-14 lg:grid-cols-12 lg:items-center lg:gap-14"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] lg:col-span-7">
          <Image
            src={featured.cover}
            alt={featured.coverAlt}
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            style={{ objectPosition: featured.focus }}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="lg:col-span-5">
          <p className="text-xs tracking-[0.25em] text-muted">
            NEW · {featured.category} · {formatDate(featured.date)}
          </p>
          <h2 className="mt-4 font-serif text-3xl font-black leading-snug sm:text-4xl">
            {featured.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-ink/75">{featured.excerpt}</p>
          <p className="mt-8 text-sm">
            <span className="border-b border-ink pb-1 transition-colors group-hover:border-mango group-hover:text-mango">
              閱讀全文 →
            </span>
            <span className="ml-4 text-muted">約 {readingMinutes(featured)} 分鐘</span>
          </p>
        </div>
      </Link>

      {/* 其餘文章 */}
      <ul className="grid gap-x-12 gap-y-14 pt-10 sm:pt-14 md:grid-cols-2">
        {rest.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image
                  src={p.cover}
                  alt={p.coverAlt}
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  style={{ objectPosition: p.focus }}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-6 flex items-baseline gap-4">
                <span className="font-display text-xl text-muted">0{i + 2}</span>
                <p className="text-xs tracking-[0.25em] text-muted">
                  {p.category} · {formatDate(p.date)}
                </p>
              </div>
              <h2 className="mt-3 font-serif text-2xl font-black leading-snug sm:text-3xl">
                {p.title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-ink/70">{p.excerpt}</p>
              <p className="mt-5 text-sm">
                <span className="border-b border-ink/40 pb-1 transition-colors group-hover:border-mango group-hover:text-mango">
                  閱讀全文 →
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
