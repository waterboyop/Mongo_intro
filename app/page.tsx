import type { CSSProperties } from "react";
import OrderForm from "@/components/OrderForm";
import { ParallaxImage, ParallaxLayer } from "@/components/Parallax";
import { Greeting } from "@/components/Visitor";

type Variety = {
  no: string;
  name: string;
  latin: string;
  months: number[];
  season: string;
  price: number;
  desc: string;
  tags: string[];
  /** 品種代表色：用在照片底色、標籤、鏤空數字與產季曆 */
  color: string;
  img: string;
  imgAlt: string;
};

const varieties: Variety[] = [
  {
    no: "01",
    name: "愛文芒果",
    latin: "Irwin",
    months: [5, 6, 7, 8],
    season: "5 – 8 月",
    price: 680,
    desc: "果皮轉紅、果肉細緻無纖維，香氣濃、甜度高，是台灣夏天最經典的芒果。",
    tags: ["細緻", "香氣濃", "高甜度"],
    color: "#e0562b",
    img: "/images/mango-irwin.jpg",
    imgAlt: "手托一顆紅橘黃漸層的芒果",
  },
  {
    no: "02",
    name: "金煌芒果",
    latin: "Chin Hwang",
    months: [6, 7, 8, 9],
    season: "6 – 9 月",
    price: 620,
    desc: "果實碩大、果肉厚實，熟成後果皮金黃，口感紮實、甜中帶微酸。",
    tags: ["大顆", "肉厚", "甜中帶酸"],
    color: "#d9a30a",
    img: "/images/mango-chinhwang.jpg",
    imgAlt: "一顆金黃色的芒果",
  },
  {
    no: "03",
    name: "海頓芒果",
    latin: "Haden",
    months: [6, 7, 8],
    season: "6 – 8 月",
    price: 640,
    desc: "紅暈漸層的果皮，果肉香甜柔軟，風味濃郁。",
    tags: ["紅暈", "柔軟", "風味濃"],
    color: "#8f2d4e",
    img: "/images/mango-haden.jpg",
    imgAlt: "紫紅暈染的一堆芒果",
  },
  {
    no: "04",
    name: "凱特芒果",
    latin: "Keitt",
    months: [8, 9, 10],
    season: "8 – 10 月",
    price: 580,
    desc: "成熟後果皮仍偏綠，果肉細嫩、酸甜均衡，是夏末秋初的收尾。",
    tags: ["皮綠肉甜", "細嫩", "酸甜均衡"],
    color: "#6f8f2a",
    img: "/images/mango-keitt.jpg",
    imgAlt: "成串掛在樹上的綠皮芒果",
  },
];

const gifts = [
  { name: "家庭箱", spec: "約 5 台斤", price: 680, note: "自家享用的基本款" },
  { name: "送禮箱", spec: "約 5 台斤・附提盒", price: 880, note: "精選大果，附手寫卡片" },
  { name: "大份量箱", spec: "約 10 台斤", price: 1280, note: "辦公室、聚會分享" },
];

const promises = [
  ["產地直送", "從果園直接出貨，不經多層轉手"],
  ["熟度剛好", "採收後經過後熟，收到就能吃"],
  ["小量預購", "依產季批次出貨，不囤貨"],
];

const monthLabels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const nt = (n: number) => `NT$ ${n.toLocaleString("en-US")}`;

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:grid-cols-12 lg:pt-16">
        <ParallaxLayer className="lg:col-span-7" speed={0.15}>
          <Greeting />
          <p className="font-display text-base italic text-muted sm:text-lg">Taiwan mangoes, direct from the orchard</p>
          <h1 className="mt-5 font-serif text-[clamp(2.4rem,7.5vw,5.5rem)] font-black leading-[1.1] tracking-tight sm:mt-6">
            一顆芒果，
            <br />
            等一整個夏天<span className="text-mango">。</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-8 text-ink/75 sm:mt-10">
            我們只賣當季、只賣熟度剛好的台灣芒果。
            從果園採收，到你打開箱子那一刻，每一步都為了那一口甜。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <a
              href="#order"
              className="rounded-full bg-ink px-8 py-3 text-center text-paper transition-colors hover:bg-mango hover:text-ink"
            >
              立即預購
            </a>
            <a
              href="#varieties"
              className="rounded-full border border-ink/30 px-8 py-3 text-center transition-colors hover:border-ink"
            >
              看看品種
            </a>
          </div>
        </ParallaxLayer>

        <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:col-span-5 lg:max-w-none">
          <ParallaxImage
            src="/images/mango-1.jpg"
            alt="帶著綠葉的熟成芒果"
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[4/5] rounded-[2rem] sm:aspect-[3/4]"
            speed={0.12}
          />
          {/* 標籤往反方向移動，和照片拉出前後層次 */}
          <ParallaxLayer className="absolute -bottom-5 left-5 sm:-left-6" speed={-0.1}>
            <div className="frost rounded-2xl px-5 py-4">
              <p className="text-xs tracking-widest text-ink/60">PRE-ORDER</p>
              <p className="mt-1 font-serif text-xl font-semibold">產地直送 · 預購中</p>
            </div>
          </ParallaxLayer>
        </div>
      </section>

      {/* 承諾 */}
      <section className="border-y border-ink/10">
        <ul className="mx-auto grid max-w-7xl divide-y divide-ink/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
          {promises.map(([t, d]) => (
            <li key={t} className="py-6 sm:px-6 sm:py-8 sm:first:pl-0">
              <p className="font-serif text-xl font-semibold">{t}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 品種 */}
      <section id="varieties" className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 md:pt-20 lg:pt-28">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="font-serif text-4xl font-black sm:text-5xl">四種芒果，四種個性</h2>
          <p className="max-w-sm text-sm leading-7 text-muted">
            香氣、口感與產季各不相同，每一種都有自己的代表色。
          </p>
        </div>

        <div className="mt-12 sm:mt-16">
          {varieties.map((v, i) => {
            const flip = i % 2 === 1;
            return (
              <article
                key={v.name}
                style={{ "--accent": v.color } as CSSProperties}
                className="grid items-center gap-10 border-t border-ink/15 py-14 lg:grid-cols-12 lg:gap-16 lg:py-24"
              >
                {/* 照片：底色與品種同色，玻璃標籤壓在邊角 */}
                <div className={`relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none ${flip ? "lg:order-2" : ""}`}>
                  <ParallaxImage
                    src={v.img}
                    alt={v.imgAlt}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="aspect-[4/5] rounded-[2rem]"
                    speed={0.08}
                    style={{ background: v.color }}
                  />
                  <ParallaxLayer
                    className={`absolute -bottom-4 ${flip ? "right-4 sm:-right-5" : "left-4 sm:-left-5"}`}
                    speed={-0.08}
                  >
                    <div className="frost rounded-full px-5 py-2.5 text-sm">
                      <span className="font-display italic">{v.latin}</span>
                      <span className="mx-2 text-ink/30">|</span>
                      <span>產季 {v.season}</span>
                    </div>
                  </ParallaxLayer>
                </div>

                {/* 文字 */}
                <div className={`relative lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
                  <span
                    aria-hidden
                    className="outline-num font-display pointer-events-none absolute -top-10 right-0 select-none text-[8rem] leading-none sm:-top-16 sm:text-[12rem]"
                  >
                    {v.no}
                  </span>
                  <div className="relative">
                    <p className="font-display text-xl italic" style={{ color: v.color }}>
                      {v.latin}
                    </p>
                    <h3 className="mt-2 font-serif text-5xl font-black sm:text-7xl">{v.name}</h3>
                    <p className="mt-6 max-w-md text-base leading-8 text-ink/75">{v.desc}</p>

                    <ul className="mt-6 flex flex-wrap gap-2">
                      {v.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded-full border px-4 py-1 text-sm"
                          style={{ borderColor: v.color, color: v.color }}
                        >
                          {t}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-ink/15 pt-6">
                      <div>
                        <p className="font-serif text-4xl font-semibold">{nt(v.price)}</p>
                        <p className="mt-1 text-xs text-muted">約 5 台斤／箱</p>
                      </div>
                      <a
                        href="#order"
                        className="rounded-full bg-ink px-8 py-3 text-paper transition-colors hover:bg-[var(--accent)]"
                      >
                        預購{v.name.slice(0, 2)}
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 產季曆 */}
      <section id="calendar" className="border-y border-ink/10 bg-[#ede3cf]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:py-24">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 className="font-serif text-3xl font-black sm:text-4xl lg:text-5xl">產季曆</h2>
            <p className="max-w-sm text-sm leading-7 text-muted">
              色條就是各品種的出貨月份，實際依年度氣候與產區而異。
              <span className="md:hidden">（可左右滑動）</span>
            </p>
          </div>
          <div className="-mx-4 mt-10 overflow-x-auto px-4 sm:mx-0 sm:mt-14 sm:px-0">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[7rem_repeat(12,1fr)] gap-1 pb-3 text-center text-muted">
                <span />
                {monthLabels.map((m) => (
                  <span key={m} className="font-display text-sm">{m}</span>
                ))}
              </div>
              {varieties.map((v) => (
                <div
                  key={v.name}
                  className="grid grid-cols-[7rem_repeat(12,1fr)] items-center gap-1 border-t border-ink/10 py-3"
                >
                  <span className="font-serif text-lg font-semibold">{v.name}</span>
                  {monthLabels.map((_, i) => (
                    <span
                      key={i}
                      className="h-5 rounded-full"
                      style={{ background: v.months.includes(i + 1) ? v.color : "rgba(31,26,20,0.07)" }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 禮盒 */}
      <section id="gift" className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:gap-12 md:py-20 lg:grid-cols-12 lg:gap-14 lg:py-28">
        <ParallaxImage
          src="/images/mango-3.jpg"
          alt="一盆剛採收的芒果"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/3] rounded-3xl lg:col-span-6"
          speed={0.1}
        />
        <div className="lg:col-span-6">
          <h2 className="font-serif text-3xl font-black sm:text-4xl lg:text-5xl">送禮，或留給自己</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted">
            三種規格，依人數和用途選擇。所有出貨都以當季品種為主。
          </p>
          <ul className="mt-8 sm:mt-10">
            {gifts.map((g) => (
              <li
                key={g.name}
                className="flex items-baseline justify-between gap-4 border-t border-ink/15 py-5 last:border-b sm:gap-6"
              >
                <div>
                  <p className="font-serif text-xl font-semibold sm:text-2xl">{g.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {g.spec} · {g.note}
                  </p>
                </div>
                <p className="shrink-0 font-serif text-xl">{nt(g.price)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 產地故事 */}
      <section id="story" className="bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-5">
            <p className="font-display text-lg italic text-paper/55">From the orchard</p>
            <h2 className="mt-3 font-serif text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              慢一點，
              <br />
              等它熟。
            </h2>
            <p className="mt-8 max-w-md text-sm leading-8 text-paper/70">
              芒果不能催。每一顆都在樹上多待幾天，等果皮轉色、香氣出來才採收。
              我們寧可少賣一點，也要讓你收到的那一箱，打開就是香的。
            </p>
            <ParallaxImage
              src="/images/mango-4.jpg"
              alt="掛在樹上、帶著水珠的芒果"
              sizes="320px"
              className="mt-8 aspect-[3/4] max-w-xs rounded-3xl sm:mt-10"
              speed={0.14}
            />
          </div>
          <div className="lg:col-span-7 lg:pt-24">
            <ParallaxImage
              src="/images/mango-5.jpg"
              alt="芒果樹上結實纍纍"
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[16/10] rounded-3xl"
              speed={0.08}
            />
            <dl className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-3 sm:gap-8">
              {[
                ["一", "果園採收", "看顏色與香氣決定採收時機"],
                ["二", "後熟分級", "放到熟度剛好，再依大小分級"],
                ["三", "快速出貨", "預購後依批次寄出，減少等待"],
              ].map(([n, t, d]) => (
                <div key={t} className="border-t border-paper/30 pt-4">
                  <dt className="font-serif text-sm text-paper/50">{n}</dt>
                  <dd className="mt-2 font-serif text-xl font-semibold">{t}</dd>
                  <dd className="mt-2 text-sm leading-7 text-paper/60">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 訂購 */}
      <section id="order" className="bg-ink text-paper">
        <div className="mx-auto max-w-4xl border-t border-paper/15 px-4 py-16 sm:px-6 md:py-20 lg:py-24">
          <p className="font-display text-lg italic text-paper/55">Pre-order</p>
          <h2 className="mt-3 font-serif text-3xl font-black sm:text-4xl lg:text-5xl">預購芒果</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-paper/60">
            填寫以下資料，我們會確認出貨時間與付款方式。
          </p>
          <div className="mt-10 sm:mt-12">
            <OrderForm products={varieties.map((v) => `${v.name}（${nt(v.price)}／箱）`)} />
          </div>
        </div>
      </section>
    </>
  );
}
