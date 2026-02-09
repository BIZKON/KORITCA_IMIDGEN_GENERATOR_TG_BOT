import { supabase } from "../_shared/supabase.ts";
import { getGoogleAccessToken, vertexAiUrl } from "../_shared/google-auth.ts";

/**
 * Генерация изображений для пользователей (из бота / Mini App)
 *
 * POST body:
 *   telegram_id: number
 *   user_id: string (UUID)
 *   prompt_ru: string
 *   aspect_ratio?: '1:1' | '4:3' | '3:4' | '9:16'
 *   model?: 'imagen4_fast' | 'imagen4'
 */

const MODEL_IDS: Record<string, string> = {
  imagen4_fast: "imagen-4.0-fast-generate-001",
  imagen4: "imagen-4.0-generate-001",
};

const MODEL_COSTS: Record<string, number> = {
  imagen4_fast: 0.02,
  imagen4: 0.04,
};

/**
 * Переводит RU промпт в EN через Gemini Flash
 */
async function translatePrompt(
  promptRu: string,
  accessToken: string
): Promise<string> {
  const systemPrompt = `Ты — переводчик промптов для генерации изображений.
Переведи описание пряника с русского на английский.
Добавь детали для качественной генерации:
- Lighting: soft studio lighting
- Style: professional product photography
- Quality: 4K, high detail, sharp focus
- Background: если не указан, добавь подходящий (wood, marble, fabric)

Ответь ТОЛЬКО переведённым промптом (40-80 слов), без пояснений.

Русский текст: ${promptRu}`;

  const response = await fetch(vertexAiUrl("gemini-2.5-flash"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini translate error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || promptRu;
}

/**
 * Генерирует изображение через Imagen 4
 */
async function generateImage(
  promptEn: string,
  aspectRatio: string,
  model: string,
  accessToken: string
): Promise<{ base64: string; mimeType: string }> {
  const modelId = MODEL_IDS[model] || MODEL_IDS.imagen4_fast;
  const project = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID")!;
  const location = Deno.env.get("GOOGLE_CLOUD_LOCATION") || "us-central1";

  const response = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${modelId}:predict`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt: promptEn }],
        parameters: {
          sampleCount: 1,
          aspectRatio,
          safetyFilterLevel: "block_few",
          personGeneration: "allow_all",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Imagen API error: ${response.status} ${errText}`);
  }

  const data = await response.json();

  if (!data.predictions?.[0]?.bytesBase64Encoded) {
    throw new Error(
      "No image generated: " + JSON.stringify(data.error || data)
    );
  }

  return {
    base64: data.predictions[0].bytesBase64Encoded,
    mimeType: data.predictions[0].mimeType || "image/png",
  };
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
      user_id,
      prompt_ru,
      aspect_ratio = "1:1",
      model = "imagen4_fast",
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
    const lastGen = user.last_generation_at
      ? new Date(user.last_generation_at)
      : null;
    const isNewDay =
      !lastGen ||
      lastGen.toISOString().slice(0, 10) !== now.toISOString().slice(0, 10);

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
        model,
        aspect_ratio,
        status: "generating",
      })
      .select()
      .single();

    if (!generation) {
      return Response.json(
        { error: "Failed to create generation record" },
        { status: 500 }
      );
    }

    // Получаем токен Google
    const accessToken = await getGoogleAccessToken();

    // Переводим промпт
    const promptEn = await translatePrompt(prompt_ru, accessToken);

    // Генерируем изображение
    const { base64, mimeType } = await generateImage(
      promptEn,
      aspect_ratio,
      model,
      accessToken
    );

    // Сохраняем в Storage
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const fileName = `users/${telegram_id}/${generation.id}.${ext}`;
    const imageData = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from("generations")
      .upload(fileName, imageData, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrl } = supabase.storage
      .from("generations")
      .getPublicUrl(fileName);

    const cost = MODEL_COSTS[model] || 0.02;
    const durationMs = Date.now() - startTime;

    // Обновляем генерацию
    await supabase
      .from("generations")
      .update({
        prompt_en: promptEn,
        status: "completed",
        image_url: publicUrl.publicUrl,
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
        image_url: publicUrl.publicUrl,
        prompt_en: promptEn,
        model,
        cost_usd: cost,
        duration_ms: durationMs,
        remaining_today: user.daily_limit - todayCount,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Generate image error:", errorMessage);

    return Response.json(
      { error: errorMessage },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});
