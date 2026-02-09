import { supabase } from "./supabase.ts";

/**
 * Получить значение конфигурации из pipeline_config
 */
export async function getConfig<T = string>(key: string, defaultValue?: T): Promise<T> {
  const { data } = await supabase
    .from("pipeline_config")
    .select("value")
    .eq("key", key)
    .single();

  if (!data?.value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Config key "${key}" not found`);
  }

  const raw = data.value;

  // JSONB хранит уже распарсенные значения
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  return raw as T;
}

/**
 * Логирование этапа пайплайна
 */
export async function logPipelineEvent(params: {
  post_id?: string;
  stage: "parse" | "analyze" | "rewrite" | "prompt" | "generate" | "publish";
  status: "started" | "completed" | "failed";
  duration_ms?: number;
  cost_usd?: number;
  input_tokens?: number;
  output_tokens?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await supabase.from("pipeline_logs").insert({
    post_id: params.post_id,
    stage: params.stage,
    status: params.status,
    duration_ms: params.duration_ms,
    cost_usd: params.cost_usd,
    input_tokens: params.input_tokens,
    output_tokens: params.output_tokens,
    error: params.error,
    metadata: params.metadata || {},
  });
}
