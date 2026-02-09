/**
 * Проверка CRON_SECRET для cron-вызовов Edge Functions
 */
export function verifyCronAuth(req: Request): boolean {
  const auth = req.headers.get("Authorization");
  return auth === `Bearer ${Deno.env.get("CRON_SECRET")}`;
}

/**
 * Проверка ADMIN_SECRET для админ-панели
 */
export function verifyAdminAuth(req: Request): boolean {
  const token = req.headers.get("X-Admin-Token");
  return token === Deno.env.get("ADMIN_SECRET");
}

/**
 * Проверка Telegram user_id в списке админов
 */
export function isAdmin(telegramUserId: number): boolean {
  const adminIds = (Deno.env.get("ADMIN_TELEGRAM_IDS") || "")
    .split(",")
    .map(Number)
    .filter(Boolean);
  return adminIds.includes(telegramUserId);
}

/**
 * Стандартный ответ 401
 */
export function unauthorizedResponse(): Response {
  return new Response("Unauthorized", { status: 401 });
}

/**
 * Стандартный ответ 403
 */
export function forbiddenResponse(): Response {
  return new Response("Forbidden", { status: 403 });
}
