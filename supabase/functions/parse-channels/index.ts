import { DOMParser } from "deno-dom";
import { supabase } from "../_shared/supabase.ts";
import { verifyCronAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { getConfig, logPipelineEvent } from "../_shared/config.ts";

interface ParsedPost {
  telegram_post_id: string;
  text: string;
  image_urls: string[];
  date: string;
  views: number;
}

/**
 * Парсит публичную версию ТГ-канала через t.me/s/
 * Не требует авторизации, не нарушает ToS
 */
async function parseChannel(
  username: string,
  lastPostId?: string | null
): Promise<ParsedPost[]> {
  const url = `https://t.me/s/${username}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (!doc) throw new Error("Failed to parse HTML");

  const posts: ParsedPost[] = [];
  const postElements = doc.querySelectorAll(".tgme_widget_message_wrap");

  for (const el of postElements) {
    const postLink = el
      .querySelector(".tgme_widget_message")
      ?.getAttribute("data-post");
    if (!postLink) continue;

    const postId = postLink.split("/").pop() || "";

    // Инкрементальный парсинг — пропускаем уже обработанные
    if (lastPostId && parseInt(postId) <= parseInt(lastPostId)) continue;

    const textEl = el.querySelector(".tgme_widget_message_text");
    const text = textEl?.textContent?.trim() || "";

    // Извлекаем изображения из background-image стилей
    const imageEls = el.querySelectorAll(
      ".tgme_widget_message_photo_wrap"
    );
    const image_urls: string[] = [];
    for (const img of imageEls) {
      const style = img.getAttribute("style") || "";
      const match = style.match(/url\('(.+?)'\)/);
      if (match) image_urls.push(match[1]);
    }

    // Просмотры
    const viewsEl = el.querySelector(".tgme_widget_message_views");
    const viewsText = viewsEl?.textContent?.trim() || "0";
    const views = parseViews(viewsText);

    // Дата публикации
    const dateEl = el.querySelector("time");
    const date = dateEl?.getAttribute("datetime") || new Date().toISOString();

    // Пропускаем посты без текста и без фото
    if (!text && image_urls.length === 0) continue;

    posts.push({ telegram_post_id: postId, text, image_urls, date, views });
  }

  return posts;
}

/**
 * Парсит строку просмотров: "12.5K" → 12500, "1.2M" → 1200000
 */
function parseViews(text: string): number {
  const cleaned = text.replace(/\s/g, "");
  if (cleaned.endsWith("K")) return Math.round(parseFloat(cleaned) * 1000);
  if (cleaned.endsWith("M")) return Math.round(parseFloat(cleaned) * 1000000);
  return parseInt(cleaned) || 0;
}

Deno.serve(async (req) => {
  if (!verifyCronAuth(req)) {
    return unauthorizedResponse();
  }

  // Проверяем включён ли парсинг
  const parseEnabled = await getConfig<boolean>("parse_enabled", true);
  if (!parseEnabled) {
    return Response.json({ message: "Parsing disabled" });
  }

  // Получаем активные каналы
  const { data: channels, error } = await supabase
    .from("monitored_channels")
    .select("*")
    .eq("status", "active");

  if (error || !channels) {
    return Response.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }

  if (channels.length === 0) {
    return Response.json({ message: "No active channels" });
  }

  const maxPosts = await getConfig<number>("max_posts_per_parse", 20);
  const results = [];

  for (const channel of channels) {
    const startTime = Date.now();

    try {
      const posts = await parseChannel(channel.username, channel.last_post_id);

      if (posts.length === 0) {
        results.push({ channel: channel.username, new_posts: 0 });
        continue;
      }

      const limitedPosts = posts.slice(0, maxPosts);

      // Сохраняем посты (upsert для дедупликации)
      const insertData = limitedPosts.map((post) => ({
        channel_id: channel.id,
        channel_username: channel.username,
        telegram_post_id: post.telegram_post_id,
        original_text: post.text,
        original_image_urls: post.image_urls,
        post_date: post.date,
        post_views: post.views,
        pipeline_status: "parsed",
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("parsed_posts")
        .upsert(insertData, {
          onConflict: "channel_username,telegram_post_id",
          ignoreDuplicates: true,
        })
        .select();

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      // Обновляем метаданные канала
      const lastId =
        limitedPosts[limitedPosts.length - 1]?.telegram_post_id;
      await supabase
        .from("monitored_channels")
        .update({
          last_parsed_at: new Date().toISOString(),
          last_post_id: lastId || channel.last_post_id,
          posts_found: (channel.posts_found || 0) + (inserted?.length || 0),
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", channel.id);

      await logPipelineEvent({
        stage: "parse",
        status: "completed",
        duration_ms: Date.now() - startTime,
        metadata: {
          channel: channel.username,
          posts_found: posts.length,
          posts_saved: inserted?.length || 0,
        },
      });

      results.push({
        channel: channel.username,
        new_posts: inserted?.length || 0,
        total_found: posts.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);

      // Помечаем канал как ошибочный
      await supabase
        .from("monitored_channels")
        .update({
          status: "error",
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", channel.id);

      await logPipelineEvent({
        stage: "parse",
        status: "failed",
        duration_ms: Date.now() - startTime,
        error: errorMessage,
        metadata: { channel: channel.username },
      });

      results.push({ channel: channel.username, error: errorMessage });
    }
  }

  return Response.json({
    parsed: results,
    timestamp: new Date().toISOString(),
  });
});
