/**
 * 「電話或 Email」欄位驗證。
 * 有 @ 就當 Email 驗證，否則當台灣電話驗證（手機、市話、+886 寫法）。
 */

export type ContactResult =
  | { ok: true; kind: "email" | "mobile" | "landline"; value: string }
  | { ok: false; message: string };

// 實用型 Email 規則：本地部分不能以點開頭／結尾、不能連續兩個點；
// 網域至少一個點，每段不超過 63 字元、不以連字號開頭／結尾；頂級網域至少 2 個字母。
const EMAIL_LOCAL = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const TLD = /^[A-Za-z]{2,}$/;

export function isValidEmail(s: string): boolean {
  if (s.length > 254) return false;
  const at = s.indexOf("@");
  if (at < 1 || at !== s.lastIndexOf("@")) return false; // 必須剛好一個 @，且不在開頭
  const local = s.slice(0, at);
  const domain = s.slice(at + 1);
  if (local.length > 64 || !EMAIL_LOCAL.test(local)) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  if (!labels.every((l) => DOMAIN_LABEL.test(l))) return false;
  return TLD.test(labels[labels.length - 1]);
}

/** 整理成台灣國內號碼的純數字（0 開頭）；無法整理就回傳 null */
function toLocalDigits(raw: string): string | null {
  // 只允許數字與常見分隔符號（空白、-、.、括號），開頭可有一個 +
  if (!/^\+?[\d\s\-.()（）]+$/.test(raw)) return null;
  const plus = raw.startsWith("+");
  let digits = raw.replace(/\D/g, "");
  if (plus || (digits.startsWith("886") && digits.length >= 11)) {
    if (!digits.startsWith("886")) return null; // 其他國碼不支援
    digits = digits.slice(3).replace(/^0/, ""); // +886 後面的 0 要去掉（有人會多寫）
    digits = "0" + digits;
  }
  return digits;
}

const MOBILE = /^09\d{8}$/; // 09xx-xxx-xxx
const LANDLINE = /^0[2-8]\d{7,8}$/; // 區碼 02~08（含 037、049、082、089 等），加上 6~8 碼號碼

export function validateContact(input: string): ContactResult {
  const raw = input.trim();
  if (raw === "") return { ok: false, message: "請輸入電話或 Email" };

  if (raw.includes("@")) {
    return isValidEmail(raw)
      ? { ok: true, kind: "email", value: raw }
      : { ok: false, message: "Email 格式不正確，例如 name@example.com" };
  }

  if (/[A-Za-z一-鿿]/.test(raw)) {
    return { ok: false, message: "請輸入 Email（需包含 @）或電話號碼" };
  }

  const digits = toLocalDigits(raw);
  if (digits && MOBILE.test(digits)) {
    // 0912345678 -> 0912-345-678
    return { ok: true, kind: "mobile", value: `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}` };
  }
  if (digits && LANDLINE.test(digits)) {
    // 區碼長度不固定（02 / 037 / 0826…），不重排格式，只整理空白
    return { ok: true, kind: "landline", value: raw.replace(/\s+/g, " ") };
  }
  return {
    ok: false,
    message: "電話格式不正確，請輸入台灣手機（例如 0912-345-678）或市話（例如 02-1234-5678）",
  };
}
