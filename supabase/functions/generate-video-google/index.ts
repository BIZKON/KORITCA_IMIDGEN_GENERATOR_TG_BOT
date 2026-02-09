import { supabase } from "../_shared/supabase.ts";
import {
  prompt as aiPrompt,
  generateVideo,
  CHAT_MODELS,
  VIDEO_MODELS,
} from "../_shared/atlas-cloud.ts";

/**
 * Генерация видео для пользователей через AtlasCloud (Veo 3.1)
 * Видео генерируется асинхронно — возвращает task ID для polling
 *
 * POST body:
 *   telegram_id: number
 *   prompt_ru: string
 *   aspect_ratio?: '16:9' | '9:16'
 *   model?: 'veo31_fast' | 'veo31'
 */

async function translateVideoPrompt(promptRu: string): Promise<string> {
  return aiPrompt(
    CHAT_MODELS["gemini-flash"],
    `Переведи описание сцены с пряниками с русского на английский для генерации видео.
Добавь кинематографические детали: camera movement, atmosphere, lighting.
Ответь ТОЛЬКО переведённым промптом (30-60 слов).

Русский текст: ${promptRu}`,
    { temperature: 0.3, max_tokens: 150 }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const {
      telegram_id,
      prompt_ru,
      aspect_ratio = "16:9",
      model = "veo31_fast",
    } = body;

    if (!telegram_id || !prompt_ru) {
      return Response.json(
        { error: "telegram_id and prompt_ru are required" },
        { status: 400 }
      );
    }

    // Проверяем пользователя
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegram_id)
      .single();

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Сброс дневного лимита
    const now = new Date();
    const lastGen = user.last_generation_at ? new Date(user.last_generation_at) : null;
    const isNewDay = !lastGen || lastGen.toISOString().slice(0, 10) !== now.toISOString().slice(0, 10);
    const todayCount = isNewDay ? 0 : user.generations_today;

    if (todayCount >= user.daily_limit && !user.is_admin) {
      return Response.json(
        { error: "Daily limit reached", limit: user.daily_limit },
        { status: 429 }
      );
    }

    // Переводим промпт
    const promptEn = await translateVideoPrompt(prompt_ru);

    // Определяем модель AtlasCloud
    const atlasModel = VIDEO_MODELS[model as keyof typeof VIDEO_MODELS] || VIDEO_MODELS.veo31_fast;

    // Запускаем генерацию (async)
    const videoResult = await generateVideo(atlasModel, promptEn, {
      aspect_ratio,
      duration: 5,
      generate_audio: false,
    });

    // AtlasCloud возвращает task ID для polling
    const taskId = videoResult.id;
    if (!taskId) {
      throw new Error("No task ID returned: " + JSON.stringify(videoResult));
    }

    // Создаём запись генерации
    const { data: generation } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        telegram_id,
        prompt_ru,
        prompt_en: promptEn,
        media_type: "video",
        model: atlasModel,
        aspect_ratio,
        status: "generating",
        operation_name: taskId,  // Сохраняем AtlasCloud task ID
      })
      .select()
      .single();

    // Обновляем счётчики
    await supabase
      .from("users")
      .update({
        generations_count: (user.generations_count || 0) + 1,
        generations_today: todayCount + 1,
        last_generation_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", user.id);

    return Response.json(
      {
        generation_id: generation?.id,
        task_id: taskId,
        status: "generating",
        prompt_en: promptEn,
        message: "Video generation started. Use check-video-status to poll.",
      },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Generate video error:", errorMessage);
    return Response.json(
      { error: errorMessage },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
});
