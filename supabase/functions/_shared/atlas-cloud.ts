/**
 * AtlasCloud API клиент
 * Unified API для Gemini, Imagen, Veo через https://api.atlascloud.ai
 *
 * Документация: https://www.atlascloud.ai/docs/en/models/overview
 */

const ATLAS_API_BASE = "https://api.atlascloud.ai";

/**
 * Получить API ключ AtlasCloud
 */
function getApiKey(): string {
  const key = Deno.env.get("ATLASCLOUD_API_KEY");
  if (!key) throw new Error("ATLASCLOUD_API_KEY not set");
  return key;
}

/**
 * Общие заголовки для всех запросов
 */
function headers(): Record<string, string> {
  return {
    "Authorization": `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

// ── Chat Completions (Gemini) ─────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI-совместимый chat completions через AtlasCloud
 * Используется для Gemini Flash (анализ, рерайт, промпты)
 */
export async function chatCompletion(
  model: string,
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: string };
  }
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${ATLAS_API_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 1000,
      ...(options?.response_format && { response_format: options.response_format }),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AtlasCloud chat error ${response.status}: ${errText}`);
  }

  return response.json();
}

/**
 * Shortcut: отправить один промпт и получить текстовый ответ
 */
export async function prompt(
  model: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    max_tokens?: number;
    systemPrompt?: string;
    json_mode?: boolean;
  }
): Promise<string> {
  const messages: ChatMessage[] = [];

  if (options?.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push({ role: "user", content: userPrompt });

  const response = await chatCompletion(model, messages, {
    temperature: options?.temperature,
    max_tokens: options?.max_tokens,
    response_format: options?.json_mode ? { type: "json_object" } : undefined,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}

// ── Image Generation (Imagen) ─────────────────────────────────

export interface GenerateImageResponse {
  id: string;
  model: string;
  status: string;
  outputs: string[];  // URLs изображений
  urls: Record<string, string>;
  created_at: string;
  has_nsfw_contents: boolean[];
}

/**
 * Генерация изображения через AtlasCloud (Imagen 4 и др.)
 */
export async function generateImage(
  model: string,
  promptText: string,
  options?: {
    aspect_ratio?: string;
    num_images?: number;
    negative_prompt?: string;
    seed?: number;
  }
): Promise<GenerateImageResponse> {
  const response = await fetch(
    `${ATLAS_API_BASE}/api/v1/model/generateImage`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        model,
        prompt: promptText,
        aspect_ratio: options?.aspect_ratio || "1:1",
        num_images: options?.num_images || 1,
        ...(options?.negative_prompt && { negative_prompt: options.negative_prompt }),
        ...(options?.seed !== undefined && { seed: options.seed }),
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AtlasCloud image error ${response.status}: ${errText}`);
  }

  return response.json();
}

// ── Video Generation (Veo) ────────────────────────────────────

export interface GenerateVideoResponse {
  id: string;
  model: string;
  status: string;
  outputs: string[];  // URLs видео (пусто пока generating)
  urls: Record<string, string>;
  created_at: string;
  has_nsfw_contents: boolean[];
}

/**
 * Запуск генерации видео через AtlasCloud (Veo 3.1 и др.)
 * Асинхронный — возвращает task ID для polling
 */
export async function generateVideo(
  model: string,
  promptText: string,
  options?: {
    aspect_ratio?: string;
    duration?: number;
    generate_audio?: boolean;
    negative_prompt?: string;
    seed?: number;
    image?: string;  // URL для image-to-video
  }
): Promise<GenerateVideoResponse> {
  const response = await fetch(
    `${ATLAS_API_BASE}/api/v1/model/generateVideo`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        model,
        prompt: promptText,
        aspect_ratio: options?.aspect_ratio || "16:9",
        duration: options?.duration || 5,
        ...(options?.generate_audio !== undefined && {
          generate_audio: options.generate_audio,
        }),
        ...(options?.negative_prompt && { negative_prompt: options.negative_prompt }),
        ...(options?.seed !== undefined && { seed: options.seed }),
        ...(options?.image && { image: options.image }),
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AtlasCloud video error ${response.status}: ${errText}`);
  }

  return response.json();
}

/**
 * Проверка статуса задачи (polling для видео)
 * Использует task ID из generateVideo response
 */
export async function getTaskStatus(
  taskId: string
): Promise<GenerateVideoResponse> {
  const response = await fetch(
    `${ATLAS_API_BASE}/api/v1/model/getTask/${taskId}`,
    { headers: headers() }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AtlasCloud task status error ${response.status}: ${errText}`);
  }

  return response.json();
}

// ── Model IDs ─────────────────────────────────────────────────

/** Модели для chat completions (Gemini) */
export const CHAT_MODELS = {
  "gemini-flash": "google/gemini-2.5-flash",
  "gemini-pro": "google/gemini-2.5-pro",
} as const;

/** Модели для генерации изображений */
export const IMAGE_MODELS = {
  imagen4: "atlascloud/imagen4",
} as const;

/** Модели для генерации видео */
export const VIDEO_MODELS = {
  "veo31_fast": "google/veo3.1-fast/text-to-video",
  "veo31": "google/veo3.1/text-to-video",
} as const;

/** Стоимость генерации изображения (USD) */
export const IMAGE_COSTS: Record<string, number> = {
  "atlascloud/imagen4": 0.02,
};

/** Стоимость генерации видео (USD per second) */
export const VIDEO_COSTS: Record<string, number> = {
  "google/veo3.1-fast/text-to-video": 0.15,
  "google/veo3.1/text-to-video": 0.20,
};
