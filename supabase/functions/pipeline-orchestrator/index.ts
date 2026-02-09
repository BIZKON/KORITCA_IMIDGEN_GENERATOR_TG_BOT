import { verifyCronAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { getConfig } from "../_shared/config.ts";

/**
 * Оркестратор пайплайна
 * Вызывается cron каждые 30 минут
 * Последовательно запускает все этапы: parse → analyze → rewrite → prompt → generate
 */

const PIPELINE_STAGES = [
  { name: "parse", function: "parse-channels" },
  { name: "analyze", function: "analyze-posts" },
  { name: "rewrite", function: "rewrite-post" },
  { name: "prompt", function: "generate-prompt" },
  { name: "generate", function: "generate-card" },
] as const;

Deno.serve(async (req) => {
  if (!verifyCronAuth(req)) {
    return unauthorizedResponse();
  }

  // Проверяем включён ли парсинг
  const parseEnabled = await getConfig<boolean>("parse_enabled", true);
  if (!parseEnabled) {
    return Response.json({ message: "Pipeline disabled" });
  }

  const baseUrl = Deno.env.get("SUPABASE_URL")!;
  const cronSecret = Deno.env.get("CRON_SECRET")!;
  const headers = { Authorization: `Bearer ${cronSecret}` };

  const results: Record<string, unknown> = {};
  const startTime = Date.now();

  for (const stage of PIPELINE_STAGES) {
    try {
      const response = await fetch(
        `${baseUrl}/functions/v1/${stage.function}`,
        { method: "POST", headers }
      );

      if (!response.ok) {
        results[stage.name] = {
          error: `HTTP ${response.status}: ${await response.text()}`,
        };
        continue;
      }

      results[stage.name] = await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      results[stage.name] = { error: errorMessage };
    }
  }

  return Response.json({
    pipeline: "completed",
    duration_ms: Date.now() - startTime,
    results,
    timestamp: new Date().toISOString(),
  });
});
