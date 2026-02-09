import { supabase } from "../_shared/supabase.ts";
import {
  prompt as aiPrompt,
  generateImage,
  CHAT_MODELS,
  IMAGE_MODELS,
  IMAGE_COSTS,
} from "../_shared/atlas-cloud.ts";

/**
 * Генерация изображений для пользователей (из бота / Mini App)
 * Теперь через AtlasCloud API (Imagen 4 + Gemini Flash)
 *
 * POST body:
 *   telegram_id: number
 *   user_id: string (UUID)
 *   prompt_ru: string
 *   aspect_ratio?: '1:1' | '4:3' | '3:4' | '9:16'
 */

/**
 * Переводит RU промпт в EN через Gemini Flash (AtlasCloud)
 */
async function translatePrompt(promptRu: string): Promise<string> {
  return aiPrompt(
    CHAT_MODELS["gemini-flash"],
    `Переведи описание пряника с русского на английский для генерации изображения.
Добавь детали: soft studio lighting, professional product photography, 4K, high detail, sharp focus.
Если не указан фон — добавь подходящий (wood, marble, fabric).
Ответь ТОЛЬКО переведённым промптом (40-80 слов), без пояснений.

Русский текст: ${promptRu}`,
    { temperature: 0.3, max_tokens: 200 }
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

  const startTime = Date.now();

  try {
    const body = await req.json();
    const {
      telegram_id,
      prompt_ru,
      aspect_ratio = "1:1",
    } = body;

    if (!telegram_id || !prompt_ru) {
      return Response.json(
        { error: "telegram_id and prompt_ru are required" },
        { status: 400 }
      );
    }

    // Проверяем пользователя и лимиты
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
    let todayCount = isNewDay ? 0 : user.generations_today;

    if (todayCount >= user.daily_limit && !user.is_admin) {
      return Response.json(
        { error: "Daily limit reached", limit: user.daily_limit },
        { status: 429 }
      );
    }

    // Создаём запись генерации
    const { data: generation } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        telegram_id,
        prompt_ru,
        media_type: "photo",
        model: IMAGE_MODELS.imagen4,
        aspect_ratio,
        status: "generating",
      })
      .select()
      .single();

    if (!generation) {
      return Response.json({ error: "Failed to create generation" }, { status: 500 });
    }

    // Переводим промпт через Gemini
    const promptEn = await translatePrompt(prompt_ru);

    // Генерируем изображение через AtlasCloud Imagen 4
    const imageResult = await generateImage(
      IMAGE_MODELS.imagen4,
      promptEn,
      { aspect_ratio }
    );

    const imageUrl = imageResult.outputs?.[0];
    if (!imageUrl) {
      throw new Error("No image URL in response");
    }

    const cost = IMAGE_COSTS[IMAGE_MODELS.imagen4] || 0.02;
    const durationMs = Date.now() - startTime;

    // Обновляем генерацию
    await supabase
      .from("generations")
      .update({
        prompt_en: promptEn,
        status: "completed",
        image_url: imageUrl,
        cost_usd: cost,
        duration_ms: durationMs,
        completed_at: now.toISOString(),
      })
      .eq("id", generation.id);

    // Обновляем счётчики пользователя
    todayCount += 1;
    await supabase
      .from("users")
      .update({
        generations_count: (user.generations_count || 0) + 1,
        generations_today: todayCount,
        last_generation_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", user.id);

    return Response.json(
      {
        generation_id: generation.id,
        image_url: imageUrl,
        prompt_en: promptEn,
        model: IMAGE_MODELS.imagen4,
        cost_usd: cost,
        duration_ms: durationMs,
        remaining_today: user.daily_limit - todayCount,
      },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Generate image error:", errorMessage);
    return Response.json(
      { error: errorMessage },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
});
