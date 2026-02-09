import { supabase } from "../_shared/supabase.ts";
import { verifyAdminAuth, forbiddenResponse } from "../_shared/auth.ts";

/**
 * Единый REST API для админ-панели
 *
 * Эндпоинты:
 * GET    /channels              — Список каналов
 * POST   /channels              — Добавить канал
 * PATCH  /channels/:id          — Обновить канал
 * DELETE /channels/:id          — Удалить канал
 *
 * GET    /pipeline              — Список постов пайплайна
 * PATCH  /pipeline/:id          — Обновить пост
 * POST   /pipeline/:id/process  — Перезапустить обработку
 * POST   /pipeline/:id/approve  — Одобрить пост вручную
 *
 * GET    /queue                 — Очередь публикаций
 * POST   /queue/add             — Добавить в очередь
 *
 * GET    /config                — Настройки пайплайна
 * PATCH  /config                — Обновить настройку
 *
 * GET    /stats                 — Статистика
 * GET    /logs                  — Логи пайплайна
 *
 * POST   /trigger/parse         — Ручной запуск парсинга
 * POST   /trigger/pipeline      — Ручной запуск пайплайна
 */

// CORS headers для админ-панели
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Авторизация
  if (!verifyAdminAuth(req)) {
    return forbiddenResponse();
  }

  const url = new URL(req.url);
  // Убираем базовый путь edge function
  const fullPath = url.pathname;
  const path = fullPath.replace(/^\/admin-api/, "") || "/";
  const method = req.method;

  try {
    // ── КАНАЛЫ ──────────────────────────────────────────────
    if (path === "/channels" && method === "GET") {
      const { data, error } = await supabase
        .from("monitored_channels")
        .select("*")
        .order("similarity_score", { ascending: false });

      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse(data);
    }

    if (path === "/channels" && method === "POST") {
      const body = await req.json();
      const username = (body.username || "").replace("@", "").trim();

      if (!username) {
        return jsonResponse({ error: "username is required" }, 400);
      }

      const { data, error } = await supabase
        .from("monitored_channels")
        .insert({
          username,
          title: body.title || null,
          keywords: body.keywords || [],
          parse_frequency: body.parse_frequency || "hourly",
        })
        .select()
        .single();

      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse(data, 201);
    }

    const channelMatch = path.match(/^\/channels\/([a-f0-9-]+)$/);
    if (channelMatch && method === "PATCH") {
      const id = channelMatch[1];
      const body = await req.json();

      // Разрешённые поля для обновления
      const allowed = [
        "title", "status", "similarity_score", "parse_frequency",
        "keywords", "error_message",
      ];
      const updateData: Record<string, unknown> = {};
      for (const key of allowed) {
        if (key in body) updateData[key] = body[key];
      }
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("monitored_channels")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse(data);
    }

    if (channelMatch && method === "DELETE") {
      const id = channelMatch[1];
      const { error } = await supabase
        .from("monitored_channels")
        .delete()
        .eq("id", id);

      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ deleted: true });
    }

    // ── ПАЙПЛАЙН ────────────────────────────────────────────
    if (path === "/pipeline" && method === "GET") {
      const status = url.searchParams.get("status") || "all";
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase
        .from("parsed_posts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status !== "all") {
        query = query.eq("pipeline_status", status);
      }

      const { data, count, error } = await query;
      if (error) return jsonResponse({ error: error.message }, 500);

      return jsonResponse({ data, total: count, limit, offset });
    }

    const pipelineMatch = path.match(/^\/pipeline\/([a-f0-9-]+)$/);
    if (pipelineMatch && method === "PATCH") {
      const id = pipelineMatch[1];
      const body = await req.json();

      const allowed = [
        "pipeline_status", "rewritten_text", "generated_prompt_en",
        "prompt_style", "prompt_aspect_ratio", "quality_score",
        "manually_approved", "admin_notes",
      ];
      const updateData: Record<string, unknown> = {};
      for (const key of allowed) {
        if (key in body) updateData[key] = body[key];
      }
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("parsed_posts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse(data);
    }

    // Перезапуск обработки поста
    const processMatch = path.match(
      /^\/pipeline\/([a-f0-9-]+)\/process$/
    );
    if (processMatch && method === "POST") {
      const id = processMatch[1];
      const body = await req.json().catch(() => ({}));

      const { data, error } = await supabase
        .from("parsed_posts")
        .update({
          pipeline_status: body.reset_to || "analyzed",
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ message: "Reprocessing scheduled", post: data });
    }

    // Ручное одобрение поста
    const approveMatch = path.match(
      /^\/pipeline\/([a-f0-9-]+)\/approve$/
    );
    if (approveMatch && method === "POST") {
      const id = approveMatch[1];

      const { data, error } = await supabase
        .from("parsed_posts")
        .update({
          manually_approved: true,
          pipeline_status: "ready",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ message: "Post approved", post: data });
    }

    // ── ОЧЕРЕДЬ ─────────────────────────────────────────────
    if (path === "/queue" && method === "GET") {
      const { data, error } = await supabase
        .from("parsed_posts")
        .select("*")
        .in("pipeline_status", ["queued", "published"])
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse(data);
    }

    if (path === "/queue/add" && method === "POST") {
      const body = await req.json();

      if (!body.post_id) {
        return jsonResponse({ error: "post_id is required" }, 400);
      }

      const { data: post } = await supabase
        .from("parsed_posts")
        .select("*")
        .eq("id", body.post_id)
        .single();

      if (!post) {
        return jsonResponse({ error: "Post not found" }, 404);
      }

      const scheduledAt = body.scheduled_at || new Date().toISOString();
      const mode = body.mode || "personal";

      const { data, error } = await supabase
        .from("parsed_posts")
        .update({
          pipeline_status: "queued",
          admin_notes: `scheduled:${scheduledAt}|mode:${mode}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.post_id)
        .select()
        .single();

      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse(data);
    }

    // ── КОНФИГУРАЦИЯ ────────────────────────────────────────
    if (path === "/config" && method === "GET") {
      const { data, error } = await supabase
        .from("pipeline_config")
        .select("*")
        .order("key");

      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse(data);
    }

    if (path === "/config" && method === "PATCH") {
      const body = await req.json();

      if (!body.key) {
        return jsonResponse({ error: "key is required" }, 400);
      }

      const { data, error } = await supabase
        .from("pipeline_config")
        .update({
          value: typeof body.value === "string"
            ? body.value
            : JSON.stringify(body.value),
          updated_at: new Date().toISOString(),
        })
        .eq("key", body.key)
        .select()
        .single();

      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse(data);
    }

    // ── СТАТИСТИКА ──────────────────────────────────────────
    if (path === "/stats" && method === "GET") {
      const weekAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const [channelsResult, pipelineResult, logsResult] =
        await Promise.all([
          supabase
            .from("monitored_channels")
            .select("status", { count: "exact" }),
          supabase.from("parsed_posts").select("pipeline_status"),
          supabase
            .from("pipeline_logs")
            .select("cost_usd, stage")
            .gte("created_at", weekAgo),
        ]);

      // Агрегация по статусам пайплайна
      const pipelineCounts: Record<string, number> = {};
      pipelineResult.data?.forEach((p) => {
        pipelineCounts[p.pipeline_status] =
          (pipelineCounts[p.pipeline_status] || 0) + 1;
      });

      // Агрегация по статусам каналов
      const channelCounts: Record<string, number> = {};
      channelsResult.data?.forEach((c) => {
        channelCounts[c.status] = (channelCounts[c.status] || 0) + 1;
      });

      // Стоимость за неделю
      const weekCost =
        logsResult.data?.reduce(
          (sum, l) => sum + parseFloat(String(l.cost_usd || "0")),
          0
        ) || 0;

      // Стоимость по этапам
      const costByStage: Record<string, number> = {};
      logsResult.data?.forEach((l) => {
        costByStage[l.stage] =
          (costByStage[l.stage] || 0) +
          parseFloat(String(l.cost_usd || "0"));
      });

      return jsonResponse({
        channels: channelCounts,
        channels_total: channelsResult.count || 0,
        pipeline: pipelineCounts,
        pipeline_total: pipelineResult.data?.length || 0,
        cost_week_usd: weekCost.toFixed(4),
        cost_by_stage: costByStage,
      });
    }

    // ── ЛОГИ ────────────────────────────────────────────────
    if (path === "/logs" && method === "GET") {
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const stage = url.searchParams.get("stage");
      const status = url.searchParams.get("status");

      let query = supabase
        .from("pipeline_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (stage) query = query.eq("stage", stage);
      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse(data);
    }

    // ── РУЧНОЙ ЗАПУСК ───────────────────────────────────────
    if (path === "/trigger/parse" && method === "POST") {
      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/parse-channels`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("CRON_SECRET")}`,
          },
        }
      );
      return jsonResponse(await response.json());
    }

    if (path === "/trigger/pipeline" && method === "POST") {
      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/pipeline-orchestrator`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("CRON_SECRET")}`,
          },
        }
      );
      return jsonResponse(await response.json());
    }

    if (path === "/trigger/schedule" && method === "POST") {
      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/schedule-posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("CRON_SECRET")}`,
          },
        }
      );
      return jsonResponse(await response.json());
    }

    // ── 404 ─────────────────────────────────────────────────
    return jsonResponse(
      { error: "Not Found", path, method },
      404
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: errorMessage }, 500);
  }
});
