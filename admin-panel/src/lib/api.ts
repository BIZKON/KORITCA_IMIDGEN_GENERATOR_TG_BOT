/**
 * Admin API client
 * Все запросы к admin-api Edge Function
 */

const API_BASE = import.meta.env.VITE_API_BASE || "";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

async function request<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}/functions/v1/admin-api${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": ADMIN_TOKEN,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Каналы ──────────────────────────────────

export interface Channel {
  id: string;
  username: string;
  title: string | null;
  subscribers_count: number;
  status: "active" | "paused" | "error";
  similarity_score: number;
  last_parsed_at: string | null;
  last_post_id: string | null;
  posts_found: number;
  posts_relevant: number;
  parse_frequency: string;
  keywords: string[];
  error_message: string | null;
  created_at: string;
}

export const getChannels = () => request<Channel[]>("/channels");

export const addChannel = (data: { username: string; title?: string }) =>
  request<Channel>("/channels", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateChannel = (id: string, data: Partial<Channel>) =>
  request<Channel>(`/channels/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteChannel = (id: string) =>
  request(`/channels/${id}`, { method: "DELETE" });

// ── Пайплайн ──────────────────────────────────

export interface PipelinePost {
  id: string;
  channel_username: string;
  original_text: string;
  original_image_urls: string[];
  pipeline_status: string;
  relevance_score: number | null;
  detected_categories: string[];
  detected_techniques: string[];
  ai_analysis: string | null;
  rewritten_text: string | null;
  generated_prompt_en: string | null;
  generated_image_url: string | null;
  quality_score: number | null;
  auto_approved: boolean;
  manually_approved: boolean | null;
  admin_notes: string | null;
  error_message: string | null;
  created_at: string;
}

export const getPipeline = (status = "all", limit = 50, offset = 0) =>
  request<{ data: PipelinePost[]; total: number }>(
    `/pipeline?status=${status}&limit=${limit}&offset=${offset}`
  );

export const updatePost = (id: string, data: Partial<PipelinePost>) =>
  request(`/pipeline/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const reprocessPost = (id: string, resetTo = "analyzed") =>
  request(`/pipeline/${id}/process`, {
    method: "POST",
    body: JSON.stringify({ reset_to: resetTo }),
  });

export const approvePost = (id: string) =>
  request(`/pipeline/${id}/approve`, { method: "POST" });

// ── Очередь ──────────────────────────────────

export const getQueue = () => request<PipelinePost[]>("/queue");

export const addToQueue = (postId: string, scheduledAt: string, mode = "personal") =>
  request("/queue/add", {
    method: "POST",
    body: JSON.stringify({ post_id: postId, scheduled_at: scheduledAt, mode }),
  });

// ── Конфиг ──────────────────────────────────

export interface ConfigItem {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

export const getConfig = () => request<ConfigItem[]>("/config");

export const updateConfig = (key: string, value: unknown) =>
  request("/config", {
    method: "PATCH",
    body: JSON.stringify({ key, value }),
  });

// ── Статистика ──────────────────────────────────

export interface Stats {
  channels: Record<string, number>;
  channels_total: number;
  pipeline: Record<string, number>;
  pipeline_total: number;
  cost_week_usd: string;
  cost_by_stage: Record<string, number>;
}

export const getStats = () => request<Stats>("/stats");

// ── Логи ──────────────────────────────────

export interface LogEntry {
  id: string;
  post_id: string | null;
  stage: string;
  status: string;
  duration_ms: number | null;
  cost_usd: number | null;
  error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const getLogs = (limit = 100, stage?: string) =>
  request<LogEntry[]>(`/logs?limit=${limit}${stage ? `&stage=${stage}` : ""}`);

// ── Триггеры ──────────────────────────────────

export const triggerParse = () =>
  request("/trigger/parse", { method: "POST" });

export const triggerPipeline = () =>
  request("/trigger/pipeline", { method: "POST" });

export const triggerSchedule = () =>
  request("/trigger/schedule", { method: "POST" });
