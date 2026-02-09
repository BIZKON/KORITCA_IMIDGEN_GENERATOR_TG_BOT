import { supabase } from "../_shared/supabase.ts";
import { verifyCronAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { getConfig, logPipelineEvent } from "../_shared/config.ts";

/**
 * Автопубликация постов
 * Вызывается cron каждый час
 * Проверяет очередь и публикует посты, чей scheduled_at наступил
 */

/**
 * Отправка сообщения через Telegram Bot API
 */
async function sendTelegramPhoto(
  chatId: string | number,
  imageUrl: string,
  caption: string
): Promise<boolean> {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendPhoto`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: caption,
        parse_mode: "HTML",
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Telegram API error: ${response.status} ${errText}`);
  }

  return true;
}

/**
 * Парсит scheduled-время из admin_notes
 * Формат: "scheduled:2025-01-15T07:00:00.000Z|mode:personal"
 */
function parseScheduleInfo(
  adminNotes: string | null
): { scheduledAt: Date | null; mode: string } {
  if (!adminNotes) return { scheduledAt: null, mode: "personal" };

  const scheduledMatch = adminNotes.match(/scheduled:([^|]+)/);
  const modeMatch = adminNotes.match(/mode:(\w+)/);

  return {
    scheduledAt: scheduledMatch ? new Date(scheduledMatch[1]) : null,
    mode: modeMatch?.[1] || "personal",
  };
}

Deno.serve(async (req) => {
  if (!verifyCronAuth(req)) {
    return unauthorizedResponse();
  }

  const now = new Date();

  // Получаем посты в очереди
  const { data: queuedPosts } = await supabase
    .from("parsed_posts")
    .select("*")
    .eq("pipeline_status", "queued")
    .order("quality_score", { ascending: false });

  if (!queuedPosts || queuedPosts.length === 0) {
    return Response.json({ message: "No posts in queue" });
  }

  // Фильтруем посты, чей scheduled_at уже наступил
  const postsToPublish = queuedPosts.filter((post) => {
    const { scheduledAt } = parseScheduleInfo(post.admin_notes);
    if (!scheduledAt) return false;
    return scheduledAt <= now;
  });

  if (postsToPublish.length === 0) {
    return Response.json({
      message: "No posts ready to publish yet",
      next_check: "in 1 hour",
      queued_count: queuedPosts.length,
    });
  }

  const broadcastMode = await getConfig<string>("broadcast_mode", "personal");
  const results = [];

  for (const post of postsToPublish) {
    const startTime = Date.now();
    const { mode } = parseScheduleInfo(post.admin_notes);
    const publishMode = mode || broadcastMode;

    try {
      if (!post.generated_image_url || !post.rewritten_text) {
        throw new Error("Missing image URL or caption text");
      }

      let published = false;

      // Публикация в канал
      if (publishMode === "channel" || publishMode === "both") {
        const channelId = Deno.env.get("TELEGRAM_CHANNEL_ID");
        if (channelId) {
          await sendTelegramPhoto(
            channelId,
            post.generated_image_url,
            post.rewritten_text
          );
          published = true;
        }
      }

      // Broadcast пользователям бота
      if (publishMode === "personal" || publishMode === "both") {
        // Получаем активных пользователей из таблицы users
        const { data: users } = await supabase
          .from("users")
          .select("telegram_id")
          .eq("is_active", true);

        if (users && users.length > 0) {
          let sentCount = 0;
          for (const user of users) {
            try {
              await sendTelegramPhoto(
                user.telegram_id,
                post.generated_image_url,
                post.rewritten_text
              );
              sentCount++;

              // Rate limiting: 30 сообщений в секунду (Telegram limit)
              if (sentCount % 25 === 0) {
                await new Promise((r) => setTimeout(r, 1000));
              }
            } catch {
              // Пользователь заблокировал бота — пропускаем
              continue;
            }
          }
          published = sentCount > 0;
        }
      }

      // Обновляем статус
      await supabase
        .from("parsed_posts")
        .update({
          pipeline_status: "published",
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      await logPipelineEvent({
        post_id: post.id,
        stage: "publish",
        status: "completed",
        duration_ms: Date.now() - startTime,
        metadata: { mode: publishMode, published },
      });

      results.push({
        id: post.id,
        status: "published",
        mode: publishMode,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);

      await supabase
        .from("parsed_posts")
        .update({
          pipeline_status: "failed",
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      await logPipelineEvent({
        post_id: post.id,
        stage: "publish",
        status: "failed",
        duration_ms: Date.now() - startTime,
        error: errorMessage,
      });

      results.push({ id: post.id, error: errorMessage });
    }
  }

  return Response.json({
    published: results,
    timestamp: new Date().toISOString(),
  });
});
