/**
 * Telegram Bot API helper
 * Обёртка для вызовов Bot API
 */

const BOT_TOKEN = () => Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const API_BASE = () => `https://api.telegram.org/bot${BOT_TOKEN()}`;

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: { id: number; type: string };
  date: number;
  text?: string;
  photo?: Array<{ file_id: string; width: number; height: number }>;
  web_app_data?: { data: string };
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
  web_app?: { url: string };
}

/**
 * Отправить текстовое сообщение
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: {
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    reply_markup?: {
      inline_keyboard?: InlineKeyboardButton[][];
      keyboard?: Array<Array<{ text: string; web_app?: { url: string } }>>;
      resize_keyboard?: boolean;
      one_time_keyboard?: boolean;
    };
    disable_web_page_preview?: boolean;
  }
): Promise<unknown> {
  const res = await fetch(`${API_BASE()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || "HTML",
      reply_markup: options?.reply_markup,
      disable_web_page_preview: options?.disable_web_page_preview,
    }),
  });
  return res.json();
}

/**
 * Отправить фото
 */
export async function sendPhoto(
  chatId: number | string,
  photo: string,
  caption?: string,
  replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] }
): Promise<unknown> {
  const res = await fetch(`${API_BASE()}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      photo,
      caption,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
  return res.json();
}

/**
 * Отправить видео
 */
export async function sendVideo(
  chatId: number | string,
  video: string,
  caption?: string
): Promise<unknown> {
  const res = await fetch(`${API_BASE()}/sendVideo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      video,
      caption,
      parse_mode: "HTML",
    }),
  });
  return res.json();
}

/**
 * Отправить chat action (typing, upload_photo, etc.)
 */
export async function sendChatAction(
  chatId: number | string,
  action: "typing" | "upload_photo" | "upload_video"
): Promise<void> {
  await fetch(`${API_BASE()}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}

/**
 * Ответить на callback query
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert = false
): Promise<void> {
  await fetch(`${API_BASE()}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    }),
  });
}

/**
 * Редактировать сообщение
 */
export async function editMessageText(
  chatId: number | string,
  messageId: number,
  text: string,
  replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] }
): Promise<unknown> {
  const res = await fetch(`${API_BASE()}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
  return res.json();
}

/**
 * Удалить сообщение
 */
export async function deleteMessage(
  chatId: number | string,
  messageId: number
): Promise<void> {
  await fetch(`${API_BASE()}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
  });
}

/**
 * Установить webhook
 */
export async function setWebhook(webhookUrl: string): Promise<unknown> {
  const res = await fetch(`${API_BASE()}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message", "callback_query"],
    }),
  });
  return res.json();
}
