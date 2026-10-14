import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, posts, readingMinutes } from "@/lib/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} | 芒果日記`, description: post.excerpt };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const i = posts.findIndex((p) => p.slug === slug);
  const next = posts[(i + 1) % posts.length];

  return (
    <article>
      <div className="mx-auto max-w-4xl px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
        <Link href="/blog" className="text-sm text-muted transition-colors hover:text-ink">
          ← 回到芒果誌
        </Link>
        <p className="mt-10 text-xs tracking-[0.25em] text-muted">
          {post.category} · {formatDate(post.date)} · 約 {readingMinutes(post)} 分鐘
        </p>
        <h1 className="mt-5 font-serif text-4xl font-black leading-[1.2] sm:text-6xl">
          {post.title}
        </h1>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem]">
          <Image
            src={post.cover}
            alt={post.coverAlt}
            fill
            priority
            sizes="(min-width: 1152px) 1100px, 100vw"
            style={{ objectPosition: post.focus }}
            className="object-cover"
          />
        </div>
      </div>

      {/* 內文 */}
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
        {post.body.map((b, idx) => {
          if (b.t === "h2")
            return (
              <h2 key={idx} className="mb-4 mt-14 font-serif text-2xl font-black sm:text-3xl">
                {b.x}
              </h2>
            );
          if (b.t === "ul")
            return (
              <ul key={idx} className="my-6 space-y-3">
                {b.x.map((li) => (
                  <li key={li} className="flex gap-3 text-base leading-8 text-ink/80">
                    <span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-mango" />
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            );
          if (b.t === "tip")
            return (
              <aside
                key={idx}
                className="my-10 rounded-2xl border-l-4 border-mango bg-[#ede3cf] px-6 py-5"
              >
                <p className="text-xs tracking-[0.25em] text-muted">TIP</p>
                <p className="mt-2 text-base leading-8">{b.x}</p>
              </aside>
            );
          return (
            <p
              key={idx}
              className={`mt-6 text-base leading-9 text-ink/80 ${
                idx === 0 ? "text-lg text-ink first-letter:font-serif first-letter:text-5xl first-letter:font-black" : ""
              }`}
            >
              {b.x}
            </p>
          );
        })}
      </div>

      {/* 下一篇 + 預購 */}
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:gap-16">
          <Link href={`/blog/${next.slug}`} className="group block">
            <p className="text-xs tracking-[0.25em] text-paper/50">NEXT</p>
            <p className="mt-3 font-serif text-2xl font-black leading-snug transition-colors group-hover:text-mango sm:text-3xl">
              {next.title}
            </p>
            <p className="mt-4 text-sm text-paper/60">閱讀下一篇 →</p>
          </Link>
          <div className="md:border-l md:border-paper/15 md:pl-16">
            <p className="text-xs tracking-[0.25em] text-paper/50">PRE-ORDER</p>
            <p className="mt-3 font-serif text-2xl font-black sm:text-3xl">看完想吃了嗎？</p>
            <Link
              href="/#order"
              className="mt-6 inline-block rounded-full bg-mango px-8 py-3 font-medium text-ink transition-colors hover:bg-paper"
            >
              預購芒果
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
