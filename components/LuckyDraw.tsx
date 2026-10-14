"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/** 中獎機率：0.1 = 10%（輪盤 10 等分，其中 1 格是 9 折） */
const WIN_RATE = 0.1;
const SLICES = 10;
const WIN_INDEX = 4; // 「9折」那一格的位置，從正上方順時針數，0 起算
const SLICE_DEG = 360 / SLICES;
const COUPON_CODE = "MANGO90";
const COUPON_KEY = "mango-coupon";

type Phase = "idle" | "spinning" | "win" | "lose";

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** 以正上方為 0°、順時針為正，回傳圓上的座標 */
const point = (deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180;
  return [r * Math.sin(rad), -r * Math.cos(rad)] as const;
};

function slicePath(i: number, r: number) {
  const [x0, y0] = point(i * SLICE_DEG, r);
  const [x1, y1] = point((i + 1) * SLICE_DEG, r);
  return `M0 0 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

function Wheel({ rotation, duration }: { rotation: number; duration: number }) {
  return (
    <div className="relative mx-auto w-64 sm:w-72">
      {/* 固定在上方的指針 */}
      <svg
        aria-hidden
        viewBox="0 0 28 34"
        className="absolute left-1/2 top-0 z-10 h-8 w-7 -translate-x-1/2 -translate-y-2 drop-shadow"
      >
        <path d="M14 33 L2 6 Q14 -2 26 6 Z" fill="#1f1a14" stroke="#e8920c" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>

      <svg
        role="img"
        aria-label={`抽獎輪盤，${SLICES} 格中有 1 格是 9 折優惠券`}
        viewBox="-104 -104 208 208"
        className="block w-full"
      >
        <circle r="102" fill="#1f1a14" />
        <g
          style={{
            transformOrigin: "0px 0px", // viewBox 的原點 (0,0) 就是輪盤中心
            transform: `rotate(${rotation}deg)`,
            transition: `transform ${duration}ms cubic-bezier(0.12, 0.7, 0.15, 1)`,
          }}
        >
          {Array.from({ length: SLICES }, (_, i) => {
            const win = i === WIN_INDEX;
            const mid = i * SLICE_DEG + SLICE_DEG / 2;
            return (
              <g key={i}>
                <path
                  d={slicePath(i, 94)}
                  fill={win ? "#e8920c" : i % 2 ? "#f6e3b8" : "#efd391"}
                  stroke="#f6f0e4"
                  strokeWidth="1.5"
                />
                <text
                  transform={`rotate(${mid}) translate(0 -66)`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={win ? 17 : 11}
                  fontWeight={win ? 800 : 500}
                  fill="#1f1a14"
                  fillOpacity={win ? 1 : 0.55}
                >
                  {win ? "9折" : "再試"}
                </text>
              </g>
            );
          })}
          {/* 外圈的小圓點 */}
          {Array.from({ length: SLICES }, (_, i) => {
            const [x, y] = point(i * SLICE_DEG, 98.5);
            return <circle key={i} cx={x} cy={y} r="1.6" fill="#f6f0e4" />;
          })}
        </g>
        {/* 中心軸 */}
        <circle r="15" fill="#1f1a14" stroke="#f6f0e4" strokeWidth="3" />
        <circle r="5" fill="#e8920c" />
      </svg>
    </div>
  );
}

export default function LuckyDraw() {
  // 小遊戲頁不顯示浮動按鈕，避免蓋住遊戲畫面、手機上誤觸
  const hideTrigger = usePathname() === "/game";
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [rotation, setRotation] = useState(0);
  const [duration, setDuration] = useState(4200);
  const [copied, setCopied] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const close = useCallback(() => {
    clearTimer();
    setOpen(false);
    setPhase("idle");
    setRotation(0);
    setCopied(false);
    trigger.current?.focus();
  }, []);

  // 開啟時：鎖住背景捲動、聚焦關閉鈕、Esc 關閉、Tab 只在彈窗內循環
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href]",
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => clearTimer, []);

  const draw = () => {
    clearTimer();
    setCopied(false);
    setPhase("spinning");

    // 先決定結果，再讓輪盤停到對應的那一格
    const win = Math.random() < WIN_RATE;
    const losers = Array.from({ length: SLICES }, (_, i) => i).filter((i) => i !== WIN_INDEX);
    const index = win ? WIN_INDEX : losers[Math.floor(Math.random() * losers.length)];
    // 在格子內隨機偏移一點，不要每次都剛好停在正中央
    const jitter = (Math.random() - 0.5) * SLICE_DEG * 0.6;
    const target = mod(-(index * SLICE_DEG + SLICE_DEG / 2 + jitter), 360);
    const delta = mod(target - mod(rotation, 360), 360);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduce ? 600 : 4200;
    setDuration(ms);
    setRotation(rotation + (reduce ? 1 : 5) * 360 + delta);
    timer.current = setTimeout(() => setPhase(win ? "win" : "lose"), ms + 150);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  // 把優惠券交給預購表單（localStorage + 事件），再關閉彈窗跳到表單
  const applyCoupon = () => {
    try {
      localStorage.setItem(COUPON_KEY, COUPON_CODE);
    } catch {}
    window.dispatchEvent(new CustomEvent(COUPON_KEY, { detail: COUPON_CODE }));
    close();
  };

  const spinning = phase === "spinning";
  const finished = phase === "win" || phase === "lose";

  return (
    <>
      {!hideTrigger && (
        <button
          ref={trigger}
          type="button"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-paper shadow-[0_12px_30px_-10px_rgba(31,26,20,0.6)] transition-transform hover:-translate-y-0.5 sm:right-6"
        >
          <span aria-hidden className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mango opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mango" />
          </span>
          抽芒果優惠券
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="draw-title"
            className="modal-pop relative max-h-[94vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-paper p-6 sm:rounded-[2rem] sm:p-8"
          >
            <button
              ref={closeBtn}
              type="button"
              onClick={close}
              aria-label="關閉"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-2xl leading-none text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              ×
            </button>

            <p className="font-display text-base italic text-muted">Lucky Draw</p>
            <h2 id="draw-title" className="mt-1 font-serif text-3xl font-black">
              抽一張芒果優惠券
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              每次有 <span className="font-medium text-ink">10%</span> 的機會，抽中芒果 9 折優惠券。
            </p>

            <div className="mt-8">
              <Wheel rotation={rotation} duration={duration} />
            </div>

            {/* 結果 */}
            <div className="mt-6 min-h-[7rem]" aria-live="polite">
              {phase === "idle" && (
                <p className="py-5 text-center text-sm text-muted">按下按鈕，看看今天的運氣。</p>
              )}
              {spinning && <p className="py-5 text-center text-sm text-muted">輪盤轉動中……</p>}
              {phase === "lose" && (
                <div className="py-3 text-center">
                  <p className="font-serif text-xl font-semibold">這次沒中，再試一次吧</p>
                  <p className="mt-2 text-sm text-muted">下一次的機會，一樣是 10%。</p>
                </div>
              )}
              {phase === "win" && (
                <div className="rounded-2xl border-2 border-dashed border-mango bg-[#f6e3b8] px-5 py-4 text-center">
                  <p className="text-xs tracking-[0.25em] text-ink/60">恭喜中獎</p>
                  <p className="mt-1 font-serif text-xl font-black">芒果 9 折優惠券</p>
                  <p className="mt-2 font-mono text-2xl font-semibold tracking-widest">{COUPON_CODE}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={copy}
                      className="rounded-full border border-ink/30 px-5 py-2 text-sm transition-colors hover:border-ink"
                    >
                      {copied ? "已複製" : "複製代碼"}
                    </button>
                    <Link
                      href="/#order"
                      onClick={applyCoupon}
                      className="rounded-full bg-ink px-5 py-2 text-sm text-paper transition-colors hover:bg-ink/80"
                    >
                      帶著優惠券去預購
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={draw}
              disabled={spinning}
              className="mt-4 w-full rounded-full bg-mango py-3 font-medium text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
            >
              {spinning ? "轉動中" : finished ? "再轉一次" : "轉動輪盤"}
            </button>

            <p className="mt-4 text-center text-xs leading-6 text-muted">
              示範小程式：結果在你的瀏覽器裡產生，未串接後端。
            </p>
          </div>
        </div>
      )}
    </>
  );
}
