import { validateOrder } from "@/lib/order";

const MAX_BODY_BYTES = 10_000;

/**
 * 接收預購訂單。
 *
 * ⚠ 目前還沒有後台：這裡只做驗證，**不會保存任何資料**。
 * 之後要存起來，只要改下面 TODO 那一處（寫入資料庫、寄通知信、轉給別的後端…），
 * 前端（components/OrderForm.tsx）不用動。
 */
export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return Response.json({ ok: false, message: "資料太大" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ ok: false, message: "資料格式不正確" }, { status: 400 });
  }

  const result = validateOrder(body);
  if (!result.ok) {
    return Response.json({ ok: false, message: "資料有誤", errors: result.errors }, { status: 400 });
  }

  // TODO: 在這裡保存訂單（例如寫入資料庫），並視需要通知店家。
  // 開發時先印出來，方便確認資料真的有送到伺服器；正式上線前請拿掉（內含個資）。
  if (process.env.NODE_ENV === "development") {
    console.info("[orders] 收到訂單（尚未保存）:", result.order);
  }

  return Response.json({ ok: true }, { status: 201 });
}
