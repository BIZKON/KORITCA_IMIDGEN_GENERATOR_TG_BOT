import { supabase } from "../_shared/supabase.ts";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";

/**
 * Проверка статуса генерации видео (polling)
 *
 * GET/POST с параметрами:
 *   generation_id: string (UUID)  — ID записи в generations
 *   operation_name?: string       — или напрямую operation name
 */

const MODEL_COSTS: Record<string, number> = {
  veo31_fast: 0.15,
  veo31: 0.35,
};

/**
 * Проверяет статус LRO (Long Running Operation) в Vertex AI
 */
async function checkOperation(
  operationName: string,
  accessToken: string
): Promise<{
  done: boolean;
  videoBase64?: string;
  mimeType?: string;
  error?: string;
}> {
  const location = Deno.env.get("GOOGLE_CLOUD_LOCATION") || "us-central1";

  const response = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/${operationName}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LRO check error: ${response.status} ${errText}`);
  }

  const data = await response.json();

  if (data.error) {
    return { done: true, error: data.error.message || JSON.stringify(data.error) };
  }

  if (!data.done) {
    return { done: false };
  }

  // Видео готово
  const video = data.response?.predictions?.[0];
  if (!video?.bytesBase64Encoded) {
    return { done: true, error: "No video in response" };
  }

  return {
    done: true,
    videoBase64: video.bytesBase64Encoded,
    mimeType: video.mimeType || "video/mp4",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    let generationId: string | null = null;
    let operationName: string | null = null;

    if (req.method === "POST") {
      const body = await req.json();
      generationId = body.generation_id || null;
      operationName = body.operation_name || null;
    } else {
      const url = new URL(req.url);
      generationId = url.searchParams.get("generation_id");
      operationName = url.searchParams.get("operation_name");
    }

    // Получаем operation_name из БД если передан generation_id
    if (generationId && !operationName) {
      const { data: gen } = await supabase
        .from("generations")
        .select("operation_name, status")
        .eq("id", generationId)
        .single();

      if (!gen) {
        return Response.json(
          { error: "Generation not found" },
          { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      // Уже завершено
      if (gen.status === "completed" || gen.status === "failed") {
        const { data: fullGen } = await supabase
          .from("generations")
          .select("*")
          .eq("id", generationId)
          .single();

        return Response.json(
          {
            status: fullGen?.status,
            video_url: fullGen?.video_url,
            error: fullGen?.error_message,
          },
          { headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      operationName = gen.operation_name;
    }

    if (!operationName) {
      return Response.json(
        { error: "generation_id or operation_name required" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const accessToken = await getGoogleAccessToken();
    const result = await checkOperation(operationName, accessToken);

    if (!result.done) {
      return Response.json(
        { status: "generating", message: "Still processing..." },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Ошибка генерации
    if (result.error) {
      if (generationId) {
        await supabase
          .from("generations")
          .update({
            status: "failed",
            error_message: result.error,
            completed_at: new Date().toISOString(),
          })
          .eq("id", generationId);
      }

      return Response.json(
        { status: "failed", error: result.error },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Видео готово — сохраняем
    if (result.videoBase64) {
      let videoUrl = "";

      if (generationId) {
        // Получаем telegram_id для пути
        const { data: gen } = await supabase
          .from("generations")
          .select("telegram_id, model")
          .eq("id", generationId)
          .single();

        const ext = result.mimeType?.includes("mp4") ? "mp4" : "webm";
        const fileName = `users/${gen?.telegram_id || "unknown"}/${generationId}.${ext}`;
        const videoData = Uint8Array.from(atob(result.videoBase64), (c) =>
          c.charCodeAt(0)
        );

        const { error: uploadError } = await supabase.storage
          .from("generations")
          .upload(fileName, videoData, {
            contentType: result.mimeType || "video/mp4",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: publicUrl } = supabase.storage
          .from("generations")
          .getPublicUrl(fileName);

        videoUrl = publicUrl.publicUrl;
        const cost = MODEL_COSTS[gen?.model || "veo31_fast"] || 0.15;

        await supabase
          .from("generations")
          .update({
            status: "completed",
            video_url: videoUrl,
            cost_usd: cost,
            completed_at: new Date().toISOString(),
          })
          .eq("id", generationId);
      }

      return Response.json(
        { status: "completed", video_url: videoUrl },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    return Response.json(
      { status: "unknown", message: "Unexpected state" },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Check video status error:", errorMessage);

    return Response.json(
      { error: errorMessage },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});
