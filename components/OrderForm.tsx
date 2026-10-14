"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useVisitorName } from "@/components/Visitor";
import { validateContact } from "@/lib/contact";
import type { Order, OrderErrors } from "@/lib/order";

type Props = {
  products: string[];
};

const COUPON_KEY = "mango-coupon";

// 抽中的優惠券存在 localStorage；抽獎彈窗會發出同名事件通知這裡更新
function subscribeCoupon(onChange: () => void) {
  window.addEventListener(COUPON_KEY, onChange);
  return () => window.removeEventListener(COUPON_KEY, onChange);
}
function getStoredCoupon() {
  try {
    return localStorage.getItem(COUPON_KEY) ?? "";
  } catch {
    return "";
  }
}

type Status = "idle" | "sending" | "error";

export default function OrderForm({ products }: Props) {
  const visitor = useVisitorName();
  const stored = useSyncExternalStore(subscribeCoupon, getStoredCoupon, () => "");
  // 使用者手動改過就以手動輸入為主，否則用抽中的優惠券
  const [typed, setTyped] = useState<string | null>(null);
  const coupon = typed ?? stored;

  // 「電話或 Email」：離開欄位與送出時驗證；已經顯示錯誤後，改成邊輸入邊檢查
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const contactInput = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Order | null>(null); // 送出成功後的訂單摘要

  function checkContact(value: string) {
    const r = validateContact(value);
    setContactError(r.ok ? null : r.message);
    return r;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const c = checkContact(contact);
    if (!c.ok) {
      contactInput.current?.focus();
      return;
    }
    setContact(c.value);

    // 先把表單資料取出來：await 之後 e.currentTarget 就不能用了
    const d = new FormData(e.currentTarget);
    const payload = {
      name: d.get("name"),
      contact: c.value,
      product: d.get("product"),
      qty: Number(d.get("qty")),
      coupon: d.get("coupon"),
      address: d.get("address"),
      note: d.get("note"),
    };

    setStatus("sending");
    setServerMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        errors?: OrderErrors;
      } | null;

      if (res.ok && data?.ok) {
        setSubmitted({
          ...(payload as unknown as Order),
          contact: c.value,
          contactKind: c.kind,
          coupon: String(payload.coupon ?? ""),
          note: String(payload.note ?? ""),
        });
        setStatus("idle");
        return;
      }
      // 伺服器端驗證沒過（理論上前端已擋下，但直接打 API 或規則不一致時會到這裡）
      if (data?.errors?.contact) {
        setContactError(data.errors.contact);
        contactInput.current?.focus();
        setServerMessage(null);
      } else {
        setServerMessage(
          data?.errors ? Object.values(data.errors).join("、") : data?.message || "送出失敗，請稍後再試。",
        );
      }
      setStatus("error");
    } catch {
      setServerMessage("網路好像不太順，請檢查連線後再試一次。");
      setStatus("error");
    }
  }

  function again() {
    setSubmitted(null);
    setContact("");
    setContactError(null);
    setServerMessage(null);
    setStatus("idle");
  }

  // ---- 送出成功：顯示確認畫面 ----
  if (submitted) {
    const rows: [string, string][] = [
      ["姓名", submitted.name],
      ["聯絡方式", submitted.contact],
      ["品項", submitted.product],
      ["數量", `${submitted.qty} 箱`],
      ["優惠券", submitted.coupon || "無"],
      ["收件地址", submitted.address],
      ["備註", submitted.note || "無"],
    ];
    return (
      <div role="status" className="rounded-3xl border border-paper/20 p-6 sm:p-8">
        <p className="font-display text-lg italic text-paper/55">Thank you</p>
        <h3 className="mt-1 font-serif text-3xl font-black">預購已送出</h3>
        <p className="mt-3 text-sm leading-7 text-paper/70">
          我們會用 <span className="font-medium text-mango">{submitted.contact}</span>{" "}
          與你聯絡，確認出貨時間與付款方式。
        </p>
        <dl className="mt-6 divide-y divide-paper/15 border-y border-paper/15 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-6 py-3">
              <dt className="w-20 shrink-0 text-paper/50">{k}</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={again}
          className="mt-6 rounded-full border border-paper/40 px-8 py-3 text-sm transition-colors hover:border-paper hover:bg-paper hover:text-ink"
        >
          再預購一筆
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
      <label className="block">
        <span className="text-xs tracking-widest text-paper/55">姓名</span>
        {/* 輸入過稱呼就先帶入；key 讓稱呼晚於表單出現時也能更新 */}
        <input key={visitor ?? ""} name="name" required maxLength={40} defaultValue={visitor ?? ""} className="field" />
      </label>
      <label className="block">
        <span className="text-xs tracking-widest text-paper/55">電話或 Email</span>
        <input
          ref={contactInput}
          name="contact"
          required
          value={contact}
          onChange={(e) => {
            setContact(e.target.value);
            if (contactError) checkContact(e.target.value);
          }}
          onBlur={() => {
            if (contact.trim() === "") return; // 沒填就離開不報錯，等送出時再提醒
            const r = checkContact(contact);
            if (r.ok) setContact(r.value); // 手機整理成 0912-345-678
          }}
          inputMode="text"
          autoComplete="off"
          placeholder="0912-345-678 或 name@example.com"
          aria-invalid={contactError ? true : undefined}
          aria-describedby={contactError ? "contact-error" : undefined}
          className="field placeholder:text-paper/30"
        />
        {contactError && (
          <p id="contact-error" role="alert" className="mt-2 text-xs leading-5 text-[#ff9b8a]">
            {contactError}
          </p>
        )}
      </label>
      <label className="block">
        <span className="text-xs tracking-widest text-paper/55">品項</span>
        <select name="product" className="field">
          {products.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs tracking-widest text-paper/55">數量（箱）</span>
        <input name="qty" type="number" min={1} max={99} defaultValue={1} required className="field" />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs tracking-widest text-paper/55">優惠券代碼（選填）</span>
        <input
          name="coupon"
          value={coupon}
          maxLength={30}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="抽中的芒果 9 折優惠券會自動帶入"
          className="field placeholder:text-paper/30"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs tracking-widest text-paper/55">收件地址</span>
        <input name="address" required maxLength={200} className="field" />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-xs tracking-widest text-paper/55">備註</span>
        <input name="note" maxLength={500} className="field" />
      </label>
      <div className="sm:col-span-2">
        <div className="flex flex-wrap items-center gap-5">
          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-mango px-10 py-3 font-medium text-ink transition-colors hover:bg-paper disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-mango"
          >
            {sending ? "送出中…" : "送出預購"}
          </button>
          <p className="text-xs leading-6 text-paper/50">
            送出後我們會與你聯絡，確認出貨時間與付款方式。
          </p>
        </div>
        {status === "error" && serverMessage && (
          <p role="alert" className="mt-4 text-sm leading-6 text-[#ff9b8a]">
            {serverMessage}
          </p>
        )}
        <p className="mt-4 text-xs leading-6 text-paper/35">
          示範站：訂單目前只會送到伺服器接收端，尚未串接後台，不會真的保存。
        </p>
      </div>
    </form>
  );
}
