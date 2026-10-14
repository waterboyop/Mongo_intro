"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

/**
 * 捲動視差：依元素中心相對視窗中心的距離，對 target 做 translateY。
 * speed > 0：比頁面慢（有遠景感）；speed < 0：比頁面快（浮在前景）。
 * bleed：位移上限（元素高度的比例），避免圖片露出邊緣。
 */
function useParallax(
  anchor: RefObject<HTMLElement | null>,
  target: RefObject<HTMLElement | null>,
  speed: number,
  bleed?: number,
) {
  useEffect(() => {
    const el = anchor.current;
    const t = target.current;
    if (!el || !t) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = false;

    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const offset = r.top + r.height / 2 - window.innerHeight / 2;
      let y = -offset * speed;
      if (bleed !== undefined) {
        const max = r.height * bleed;
        y = Math.max(-max, Math.min(max, y));
      }
      t.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };
    const schedule = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        schedule();
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [anchor, target, speed, bleed]);
}

type ImageProps = {
  src: string;
  alt: string;
  sizes: string;
  /** 外框的版型 class（比例、圓角、間距等） */
  className?: string;
  priority?: boolean;
  speed?: number;
  /** 外框底色，圖片載入前先顯示 */
  style?: CSSProperties;
};

/** 照片放在 overflow-hidden 的框裡，照片本身比框高 30%，捲動時在框內位移。 */
export function ParallaxImage({
  src,
  alt,
  sizes,
  className = "",
  priority,
  speed = 0.1,
  style,
}: ImageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  useParallax(frame, layer, speed, 0.15);

  return (
    <div ref={frame} style={style} className={`relative overflow-hidden ${className}`}>
      <div
        ref={layer}
        className="absolute inset-x-0 -bottom-[15%] -top-[15%] will-change-transform"
      >
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    </div>
  );
}

type LayerProps = {
  children: ReactNode;
  className?: string;
  speed?: number;
};

/** 讓任意內容（文字、標籤）以不同速度位移。外層不動，只位移內層。 */
export function ParallaxLayer({ children, className = "", speed = 0.06 }: LayerProps) {
  const anchor = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  useParallax(anchor, layer, speed);

  return (
    <div ref={anchor} className={className}>
      <div ref={layer} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
