import { validateContact } from "@/lib/contact";

/** 客戶送出的預購資料（已驗證、已整理過的版本） */
export type Order = {
  name: string;
  contact: string;
  contactKind: "email" | "mobile" | "landline";
  product: string;
  qty: number;
  coupon: string;
  address: string;
  note: string;
};

export type OrderErrors = Partial<Record<keyof Order, string>>;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * 驗證並整理訂單。伺服器端一定要重新驗證一次——前端的檢查只是為了好用，擋不住直接打 API 的人。
 * 回傳整理後的 Order；任何欄位不合格就回傳 errors（欄位名稱 → 訊息）。
 */
export function validateOrder(input: unknown):
  | { ok: true; order: Order }
  | { ok: false; errors: OrderErrors } {
  const d = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const errors: OrderErrors = {};

  const name = str(d.name);
  if (!name) errors.name = "請輸入姓名";
  else if (name.length > 40) errors.name = "姓名太長（最多 40 字）";

  const c = validateContact(str(d.contact));
  if (!c.ok) errors.contact = c.message;

  const product = str(d.product);
  if (!product) errors.product = "請選擇品項";
  else if (product.length > 80) errors.product = "品項格式不正確";

  const qty = typeof d.qty === "number" ? d.qty : Number(str(d.qty));
  if (!Number.isInteger(qty) || qty < 1 || qty > 99) errors.qty = "數量請輸入 1 到 99 的整數";

  const coupon = str(d.coupon);
  if (coupon.length > 30) errors.coupon = "優惠券代碼太長";

  const address = str(d.address);
  if (!address) errors.address = "請輸入收件地址";
  else if (address.length > 200) errors.address = "地址太長（最多 200 字）";

  const note = str(d.note);
  if (note.length > 500) errors.note = "備註太長（最多 500 字）";

  if (Object.keys(errors).length > 0 || !c.ok) return { ok: false, errors };
  return {
    ok: true,
    order: { name, contact: c.value, contactKind: c.kind, product, qty, coupon, address, note },
  };
}
