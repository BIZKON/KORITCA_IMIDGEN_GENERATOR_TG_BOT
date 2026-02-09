import { supabase } from "../_shared/supabase.ts";
import { verifyCronAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";
import { getConfig, logPipelineEvent } from "../_shared/config.ts";

// Маппинг моделей на Vertex AI model IDs
const MODEL_IDS: Record<string, string> = {
  imagen4_fast: "imagen-4.0-fast-generate-001",
  imagen4: "imagen-4.0-generate-001",
  imagen4_ultra: "imagen-4.0-ultra-generate-001",
};

// Стоимость за 1 генерацию (USD)
const MODEL_COSTS: Record<string, number> = {
  imagen4_fast: 0.02,
  imagen4: 0.04,
  imagen4_ultra: 0.134,
};

/**
 * Генерирует изображение через Imagen 4 (Vertex AI)
 */
async function generateImage(
  prompt: string,
  aspectRatio: string,
  model: string,
  accessToken: string
): Promise<{ imageData: Uint8Array; mimeType: string }> {
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
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio,
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
      "No image generated: " +
        JSON.stringify(data.error || data)
    );
  }

  const base64 = data.predictions[0].bytesBase64Encoded;
  const mimeType = data.predictions[0].mimeType || "image/png";
  const imageData = Uint8Array.from(atob(base64), (c) =>
    c.charCodeAt(0)
  );

  return { imageData, mimeType };
}

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

  const accessToken = await getGoogleAccessToken();
  const defaultModel = await getConfig<string>("image_model", "imagen4_fast");
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

      const { imageData, mimeType } = await generateImage(
        post.generated_prompt_en,
        post.prompt_aspect_ratio || "1:1",
        defaultModel,
        accessToken
      );

      // Сохраняем в Supabase Storage
      const ext = mimeType.includes("png") ? "png" : "jpg";
      const fileName = `pipeline/${post.id}.${ext}`;

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

      // Стоимость генерации
      const cost = MODEL_COSTS[defaultModel] || 0.02;

      // Автоодобрение по score
      const qualityScore = post.relevance_score || 0;
      const autoApproved = qualityScore >= autoThreshold;

      await supabase
        .from("parsed_posts")
        .update({
          generated_image_url: publicUrl.publicUrl,
          media_type: "photo",
          generation_model: defaultModel,
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
          model: defaultModel,
          aspect_ratio: post.prompt_aspect_ratio,
          auto_approved: autoApproved,
          quality_score: qualityScore,
        },
      });

      results.push({
        id: post.id,
        status: autoApproved ? "ready" : "generated",
        image_url: publicUrl.publicUrl,
        cost,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);

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
        post_id: post.id,
        stage: "generate",
        status: "failed",
        duration_ms: Date.now() - startTime,
        error: errorMessage,
      });

      results.push({ id: post.id, error: errorMessage });
    }

    // Rate limiting: пауза 2 секунды между генерациями
    await new Promise((r) => setTimeout(r, 2000));
  }

  return Response.json({ generated: results });
});
