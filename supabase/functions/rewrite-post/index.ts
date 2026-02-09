import { supabase } from "../_shared/supabase.ts";
import { verifyCronAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { prompt, CHAT_MODELS } from "../_shared/atlas-cloud.ts";
import { getConfig, logPipelineEvent } from "../_shared/config.ts";

const DEFAULT_REWRITE_TEMPLATE = `Ты — контент-менеджер канала "Пряничная школа".
Перепиши пост из другого канала, создавая ПОЛНОСТЬЮ НОВЫЙ текст.

ПРАВИЛА:
1. Никогда не копируй текст — создай новое описание
2. Добавь 1-2 эмодзи (не больше)
3. Длина: 1-2 предложения (до 200 символов)
4. Стиль: вдохновляющий, тёплый, профессиональный
5. Упоминай что такой дизайн можно создать с помощью AI
6. НЕ упоминай чужие бренды, школы, авторов
7. Категории поста: {categories}

ОРИГИНАЛ:
{original_text}

РЕРАЙТ:`;

async function rewritePost(originalText: string, categories: string[]): Promise<string> {
  let template: string;
  try {
    template = await getConfig<string>("rewrite_prompt_template", DEFAULT_REWRITE_TEMPLATE);
  } catch {
    template = DEFAULT_REWRITE_TEMPLATE;
  }

  const userPrompt = template
    .replace("{original_text}", originalText)
    .replace("{categories}", categories.join(", "));

  const result = await prompt(CHAT_MODELS["gemini-flash"], userPrompt, {
    temperature: 0.7, max_tokens: 300,
  });

  if (!result) throw new Error("Empty rewrite result");
  return result;
}

Deno.serve(async (req) => {
  if (!verifyCronAuth(req)) return unauthorizedResponse();

  const { data: posts } = await supabase
    .from("parsed_posts")
    .select("*")
    .eq("pipeline_status", "analyzed")
    .order("relevance_score", { ascending: false })
    .limit(5);

  if (!posts || posts.length === 0) {
    return Response.json({ message: "No posts to rewrite" });
  }

  const results = [];

  for (const post of posts) {
    const startTime = Date.now();
    try {
      await supabase.from("parsed_posts").update({ pipeline_status: "rewriting" }).eq("id", post.id);

      const rewritten = await rewritePost(post.original_text, post.detected_categories || []);

      await supabase.from("parsed_posts").update({
        rewritten_text: rewritten, pipeline_status: "rewritten", updated_at: new Date().toISOString(),
      }).eq("id", post.id);

      await logPipelineEvent({
        post_id: post.id, stage: "rewrite", status: "completed",
        duration_ms: Date.now() - startTime, cost_usd: 0.002,
        metadata: { text_length: rewritten.length },
      });

      results.push({ id: post.id, status: "rewritten", text: rewritten });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await supabase.from("parsed_posts").update({
        pipeline_status: "failed", error_message: errorMessage, updated_at: new Date().toISOString(),
      }).eq("id", post.id);
      await logPipelineEvent({ post_id: post.id, stage: "rewrite", status: "failed", duration_ms: Date.now() - startTime, error: errorMessage });
      results.push({ id: post.id, error: errorMessage });
    }
  }

  return Response.json({ rewritten: results });
});
