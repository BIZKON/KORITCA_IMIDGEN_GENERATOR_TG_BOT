import { supabase } from "../_shared/supabase.ts";
import { verifyCronAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { getGoogleAccessToken, vertexAiUrl } from "../_shared/google-auth.ts";
import { getConfig, logPipelineEvent } from "../_shared/config.ts";

interface AnalysisResult {
  relevance_score: number;
  categories: string[];
  techniques: string[];
  analysis: string;
}

const ANALYSIS_PROMPT = `Ты — эксперт по пряничному искусству. Проанализируй пост из Telegram-канала.

ЗАДАЧА:
1. Оцени релевантность к теме "пряники, печенье, имбирное печенье, глазурь, айсинг, royal icing" (0-100)
2. Определи категории (новогодние, свадебные, детские, корпоративные, пасхальные, повседневные, мастер-класс)
3. Определи техники (айсинг, глазурь, мастика, роспись, 3D, заливка, контур, кружево)
4. Кратко опиши что на фото/в тексте

ТЕКСТ ПОСТА:
{text}

{photo_info}

Ответь ТОЛЬКО в JSON:
{
  "relevance_score": число 0-100,
  "categories": ["категория1", "категория2"],
  "techniques": ["техника1"],
  "analysis": "краткое описание в 1-2 предложения"
}`;

/**
 * Анализ поста через Gemini Flash — определяет релевантность
 */
async function analyzePost(
  text: string,
  imageUrls: string[],
  accessToken: string
): Promise<AnalysisResult> {
  const photoInfo =
    imageUrls.length > 0
      ? `Фото: ${imageUrls.length} шт.`
      : "Без фото";

  const prompt = ANALYSIS_PROMPT
    .replace("{text}", text)
    .replace("{photo_info}", photoInfo);

  const response = await fetch(
    vertexAiUrl("gemini-2.5-flash"),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const resultText =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    return JSON.parse(resultText);
  } catch {
    throw new Error(`Failed to parse Gemini response: ${resultText}`);
  }
}

Deno.serve(async (req) => {
  if (!verifyCronAuth(req)) {
    return unauthorizedResponse();
  }

  // Берём неанализированные посты (batch по 10)
  const { data: posts } = await supabase
    .from("parsed_posts")
    .select("*")
    .eq("pipeline_status", "parsed")
    .order("created_at", { ascending: true })
    .limit(10);

  if (!posts || posts.length === 0) {
    return Response.json({ message: "No posts to analyze" });
  }

  const accessToken = await getGoogleAccessToken();
  const minScore = await getConfig<number>("min_relevance_score", 70);

  const results = [];

  for (const post of posts) {
    const startTime = Date.now();

    try {
      const analysis = await analyzePost(
        post.original_text,
        post.original_image_urls || [],
        accessToken
      );

      const newStatus =
        analysis.relevance_score >= minScore ? "analyzed" : "rejected";

      await supabase
        .from("parsed_posts")
        .update({
          relevance_score: analysis.relevance_score,
          detected_categories: analysis.categories,
          detected_techniques: analysis.techniques,
          ai_analysis: analysis.analysis,
          pipeline_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      // Обновляем счётчик релевантных постов канала
      if (newStatus === "analyzed") {
        const { data: channel } = await supabase
          .from("monitored_channels")
          .select("posts_relevant")
          .eq("id", post.channel_id)
          .single();

        await supabase
          .from("monitored_channels")
          .update({
            posts_relevant: (channel?.posts_relevant || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", post.channel_id);
      }

      await logPipelineEvent({
        post_id: post.id,
        stage: "analyze",
        status: "completed",
        duration_ms: Date.now() - startTime,
        cost_usd: 0.001,
        metadata: {
          score: analysis.relevance_score,
          status: newStatus,
          categories: analysis.categories,
        },
      });

      results.push({
        id: post.id,
        score: analysis.relevance_score,
        status: newStatus,
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
        stage: "analyze",
        status: "failed",
        duration_ms: Date.now() - startTime,
        error: errorMessage,
      });

      results.push({ id: post.id, error: errorMessage });
    }
  }

  return Response.json({ analyzed: results });
});
