import { supabase } from "../_shared/supabase.ts";
import { verifyCronAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { getGoogleAccessToken, vertexAiUrl } from "../_shared/google-auth.ts";
import { getConfig, logPipelineEvent } from "../_shared/config.ts";

interface PromptResult {
  prompt: string;
  style: string;
  aspect_ratio: string;
}

const DEFAULT_IMAGE_PROMPT_TEMPLATE = `На основе описания пряника создай ДЕТАЛЬНЫЙ промпт для генерации изображения через Imagen 4.

СТРУКТУРА ПРОМПТА (40-80 слов, ТОЛЬКО на английском):
1. Subject: тип пряника, форма, количество
2. Decoration: тип глазури, цвета, узоры, техника
3. Composition: ракурс (overhead flat lay / 45 degree / macro close-up / arranged set)
4. Background: поверхность (wood board / marble / fabric / dark velvet / kraft paper)
5. Style: стиль фото (product photography / editorial / cozy / rustic / minimalist)
6. Lighting: освещение (soft studio / natural daylight / warm golden / dramatic side)
7. Quality: 4K, high detail, professional, sharp focus

КАТЕГОРИИ: {categories}
ТЕХНИКИ: {techniques}

ОПИСАНИЕ (RU):
{rewritten_text}

Ответь ТОЛЬКО в JSON:
{
  "prompt": "English prompt here...",
  "style": "product",
  "aspect_ratio": "1:1"
}`;

/**
 * Генерирует EN-промпт для Imagen 4 на основе рерайтнутого текста
 */
async function generateImagePrompt(
  rewrittenText: string,
  categories: string[],
  techniques: string[],
  accessToken: string
): Promise<PromptResult> {
  let template: string;
  try {
    template = await getConfig<string>(
      "image_prompt_template",
      DEFAULT_IMAGE_PROMPT_TEMPLATE
    );
  } catch {
    template = DEFAULT_IMAGE_PROMPT_TEMPLATE;
  }

  const prompt = template
    .replace("{rewritten_text}", rewrittenText)
    .replace("{categories}", categories.join(", "))
    .replace("{techniques}", techniques.join(", "));

  const model = await getConfig<string>("prompt_model", "gemini-2.5-flash");

  const response = await fetch(vertexAiUrl(model), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 500,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini prompt error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const resultText =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    return JSON.parse(resultText);
  } catch {
    throw new Error(
      `Failed to parse prompt generation response: ${resultText}`
    );
  }
}

Deno.serve(async (req) => {
  if (!verifyCronAuth(req)) {
    return unauthorizedResponse();
  }

  // Берём посты с готовым рерайтом
  const { data: posts } = await supabase
    .from("parsed_posts")
    .select("*")
    .eq("pipeline_status", "rewritten")
    .order("relevance_score", { ascending: false })
    .limit(5);

  if (!posts || posts.length === 0) {
    return Response.json({ message: "No posts for prompt generation" });
  }

  const accessToken = await getGoogleAccessToken();
  const results = [];

  for (const post of posts) {
    const startTime = Date.now();

    try {
      await supabase
        .from("parsed_posts")
        .update({ pipeline_status: "prompting" })
        .eq("id", post.id);

      const result = await generateImagePrompt(
        post.rewritten_text,
        post.detected_categories || [],
        post.detected_techniques || [],
        accessToken
      );

      await supabase
        .from("parsed_posts")
        .update({
          generated_prompt_en: result.prompt,
          prompt_style: result.style,
          prompt_aspect_ratio: result.aspect_ratio,
          pipeline_status: "prompted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      await logPipelineEvent({
        post_id: post.id,
        stage: "prompt",
        status: "completed",
        duration_ms: Date.now() - startTime,
        cost_usd: 0.002,
        metadata: {
          prompt_length: result.prompt.length,
          style: result.style,
          aspect_ratio: result.aspect_ratio,
        },
      });

      results.push({
        id: post.id,
        status: "prompted",
        prompt: result.prompt,
        style: result.style,
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
        stage: "prompt",
        status: "failed",
        duration_ms: Date.now() - startTime,
        error: errorMessage,
      });

      results.push({ id: post.id, error: errorMessage });
    }
  }

  return Response.json({ prompted: results });
});
