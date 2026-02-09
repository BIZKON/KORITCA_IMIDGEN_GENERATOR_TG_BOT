import { supabase } from "../_shared/supabase.ts";
import { verifyCronAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { generateImage, IMAGE_MODELS, IMAGE_COSTS } from "../_shared/atlas-cloud.ts";
import { getConfig, logPipelineEvent } from "../_shared/config.ts";

Deno.serve(async (req) => {
  if (!verifyCronAuth(req)) {
    return unauthorizedResponse();
  }

  // Берём посты с готовым промптом (по 3 за раз — rate limiting)
  const { data: posts } = await supabase
    .from("parsed_posts")
    .select("*")
    .eq("pipeline_status", "prompted")
    .order("relevance_score", { ascending: false })
    .limit(3);

  if (!posts || posts.length === 0) {
    return Response.json({ message: "No posts for image generation" });
  }

  const autoThreshold = await getConfig<number>("auto_approve_threshold", 90);
  const results = [];

  for (const post of posts) {
    const startTime = Date.now();

    try {
      await supabase
        .from("parsed_posts")
        .update({
          pipeline_status: "generating",
          processing_started_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      // Генерируем через AtlasCloud Imagen 4
      const imageResult = await generateImage(
        IMAGE_MODELS.imagen4,
        post.generated_prompt_en,
        { aspect_ratio: post.prompt_aspect_ratio || "1:1" }
      );

      // AtlasCloud возвращает URLs в outputs[]
      const imageUrl = imageResult.outputs?.[0];
      if (!imageUrl) {
        throw new Error("No image URL in response: " + JSON.stringify(imageResult));
      }

      // Стоимость генерации
      const cost = IMAGE_COSTS[IMAGE_MODELS.imagen4] || 0.02;

      // Автоодобрение по score
      const qualityScore = post.relevance_score || 0;
      const autoApproved = qualityScore >= autoThreshold;

      await supabase
        .from("parsed_posts")
        .update({
          generated_image_url: imageUrl,
          media_type: "photo",
          generation_model: IMAGE_MODELS.imagen4,
          generation_cost: cost,
          quality_score: qualityScore,
          auto_approved: autoApproved,
          pipeline_status: autoApproved ? "ready" : "generated",
          processing_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      await logPipelineEvent({
        post_id: post.id,
        stage: "generate",
        status: "completed",
        duration_ms: Date.now() - startTime,
        cost_usd: cost,
        metadata: {
          model: IMAGE_MODELS.imagen4,
          aspect_ratio: post.prompt_aspect_ratio,
          auto_approved: autoApproved,
        },
      });

      results.push({
        id: post.id,
        status: autoApproved ? "ready" : "generated",
        image_url: imageUrl,
        cost,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      await supabase
        .from("parsed_posts")
        .update({
          pipeline_status: "failed",
          error_message: errorMessage,
          processing_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      await logPipelineEvent({
        post_id: post.id, stage: "generate", status: "failed",
        duration_ms: Date.now() - startTime, error: errorMessage,
      });

      results.push({ id: post.id, error: errorMessage });
    }

    // Rate limiting: пауза 2 секунды между генерациями
    await new Promise((r) => setTimeout(r, 2000));
  }

  return Response.json({ generated: results });
});
