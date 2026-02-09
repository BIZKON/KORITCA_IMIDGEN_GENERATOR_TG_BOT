import { supabase } from "../_shared/supabase.ts";
import { getGoogleAccessToken, vertexAiUrl } from "../_shared/google-auth.ts";

/**
 * Генерация видео для пользователей через Veo (Vertex AI)
 * Видео генерируется асинхронно — возвращает operation_name для polling
 *
 * POST body:
 *   telegram_id: number
 *   user_id: string (UUID)
 *   prompt_ru: string
 *   aspect_ratio?: '16:9' | '9:16'
 *   model?: 'veo31_fast' | 'veo31'
 */

const MODEL_IDS: Record<string, string> = {
  veo31_fast: "veo-3.1-fast-generate-001",
  veo31: "veo-3.1-generate-001",
};

const MODEL_COSTS: Record<string, number> = {
  veo31_fast: 0.15,
  veo31: 0.35,
};

/**
 * Переводит RU промпт в EN для видео
 */
async function translateVideoPrompt(
  promptRu: string,
  accessToken: string
): Promise<string> {
  const systemPrompt = `Ты — переводчик промптов для генерации видео.
Переведи описание сцены с пряниками с русского на английский.
Добавь кинематографические детали:
- Camera movement (slow pan, dolly in, static)
- Atmosphere (cozy, warm, festive)
- Lighting (soft warm, golden hour, studio)
- Duration hint (short, smooth transition)

Ответь ТОЛЬКО переведённым промптом (30-60 слов).

Русский текст: ${promptRu}`;

  const response = await fetch(vertexAiUrl("gemini-2.5-flash"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 150 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini translate error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || promptRu;
}

/**
 * Запуск асинхронной генерации видео через Veo
 */
async function startVideoGeneration(
  promptEn: string,
  aspectRatio: string,
  model: string,
  accessToken: string
): Promise<string> {
  const modelId = MODEL_IDS[model] || MODEL_IDS.veo31_fast;
  const project = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID")!;
  const location = Deno.env.get("GOOGLE_CLOUD_LOCATION") || "us-central1";

  // Veo использует async predict (generateVideo)
  const response = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${modelId}:predictLongRunning`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt: promptEn }],
        parameters: {
          aspectRatio,
          sampleCount: 1,
          durationSeconds: 5,
          personGeneration: "allow_all",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Veo API error: ${response.status} ${errText}`);
  }

  const data = await response.json();

  // Возвращает LRO operation name
  const operationName = data.name;
  if (!operationName) {
    throw new Error("No operation name returned: " + JSON.stringify(data));
  }

  return operationName;
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
    const lastGen = user.last_generation_at
      ? new Date(user.last_generation_at)
      : null;
    const isNewDay =
      !lastGen ||
      lastGen.toISOString().slice(0, 10) !== now.toISOString().slice(0, 10);

    const todayCount = isNewDay ? 0 : user.generations_today;

    if (todayCount >= user.daily_limit && !user.is_admin) {
      return Response.json(
        { error: "Daily limit reached", limit: user.daily_limit },
        { status: 429 }
      );
    }

    const accessToken = await getGoogleAccessToken();

    // Переводим промпт
    const promptEn = await translateVideoPrompt(prompt_ru, accessToken);

    // Запускаем генерацию (async)
    const operationName = await startVideoGeneration(
      promptEn,
      aspect_ratio,
      model,
      accessToken
    );

    // Создаём запись генерации
    const { data: generation } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        telegram_id,
        prompt_ru,
        prompt_en: promptEn,
        media_type: "video",
        model,
        aspect_ratio,
        status: "generating",
        operation_name: operationName,
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
        operation_name: operationName,
        status: "generating",
        prompt_en: promptEn,
        message: "Video generation started. Use check-video-status to poll.",
      },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Generate video error:", errorMessage);

    return Response.json(
      { error: errorMessage },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});
