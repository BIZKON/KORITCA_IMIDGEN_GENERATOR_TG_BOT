import { supabase } from "../_shared/supabase.ts";
import { verifyCronAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { getConfig } from "../_shared/config.ts";

/**
 * Планировщик очереди публикаций
 * Вызывается cron каждое воскресенье в 20:00 UTC
 * Берёт готовые посты (status = 'ready') и распределяет по расписанию на неделю
 */

Deno.serve(async (req) => {
  if (!verifyCronAuth(req)) {
    return unauthorizedResponse();
  }

  // Загружаем настройки расписания
  const scheduleMorning = await getConfig<string>("schedule_morning", "10:00");
  const scheduleEvening = await getConfig<string>("schedule_evening", "18:00");
  const scheduleDays = await getConfig<number[]>("schedule_days", [1, 2, 3, 4, 5, 6]);
  const videoPerWeek = await getConfig<number>("video_per_week", 2);
  const broadcastMode = await getConfig<string>("broadcast_mode", "personal");

  // Получаем готовые к публикации посты
  const { data: readyPosts } = await supabase
    .from("parsed_posts")
    .select("*")
    .in("pipeline_status", ["ready"])
    .order("quality_score", { ascending: false });

  if (!readyPosts || readyPosts.length === 0) {
    return Response.json({ message: "No ready posts to schedule" });
  }

  // Рассчитываем слоты на неделю
  // Каждый день из scheduleDays — 2 поста (утро + вечер)
  const slots: Date[] = [];
  const now = new Date();

  // Начинаем с завтрашнего дня (понедельника следующей недели)
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() + 1);

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);

    // JS: getDay() → 0=Вс, 1=Пн, ..., 6=Сб
    // Конфиг: 1=Пн, 2=Вт, ..., 7=Вс
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

    if (!scheduleDays.includes(dayOfWeek)) continue;

    // Утренний слот (МСК = UTC+3)
    const [morningH, morningM] = scheduleMorning.split(":").map(Number);
    const morningSlot = new Date(date);
    morningSlot.setUTCHours(morningH - 3, morningM, 0, 0); // МСК → UTC
    slots.push(morningSlot);

    // Вечерний слот
    const [eveningH, eveningM] = scheduleEvening.split(":").map(Number);
    const eveningSlot = new Date(date);
    eveningSlot.setUTCHours(eveningH - 3, eveningM, 0, 0);
    slots.push(eveningSlot);
  }

  // Распределяем посты по слотам
  const scheduled = [];
  const postsToSchedule = readyPosts.slice(0, slots.length);

  for (let i = 0; i < postsToSchedule.length && i < slots.length; i++) {
    const post = postsToSchedule[i];
    const scheduledAt = slots[i];

    // Создаём запись в auto_posts (если таблица существует)
    // или обновляем статус parsed_posts
    const { error } = await supabase.from("parsed_posts").update({
      pipeline_status: "queued",
      updated_at: new Date().toISOString(),
      // Сохраняем время публикации в metadata через admin_notes
      admin_notes: `scheduled:${scheduledAt.toISOString()}|mode:${broadcastMode}`,
    }).eq("id", post.id);

    if (!error) {
      scheduled.push({
        id: post.id,
        scheduled_at: scheduledAt.toISOString(),
        quality_score: post.quality_score,
      });
    }
  }

  return Response.json({
    scheduled: scheduled.length,
    total_slots: slots.length,
    total_ready: readyPosts.length,
    schedule: scheduled,
    timestamp: new Date().toISOString(),
  });
});
