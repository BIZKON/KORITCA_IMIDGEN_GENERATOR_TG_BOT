import { supabase } from "../_shared/supabase.ts";
import { isAdmin } from "../_shared/auth.ts";
import {
  sendMessage,
  sendPhoto,
  sendChatAction,
  answerCallbackQuery,
  editMessageText,
  type TelegramUpdate,
  type TelegramMessage,
  type TelegramCallbackQuery,
  type TelegramUser,
} from "../_shared/telegram.ts";

// ── Константы ────────────────────────────────────────────────

const MINI_APP_URL = Deno.env.get("MINI_APP_URL") || "";

const WELCOME_TEXT = `🍪 <b>Добро пожаловать в Пряничную школу!</b>

Я помогу создать уникальные изображения пряников с помощью AI.

🎨 <b>Что я умею:</b>
• Генерировать фото пряников по описанию
• Создавать видео-карточки
• Вдохновлять новыми идеями дизайна

Нажмите кнопку ниже, чтобы открыть генератор 👇`;

const HELP_TEXT = `🍪 <b>Пряничная школа — Помощь</b>

<b>Команды:</b>
/start — Начать работу
/generate — Создать изображение
/help — Эта справка
/stats — Моя статистика

<b>Как создать изображение:</b>
1. Нажмите "🎨 Генератор" или /generate
2. Опишите пряник на русском
3. AI создаст уникальное изображение

<b>Лимиты:</b>
• 3 генерации в день (бесплатно)
• Сброс лимита в 00:00 МСК`;

// ── Работа с пользователями ──────────────────────────────────

async function ensureUser(tgUser: TelegramUser) {
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", tgUser.id)
    .single();

  if (existing) {
    // Сброс дневного лимита если новый день
    const lastGen = existing.last_generation_at
      ? new Date(existing.last_generation_at)
      : null;
    const now = new Date();
    const isNewDay =
      !lastGen ||
      lastGen.toISOString().slice(0, 10) !== now.toISOString().slice(0, 10);

    if (isNewDay && existing.generations_today > 0) {
      await supabase
        .from("users")
        .update({ generations_today: 0, updated_at: now.toISOString() })
        .eq("id", existing.id);
      existing.generations_today = 0;
    }

    return existing;
  }

  // Создаём нового пользователя
  const referralCode = `ref_${tgUser.id}_${Date.now().toString(36)}`;
  const { data: newUser } = await supabase
    .from("users")
    .insert({
      telegram_id: tgUser.id,
      username: tgUser.username || null,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name || null,
      language_code: tgUser.language_code || "ru",
      is_premium: tgUser.is_premium || false,
      is_admin: isAdmin(tgUser.id),
      referral_code: referralCode,
    })
    .select()
    .single();

  return newUser;
}

// ── Обработка команд ─────────────────────────────────────────

async function handleStart(chatId: number, tgUser: TelegramUser, args?: string) {
  const user = await ensureUser(tgUser);

  // Обработка реферальной ссылки
  if (args && args.startsWith("ref_") && user) {
    const { data: referrer } = await supabase
      .from("users")
      .select("id")
      .eq("referral_code", args)
      .single();

    if (referrer && !user.referred_by) {
      await supabase
        .from("users")
        .update({ referred_by: referrer.id })
        .eq("id", user.id);
    }
  }

  const keyboard: { inline_keyboard: Array<Array<{ text: string; web_app?: { url: string }; callback_data?: string }>> } = {
    inline_keyboard: [],
  };

  if (MINI_APP_URL) {
    keyboard.inline_keyboard.push([
      { text: "🎨 Открыть генератор", web_app: { url: MINI_APP_URL } },
    ]);
  }

  keyboard.inline_keyboard.push(
    [{ text: "📸 Создать фото", callback_data: "gen_photo" }],
    [{ text: "🎬 Создать видео", callback_data: "gen_video" }],
    [{ text: "📊 Моя статистика", callback_data: "my_stats" }]
  );

  // Админ-кнопки
  if (user?.is_admin) {
    keyboard.inline_keyboard.push([
      { text: "⚙️ Админ-панель", callback_data: "admin_panel" },
    ]);
  }

  await sendMessage(chatId, WELCOME_TEXT, { reply_markup: keyboard });
}

async function handleGenerate(chatId: number, tgUser: TelegramUser) {
  const user = await ensureUser(tgUser);
  if (!user) return;

  // Проверка лимита
  if (user.generations_today >= user.daily_limit && !user.is_admin) {
    await sendMessage(
      chatId,
      `⏳ Вы достигли дневного лимита (${user.daily_limit} генераций).\n\nСброс в 00:00 МСК.`
    );
    return;
  }

  const remaining = user.daily_limit - user.generations_today;

  await sendMessage(chatId, `🎨 <b>Создание изображения</b>\n\nОпишите пряник, который хотите сгенерировать.\n\n<i>Например: "Новогодний пряник в форме ёлки с белой глазурью и снежинками"</i>\n\n📊 Осталось генераций сегодня: <b>${remaining}</b>`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "❌ Отмена", callback_data: "cancel" }],
      ],
    },
  });

  // Сохраняем состояние ожидания промпта
  await supabase
    .from("users")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", user.id);
}

async function handleStats(chatId: number, tgUser: TelegramUser) {
  const user = await ensureUser(tgUser);
  if (!user) return;

  const { count: totalGens } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  const remaining = user.daily_limit - user.generations_today;

  const text = `📊 <b>Ваша статистика</b>

👤 ${user.first_name} ${user.last_name || ""}
🆔 ${user.telegram_id}

🎨 Всего генераций: <b>${totalGens || 0}</b>
📅 Сегодня: <b>${user.generations_today}</b> / ${user.daily_limit}
⏳ Осталось: <b>${remaining}</b>

🔗 Реферальная ссылка:
<code>https://t.me/${Deno.env.get("BOT_USERNAME")}?start=${user.referral_code}</code>`;

  await sendMessage(chatId, text);
}

async function handleHelp(chatId: number) {
  await sendMessage(chatId, HELP_TEXT);
}

// ── Обработка текстовых сообщений (промпт для генерации) ─────

async function handleTextMessage(chatId: number, text: string, tgUser: TelegramUser) {
  const user = await ensureUser(tgUser);
  if (!user) return;

  // Проверка лимита
  if (user.generations_today >= user.daily_limit && !user.is_admin) {
    await sendMessage(
      chatId,
      `⏳ Лимит исчерпан (${user.daily_limit}/день). Сброс в 00:00 МСК.`
    );
    return;
  }

  // Показываем "загрузку"
  await sendChatAction(chatId, "upload_photo");

  const statusMsg = await sendMessage(chatId, "🎨 Генерирую изображение...\n\n⏳ Обычно это занимает 10-30 секунд") as { result?: { message_id: number } };

  try {
    // Вызываем generate-image-google
    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const response = await fetch(
      `${baseUrl}/functions/v1/generate-image-google`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegram_id: tgUser.id,
          user_id: user.id,
          prompt_ru: text,
          aspect_ratio: "1:1",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    // Удаляем сообщение "генерирую..."
    if (statusMsg?.result?.message_id) {
      await editMessageText(
        chatId,
        statusMsg.result.message_id,
        "✅ Готово!"
      ).catch(() => {});
    }

    // Отправляем результат
    const remaining = user.daily_limit - user.generations_today - 1;
    await sendPhoto(
      chatId,
      result.image_url,
      `🍪 <b>Ваш пряник готов!</b>\n\n📝 ${text}\n\n📊 Осталось генераций: ${remaining}`,
      {
        inline_keyboard: [
          [
            { text: "🔄 Ещё", callback_data: "gen_photo" },
            { text: "📊 Статистика", callback_data: "my_stats" },
          ],
        ],
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (statusMsg?.result?.message_id) {
      await editMessageText(
        chatId,
        statusMsg.result.message_id,
        `❌ Ошибка генерации: ${errorMessage}\n\nПопробуйте ещё раз или измените описание.`
      ).catch(() => {});
    }
  }
}

// ── Обработка callback кнопок ────────────────────────────────

async function handleCallback(callback: TelegramCallbackQuery) {
  const chatId = callback.message?.chat.id;
  if (!chatId) return;

  await answerCallbackQuery(callback.id);

  switch (callback.data) {
    case "gen_photo":
      await handleGenerate(chatId, callback.from);
      break;

    case "gen_video": {
      const user = await ensureUser(callback.from);
      if (user && user.generations_today >= user.daily_limit && !user.is_admin) {
        await sendMessage(chatId, "⏳ Лимит исчерпан. Сброс в 00:00 МСК.");
        break;
      }
      await sendMessage(
        chatId,
        "🎬 <b>Создание видео</b>\n\nОпишите сцену с пряниками для видео.\n\n<i>Например: \"Пряничный домик с дымком из трубы, падает снег\"</i>",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Отмена", callback_data: "cancel" }],
            ],
          },
        }
      );
      break;
    }

    case "my_stats":
      await handleStats(chatId, callback.from);
      break;

    case "admin_panel": {
      if (!isAdmin(callback.from.id)) {
        await sendMessage(chatId, "⛔ Доступ запрещён");
        break;
      }
      await handleAdminPanel(chatId);
      break;
    }

    case "admin_stats":
      await handleAdminStats(chatId, callback.from);
      break;

    case "admin_trigger_parse":
      await handleAdminTrigger(chatId, callback.from, "parse-channels");
      break;

    case "admin_trigger_pipeline":
      await handleAdminTrigger(chatId, callback.from, "pipeline-orchestrator");
      break;

    case "cancel":
      if (callback.message?.message_id) {
        await editMessageText(chatId, callback.message.message_id, "❌ Отменено");
      }
      break;
  }
}

// ── Админ-функции ────────────────────────────────────────────

async function handleAdminPanel(chatId: number) {
  // Быстрая статистика
  const { count: usersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: channelsCount } = await supabase
    .from("monitored_channels")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: queueCount } = await supabase
    .from("parsed_posts")
    .select("*", { count: "exact", head: true })
    .eq("pipeline_status", "queued");

  const { count: readyCount } = await supabase
    .from("parsed_posts")
    .select("*", { count: "exact", head: true })
    .eq("pipeline_status", "ready");

  const text = `⚙️ <b>Админ-панель</b>

👥 Активных пользователей: <b>${usersCount || 0}</b>
📡 Каналов парсинга: <b>${channelsCount || 0}</b>
📮 В очереди: <b>${queueCount || 0}</b>
✅ Готово к публикации: <b>${readyCount || 0}</b>`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📊 Подробная статистика", callback_data: "admin_stats" }],
        [{ text: "▶️ Запуск парсинга", callback_data: "admin_trigger_parse" }],
        [{ text: "🔄 Запуск пайплайна", callback_data: "admin_trigger_pipeline" }],
      ],
    },
  });
}

async function handleAdminStats(chatId: number, tgUser: TelegramUser) {
  if (!isAdmin(tgUser.id)) return;

  const baseUrl = Deno.env.get("SUPABASE_URL")!;
  const adminSecret = Deno.env.get("ADMIN_SECRET")!;

  const response = await fetch(`${baseUrl}/functions/v1/admin-api/stats`, {
    headers: { "X-Admin-Token": adminSecret },
  });

  const stats = await response.json();

  const text = `📊 <b>Статистика пайплайна</b>

<b>Каналы:</b>
${Object.entries(stats.channels || {}).map(([k, v]) => `• ${k}: ${v}`).join("\n") || "нет данных"}

<b>Пайплайн:</b>
${Object.entries(stats.pipeline || {}).map(([k, v]) => `• ${k}: ${v}`).join("\n") || "нет данных"}

💰 Расходы за неделю: <b>$${stats.cost_week_usd || "0"}</b>`;

  await sendMessage(chatId, text);
}

async function handleAdminTrigger(
  chatId: number,
  tgUser: TelegramUser,
  functionName: string
) {
  if (!isAdmin(tgUser.id)) return;

  await sendMessage(chatId, `⏳ Запускаю ${functionName}...`);

  const baseUrl = Deno.env.get("SUPABASE_URL")!;
  const cronSecret = Deno.env.get("CRON_SECRET")!;

  try {
    const response = await fetch(
      `${baseUrl}/functions/v1/${functionName}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${cronSecret}` },
      }
    );

    const result = await response.json();
    await sendMessage(
      chatId,
      `✅ <b>${functionName}</b> завершён:\n\n<pre>${JSON.stringify(result, null, 2).slice(0, 3000)}</pre>`
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await sendMessage(chatId, `❌ Ошибка: ${errorMessage}`);
  }
}

// ── Главный обработчик webhook ───────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  try {
    const update: TelegramUpdate = await req.json();

    // Обработка callback-кнопок
    if (update.callback_query) {
      await handleCallback(update.callback_query);
      return new Response("OK");
    }

    // Обработка сообщений
    const message = update.message;
    if (!message?.from || !message.chat) {
      return new Response("OK");
    }

    const chatId = message.chat.id;
    const text = message.text?.trim() || "";
    const tgUser = message.from;

    // Команды
    if (text.startsWith("/start")) {
      const args = text.split(" ")[1]; // /start ref_123
      await handleStart(chatId, tgUser, args);
    } else if (text === "/generate" || text === "/gen") {
      await handleGenerate(chatId, tgUser);
    } else if (text === "/stats") {
      await handleStats(chatId, tgUser);
    } else if (text === "/help") {
      await handleHelp(chatId);
    } else if (text === "/admin" && isAdmin(tgUser.id)) {
      await handleAdminPanel(chatId);
    } else if (text && !text.startsWith("/")) {
      // Обычный текст → генерация изображения
      await handleTextMessage(chatId, text, tgUser);
    }

    return new Response("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("OK"); // Всегда 200, чтобы Telegram не ретраил
  }
});
