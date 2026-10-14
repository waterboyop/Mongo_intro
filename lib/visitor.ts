/** 訪客稱呼的共用常數：Visitor 元件（client）與 layout 的預載腳本（server）都會用到 */
export const VISITOR_KEY = "mango-visitor-name";
export const VISITOR_EVENT = "mango-visitor-change";
export const VISITOR_MAX_LEN = 20;

/** 清理稱呼：去頭尾空白、限制長度；空的回傳 null */
export function cleanVisitorName(raw: string | null | undefined): string | null {
  const v = (raw ?? "").trim().slice(0, VISITOR_MAX_LEN);
  return v.length > 0 ? v : null;
}
