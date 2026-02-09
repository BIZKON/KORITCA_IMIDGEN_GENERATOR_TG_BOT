import { supabase } from "../_shared/supabase.ts";
import { getTaskStatus, VIDEO_COSTS } from "../_shared/atlas-cloud.ts";

/**
 * Проверка статуса генерации видео (polling)
 * Использует AtlasCloud getTask API
 *
 * GET/POST с параметрами:
 *   generation_id: string (UUID)  — ID записи в generations
 *   task_id?: string              — или напрямую AtlasCloud task ID
 */

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
    let taskId: string | null = null;

    if (req.method === "POST") {
      const body = await req.json();
      generationId = body.generation_id || null;
      taskId = body.task_id || null;
    } else {
      const url = new URL(req.url);
      generationId = url.searchParams.get("generation_id");
      taskId = url.searchParams.get("task_id");
    }

    // Получаем task_id из БД если передан generation_id
    if (generationId && !taskId) {
      const { data: gen } = await supabase
        .from("generations")
        .select("operation_name, status, video_url, error_message")
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
        return Response.json(
          { status: gen.status, video_url: gen.video_url, error: gen.error_message },
          { headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      taskId = gen.operation_name;
    }

    if (!taskId) {
      return Response.json(
        { error: "generation_id or task_id required" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Проверяем статус через AtlasCloud
    const result = await getTaskStatus(taskId);

    // Ещё генерируется
    if (result.status !== "completed" && result.status !== "failed" && (!result.outputs || result.outputs.length === 0)) {
      return Response.json(
        { status: "generating", message: "Still processing..." },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Ошибка
    if (result.status === "failed") {
      if (generationId) {
        await supabase
          .from("generations")
          .update({
            status: "failed",
            error_message: "Video generation failed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", generationId);
      }

      return Response.json(
        { status: "failed", error: "Video generation failed" },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Видео готово — URL в outputs[]
    const videoUrl = result.outputs?.[0];
    if (!videoUrl) {
      return Response.json(
        { status: "generating", message: "Waiting for output..." },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Обновляем запись в БД
    if (generationId) {
      const { data: gen } = await supabase
        .from("generations")
        .select("model")
        .eq("id", generationId)
        .single();

      const cost = VIDEO_COSTS[gen?.model || ""] || 0.15;

      await supabase
        .from("generations")
        .update({
          status: "completed",
          video_url: videoUrl,
          cost_usd: cost * 5, // cost per second * 5 seconds
          completed_at: new Date().toISOString(),
        })
        .eq("id", generationId);
    }

    return Response.json(
      { status: "completed", video_url: videoUrl },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Check video status error:", errorMessage);
    return Response.json(
      { error: errorMessage },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
});
