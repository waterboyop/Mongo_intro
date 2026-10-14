"use client";

import Image from "next/image";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { VISITOR_EVENT, VISITOR_KEY, VISITOR_MAX_LEN, cleanVisitorName } from "@/lib/visitor";

/**
 * 訪客稱呼：存在 localStorage，下次進站直接顯示、不再詢問。
 * localStorage 不能用時（例如某些隱私模式）退回只存在記憶體，這次造訪仍可正常使用。
 */

// ---- localStorage 當作外部資料來源（同一分頁用自訂事件、跨分頁用 storage 事件通知）----
function subscribeVisitor(onChange: () => void) {
  window.addEventListener(VISITOR_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(VISITOR_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
function readVisitor(): string | null {
  try {
    return cleanVisitorName(localStorage.getItem(VISITOR_KEY));
  } catch {
    return null;
  }
}

type VisitorCtx = {
  name: string | null;
  /** 這次造訪剛輸入稱呼（true）還是讀到之前存的（false） */
  fresh: boolean;
  asking: boolean;
  toast: boolean;
  submit: (raw: string) => void;
  skip: () => void;
  reset: () => void;
};

const VisitorContext = createContext<VisitorCtx>({
  name: null,
  fresh: false,
  asking: false,
  toast: false,
  submit: () => {},
  skip: () => {},
  reset: () => {},
});

export const useVisitorName = () => useContext(VisitorContext).name;

export function VisitorProvider({ children }: { children: ReactNode }) {
  // 伺服器端與水合時 stored 一律是 null，水合後才讀到真正的值
  const stored = useSyncExternalStore(subscribeVisitor, readVisitor, () => null);
  const [memName, setMemName] = useState<string | null>(null); // localStorage 寫入失敗時的備援
  const [skipped, setSkipped] = useState(false);
  const [fresh, setFresh] = useState(false);
  const [toast, setToast] = useState(false);

  const name = stored ?? memName;
  const asking = !name && !skipped;

  // 歡迎提示出現幾秒後自動消失
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = (raw: string) => {
    const v = cleanVisitorName(raw);
    if (!v) return;
    try {
      localStorage.setItem(VISITOR_KEY, v);
      window.dispatchEvent(new Event(VISITOR_EVENT));
    } catch {}
    setMemName(v);
    setFresh(true);
    setToast(true);
  };
  const skip = () => setSkipped(true);

  // 清除已存的稱呼並重新詢問
  const reset = () => {
    try {
      localStorage.removeItem(VISITOR_KEY);
      window.dispatchEvent(new Event(VISITOR_EVENT));
    } catch {}
    document.documentElement.removeAttribute("data-visitor");
    setMemName(null);
    setSkipped(false);
    setFresh(false);
    setToast(false);
  };

  return (
    <VisitorContext.Provider value={{ name, fresh, asking, toast, submit, skip, reset }}>
      {children}
      {asking && <WelcomeGate />}
      <WelcomeToast />
    </VisitorContext.Provider>
  );
}

/** 進站時的全螢幕稱呼輸入畫面（每次顯示都會重新掛載，輸入框是乾淨的） */
function WelcomeGate() {
  const { submit, skip } = useContext(VisitorContext);
  const [value, setValue] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skip();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>("input, button:not([disabled])");
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
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [skip]);

  const empty = value.trim().length === 0;

  return (
    <div
      ref={panel}
      data-gate
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className="fixed inset-0 z-[110] overflow-y-auto bg-paper"
    >
      <div className="mx-auto grid min-h-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <p className="font-display text-lg italic text-muted">Welcome to Mango Diary</p>
          <h1
            id="gate-title"
            className="mt-4 font-serif text-5xl font-black leading-[1.15] sm:text-6xl lg:text-7xl"
          >
            怎麼稱呼你<span className="text-mango">？</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-ink/70">
            告訴我們你的稱呼，我們會在網站上歡迎你。
          </p>

          <label className="mt-10 block">
            <span className="text-xs tracking-[0.25em] text-muted">你的稱呼</span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={VISITOR_MAX_LEN}
              autoComplete="nickname"
              placeholder="例如：小明"
              className="mt-2 block w-full border-0 border-b-2 border-ink/25 bg-transparent py-3 font-serif text-3xl outline-none transition-colors placeholder:text-ink/25 focus:border-mango"
            />
          </label>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <button
              type="submit"
              disabled={empty}
              className="rounded-full bg-ink px-10 py-3.5 text-paper transition-colors hover:bg-mango hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-ink disabled:hover:text-paper"
            >
              進入官網
            </button>
            <button
              type="button"
              onClick={skip}
              className="text-sm text-muted underline underline-offset-4 transition-colors hover:text-ink"
            >
              先不用，直接逛逛
            </button>
          </div>

          <p className="mt-8 text-xs leading-6 text-muted">
            稱呼會存在這台裝置的瀏覽器裡，下次回來就不用再輸入；隨時可以在首頁按「換稱呼」清除。
          </p>
        </form>

        <div className="relative mx-auto hidden aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] lg:block">
          <Image
            src="/images/mango-1.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 0px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

/** 輸入稱呼後，短暫顯示的歡迎提示 */
function WelcomeToast() {
  const { name, toast } = useContext(VisitorContext);
  if (!toast || !name) return null;
  return (
    <div
      role="status"
      className="modal-pop fixed left-1/2 top-20 z-[90] max-w-[90vw] -translate-x-1/2 rounded-full bg-ink px-6 py-3 text-sm text-paper shadow-[0_12px_30px_-10px_rgba(31,26,20,0.6)]"
    >
      歡迎光臨，<span className="font-medium text-mango">{name}</span>
    </div>
  );
}

/** 首頁標題上方的歡迎語（沒有稱呼就不顯示） */
export function Greeting() {
  const { name, fresh, reset } = useContext(VisitorContext);
  if (!name) return null;
  return (
    <p className="modal-pop mb-5 inline-flex max-w-full items-center gap-3 rounded-full border border-ink/15 bg-white/50 py-1.5 pl-4 pr-2 text-sm">
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-mango" />
      <span className="truncate">
        {fresh ? "歡迎光臨" : "歡迎回來"}，<span className="font-medium">{name}</span>
      </span>
      <button
        type="button"
        onClick={reset}
        className="shrink-0 rounded-full px-3 py-1 text-xs text-muted underline underline-offset-4 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        換稱呼
      </button>
    </p>
  );
}
