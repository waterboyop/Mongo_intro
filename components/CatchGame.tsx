"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useVisitorName } from "@/components/Visitor";

/** 遊戲時間（秒） */
const GAME_SECONDS = 15;

// 遊戲座標用固定的「邏輯尺寸」，畫面縮放由 canvas 處理
const W = 400;
const H = 560;
const BASKET_W = 96;
const BASKET_Y = H - 70; // 籃口的 y
const BASKET_SPEED = 520; // 鍵盤移動速度（邏輯 px / 秒）

type Kind = "mango" | "gold" | "rotten";
const POINTS: Record<Kind, number> = { mango: 1, gold: 3, rotten: -2 };

type Item = { x: number; y: number; r: number; vy: number; rot: number; vr: number; kind: Kind };
type Pop = { x: number; y: number; life: number; text: string; color: string };
type State = {
  items: Item[];
  pops: Pop[];
  basketX: number;
  targetX: number;
  left: boolean;
  right: boolean;
  bump: number;
  time: number;
  score: number;
  spawn: number;
};

const freshState = (): State => ({
  items: [],
  pops: [],
  basketX: W / 2,
  targetX: W / 2,
  left: false,
  right: false,
  bump: 0,
  time: GAME_SECONDS,
  score: 0,
  spawn: 0.4,
});

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// ---------------------------------------------------------------- 繪圖
function drawLeaves(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "#4c7a2a";
  const leaves = [
    [30, 6, 70, 18, 0.5], [110, -2, 80, 20, 0.2], [190, 4, 70, 16, -0.1],
    [270, -2, 82, 20, -0.25], [360, 6, 70, 18, -0.5], [70, 24, 50, 12, 0.7], [330, 26, 50, 12, -0.7],
  ];
  for (const [x, y, rx, ry, rot] of leaves) {
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMango(ctx: CanvasRenderingContext2D, it: Item) {
  const { r, kind } = it;
  ctx.save();
  ctx.translate(it.x, it.y);
  ctx.rotate(it.rot);

  const [c1, c2, c3] =
    kind === "gold"
      ? ["#fff6b8", "#ffd24a", "#d99a00"]
      : kind === "rotten"
        ? ["#a89065", "#6f5532", "#3b2c18"]
        : ["#ffd596", "#f0a30a", "#d9561f"];
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.3);
  g.addColorStop(0, c1);
  g.addColorStop(0.5, c2);
  g.addColorStop(1, c3);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.85, r * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  if (kind === "rotten") {
    ctx.fillStyle = "rgba(30,20,10,0.55)";
    for (const [dx, dy, s] of [[-0.3, 0.2, 0.18], [0.25, -0.1, 0.14], [0.05, 0.55, 0.12]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, s * r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.32, -r * 0.4, r * 0.16, r * 0.3, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 蒂與葉
  ctx.strokeStyle = "#5b3b1c";
  ctx.lineWidth = Math.max(1.5, r * 0.09);
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.05);
  ctx.lineTo(r * 0.08, -r * 1.28);
  ctx.stroke();
  ctx.fillStyle = kind === "rotten" ? "#6b7a3a" : "#4c8a2a";
  ctx.beginPath();
  ctx.ellipse(r * 0.42, -r * 1.2, r * 0.46, r * 0.17, -0.5, 0, Math.PI * 2);
  ctx.fill();

  if (kind === "gold") {
    // 閃光
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 2;
    const sx = r * 0.95, sy = -r * 0.7, s = r * 0.32;
    ctx.beginPath();
    ctx.moveTo(sx - s, sy); ctx.lineTo(sx + s, sy);
    ctx.moveTo(sx, sy - s); ctx.lineTo(sx, sy + s);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBasket(ctx: CanvasRenderingContext2D, x: number, bump: number) {
  ctx.save();
  ctx.translate(x, BASKET_Y);
  ctx.scale(1 + bump * 0.12, 1 - bump * 0.1);
  const hw = BASKET_W / 2;
  // 籃身
  ctx.fillStyle = "#1f1a14";
  ctx.beginPath();
  ctx.moveTo(-hw, 0);
  ctx.lineTo(hw, 0);
  ctx.lineTo(hw - 12, 42);
  ctx.quadraticCurveTo(0, 52, -hw + 12, 42);
  ctx.closePath();
  ctx.fill();
  // 籃編紋
  ctx.strokeStyle = "rgba(246,240,228,0.18)";
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 18, 4);
    ctx.lineTo(i * 15, 44);
    ctx.stroke();
  }
  // 籃口
  ctx.fillStyle = "#e8920c";
  ctx.beginPath();
  ctx.roundRect(-hw - 4, -6, BASKET_W + 8, 11, 5);
  ctx.fill();
  ctx.restore();
}

function render(ctx: CanvasRenderingContext2D, s: State) {
  ctx.clearRect(0, 0, W, H);
  drawLeaves(ctx);
  for (const it of s.items) drawMango(ctx, it);
  drawBasket(ctx, s.basketX, s.bump);
  ctx.textAlign = "center";
  ctx.font = "700 22px 'Noto Serif TC', serif";
  for (const p of s.pops) {
    ctx.globalAlpha = clamp(p.life / 0.7, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

/** 依元素實際大小與螢幕密度設定 canvas 解析度，再把 state 畫上去 */
function paint(canvas: HTMLCanvasElement | null, s: State, resize = false) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (resize) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
  }
  const k = canvas.width / W;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  render(ctx, s);
}

// ---------------------------------------------------------------- 元件
type Phase = "idle" | "playing" | "over";

function verdict(score: number) {
  if (score < 8) return "再接再厲，下一輪一定更好";
  if (score < 16) return "不錯喔，手感正在熱起來";
  if (score < 24) return "接芒果高手！";
  return "芒果之王，沒有芒果逃得過你";
}

export default function CatchGame() {
  const name = useVisitorName();
  const [phase, setPhase] = useState<Phase>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0); // 只記在這次瀏覽的記憶體，不儲存

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<State>(freshState());
  const scoreEl = useRef<HTMLSpanElement>(null);
  const timeEl = useRef<HTMLSpanElement>(null);
  const barEl = useRef<HTMLDivElement>(null);
  const againBtn = useRef<HTMLButtonElement>(null);

  // 畫布尺寸跟著容器變化
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => paint(c, game.current, true));
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  // 沒在遊戲中：畫靜態畫面（開始前是空場景，結束後停在最後一幕）
  useEffect(() => {
    if (phase !== "playing") paint(canvasRef.current, game.current);
  }, [phase]);

  // 結束畫面出現後，把焦點給「再玩一次」
  useEffect(() => {
    if (phase === "over") againBtn.current?.focus();
  }, [phase]);

  // 遊戲主迴圈
  useEffect(() => {
    if (phase !== "playing") return;
    const s = freshState();
    game.current = s;
    let raf = 0;
    let last = performance.now();

    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") s.left = down;
      else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") s.right = down;
      else return;
      e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    const spawn = (progress: number) => {
      const roll = Math.random();
      const kind: Kind = roll < 0.1 ? "gold" : roll < 0.28 ? "rotten" : "mango";
      const r = 17 + Math.random() * 6;
      s.items.push({
        x: r + Math.random() * (W - r * 2),
        y: -r * 1.5,
        r,
        vy: 170 + Math.random() * 60 + progress * 120,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 3,
        kind,
      });
    };

    const frame = (now: number) => {
      // 分頁被切到背景時 rAF 會暫停；限制單次 dt，回來後時間不會一口氣跳走
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      s.time = Math.max(0, s.time - dt);
      const progress = 1 - s.time / GAME_SECONDS;

      // 籃子
      const dir = (s.right ? 1 : 0) - (s.left ? 1 : 0);
      if (dir !== 0) s.targetX = clamp(s.targetX + dir * BASKET_SPEED * dt, BASKET_W / 2, W - BASKET_W / 2);
      s.basketX += (s.targetX - s.basketX) * Math.min(1, dt * 16);
      s.bump = Math.max(0, s.bump - dt * 5);

      // 生成：越到後面越密
      s.spawn -= dt;
      if (s.spawn <= 0 && s.time > 0.4) {
        spawn(progress);
        s.spawn = 0.72 - progress * 0.38 + Math.random() * 0.18;
      }

      // 移動與接住判定
      for (let i = s.items.length - 1; i >= 0; i--) {
        const it = s.items[i];
        it.y += it.vy * dt;
        it.rot += it.vr * dt;
        const caught =
          it.y + it.r * 0.9 >= BASKET_Y - 4 &&
          it.y <= BASKET_Y + 26 &&
          Math.abs(it.x - s.basketX) <= BASKET_W / 2 - 2 + it.r * 0.3;
        if (caught) {
          const pts = POINTS[it.kind];
          s.score = Math.max(0, s.score + pts);
          s.bump = 1;
          s.pops.push({
            x: it.x,
            y: BASKET_Y - 14,
            life: 0.7,
            text: pts > 0 ? `+${pts}` : `${pts}`,
            color: it.kind === "gold" ? "#d99a00" : pts > 0 ? "#e8920c" : "#b3261e",
          });
          s.items.splice(i, 1);
        } else if (it.y > H + 40) {
          s.items.splice(i, 1);
        }
      }
      for (let i = s.pops.length - 1; i >= 0; i--) {
        const p = s.pops[i];
        p.life -= dt;
        p.y -= 48 * dt;
        if (p.life <= 0) s.pops.splice(i, 1);
      }

      // HUD 直接改 DOM，避免每一幀都觸發 React 重新渲染
      if (scoreEl.current) scoreEl.current.textContent = String(s.score);
      if (timeEl.current) timeEl.current.textContent = s.time.toFixed(1);
      if (barEl.current) {
        barEl.current.style.width = `${(s.time / GAME_SECONDS) * 100}%`;
        barEl.current.style.background = s.time <= 5 ? "#d9561f" : "#e8920c";
      }

      paint(canvasRef.current, s);

      if (s.time <= 0) {
        setFinalScore(s.score);
        setBest((b) => Math.max(b, s.score));
        setPhase("over");
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [phase]);

  const movePointer = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (phase !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    game.current.targetX = clamp(x, BASKET_W / 2, W - BASKET_W / 2);
  };

  const start = () => {
    // HUD 先歸零，下一幀才開始跑
    if (scoreEl.current) scoreEl.current.textContent = "0";
    if (timeEl.current) timeEl.current.textContent = GAME_SECONDS.toFixed(1);
    if (barEl.current) {
      barEl.current.style.width = "100%";
      barEl.current.style.background = "#e8920c";
    }
    setPhase("playing");
  };

  return (
    <div className="mx-auto w-full max-w-md">
      {/* HUD */}
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <p className="text-xs tracking-[0.25em] text-muted">SCORE</p>
          <p className="font-display text-5xl leading-none">
            <span ref={scoreEl}>0</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-[0.25em] text-muted">TIME</p>
          <p className="font-display text-5xl leading-none">
            <span ref={timeEl}>{GAME_SECONDS.toFixed(1)}</span>
          </p>
        </div>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-ink/10">
        <div ref={barEl} className="h-full w-full rounded-full bg-mango" />
      </div>

      {/* 遊戲畫面 */}
      <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-gradient-to-b from-[#fbe6bd] to-[#f6f0e4] shadow-[0_24px_60px_-30px_rgba(31,26,20,0.45)]">
        <canvas
          ref={canvasRef}
          aria-label="接芒果遊戲畫面：左右移動籃子，接住掉下來的芒果"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            movePointer(e);
          }}
          onPointerMove={movePointer}
          className="block aspect-[5/7] w-full cursor-none touch-none select-none"
        />

        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper/85 p-6 text-center backdrop-blur-sm">
            <p className="font-display text-lg italic text-muted">Catch the Mango</p>
            <h2 className="mt-1 font-serif text-4xl font-black">接芒果</h2>
            <p className="mt-4 max-w-xs text-sm leading-7 text-ink/75">
              {GAME_SECONDS} 秒內，左右移動籃子，接住掉下來的芒果。
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-gradient-to-br from-[#ffd596] to-[#d9561f]" />
                芒果 <b className="font-medium">+1</b>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-gradient-to-br from-[#fff6b8] to-[#d99a00]" />
                金芒果 <b className="font-medium">+3</b>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-gradient-to-br from-[#a89065] to-[#3b2c18]" />
                壞芒果 <b className="font-medium text-[#b3261e]">−2</b>
              </li>
            </ul>
            <p className="mt-5 text-xs leading-6 text-muted">
              滑鼠或手指左右拖曳，或用鍵盤 ← → / A D
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-6 rounded-full bg-ink px-10 py-3 text-paper transition-colors hover:bg-mango hover:text-ink"
            >
              開始遊戲
            </button>
          </div>
        )}

        {phase === "over" && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-paper/90 p-6 text-center backdrop-blur-sm"
            aria-live="polite"
          >
            <p className="font-display text-lg italic text-muted">Time&apos;s up</p>
            <h2 className="mt-1 font-serif text-3xl font-black">時間到！</h2>
            <p className="mt-6 text-xs tracking-[0.25em] text-muted">
              {name ? `${name} 的得分` : "你的得分"}
            </p>
            <p className="font-display text-8xl leading-none text-mango">{finalScore}</p>
            <p className="mt-5 text-sm text-ink/75">{verdict(finalScore)}</p>
            <p className="mt-2 text-xs text-muted">這次瀏覽的最高分：{best}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                ref={againBtn}
                type="button"
                onClick={start}
                className="rounded-full bg-ink px-8 py-3 text-paper transition-colors hover:bg-mango hover:text-ink"
              >
                再玩一次
              </button>
              <Link
                href="/#order"
                className="rounded-full border border-ink/30 px-6 py-3 text-sm transition-colors hover:border-ink"
              >
                去預購芒果
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
