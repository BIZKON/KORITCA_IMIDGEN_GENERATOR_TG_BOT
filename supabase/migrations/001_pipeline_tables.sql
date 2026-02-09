-- ============================================================
-- Пряничная школа — Контент-пайплайн: таблицы БД
-- ============================================================

-- 1. Таблица monitored_channels — каналы для парсинга
-- ============================================================
CREATE TABLE monitored_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  title TEXT,
  subscribers_count INT DEFAULT 0,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'error')),
  similarity_score INT DEFAULT 0,
  last_parsed_at TIMESTAMPTZ,
  last_post_id TEXT,
  posts_found INT DEFAULT 0,
  posts_relevant INT DEFAULT 0,
  parse_frequency TEXT DEFAULT 'hourly'
    CHECK (parse_frequency IN ('hourly', '3hours', '6hours', 'daily')),
  keywords JSONB DEFAULT '[]',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_monitored_channels_status ON monitored_channels(status);

-- 2. Таблица parsed_posts — спарсенные посты
-- ============================================================
CREATE TABLE parsed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES monitored_channels(id) ON DELETE CASCADE,
  channel_username TEXT NOT NULL,
  telegram_post_id TEXT NOT NULL,
  original_text TEXT NOT NULL,
  original_image_urls JSONB DEFAULT '[]',
  post_date TIMESTAMPTZ,
  post_views INT DEFAULT 0,

  -- AI Analysis
  relevance_score INT,
  detected_categories JSONB DEFAULT '[]',
  detected_techniques JSONB DEFAULT '[]',
  ai_analysis TEXT,

  -- Pipeline status
  pipeline_status TEXT DEFAULT 'parsed'
    CHECK (pipeline_status IN (
      'parsed',
      'analyzed',
      'rejected',
      'rewriting',
      'rewritten',
      'prompting',
      'prompted',
      'generating',
      'generated',
      'ready',
      'queued',
      'published',
      'failed',
      'skipped'
    )),

  -- Rewrite output
  rewritten_text TEXT,
  rewrite_style TEXT,

  -- Prompt output
  generated_prompt_en TEXT,
  prompt_style TEXT,
  prompt_aspect_ratio TEXT DEFAULT '1:1',

  -- Generated card
  generated_image_url TEXT,
  generated_video_url TEXT,
  media_type TEXT DEFAULT 'photo'
    CHECK (media_type IN ('photo', 'video')),
  generation_model TEXT,
  generation_cost DECIMAL(10,4),

  -- Quality & moderation
  quality_score INT,
  auto_approved BOOLEAN DEFAULT false,
  manually_approved BOOLEAN,
  admin_notes TEXT,

  -- Metadata
  error_message TEXT,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(channel_username, telegram_post_id)
);

CREATE INDEX idx_parsed_posts_status ON parsed_posts(pipeline_status);
CREATE INDEX idx_parsed_posts_channel ON parsed_posts(channel_id);
CREATE INDEX idx_parsed_posts_score ON parsed_posts(relevance_score DESC)
  WHERE relevance_score IS NOT NULL;
CREATE INDEX idx_parsed_posts_ready ON parsed_posts(quality_score DESC)
  WHERE pipeline_status = 'ready';

-- 3. Таблица pipeline_config — настройки пайплайна
-- ============================================================
CREATE TABLE pipeline_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Таблица pipeline_logs — логи обработки
-- ============================================================
CREATE TABLE pipeline_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES parsed_posts(id),
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INT,
  cost_usd DECIMAL(10,6),
  input_tokens INT,
  output_tokens INT,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pipeline_logs_post ON pipeline_logs(post_id);
CREATE INDEX idx_pipeline_logs_stage ON pipeline_logs(stage, created_at DESC);

-- ============================================================
-- RLS: таблицы пайплайна доступны только через service_role
-- ============================================================
ALTER TABLE monitored_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_only" ON monitored_channels FOR ALL USING (false);
CREATE POLICY "service_only" ON parsed_posts FOR ALL USING (false);
CREATE POLICY "service_only" ON pipeline_config FOR ALL USING (false);
CREATE POLICY "service_only" ON pipeline_logs FOR ALL USING (false);

-- ============================================================
-- Seed: начальные настройки пайплайна
-- ============================================================
INSERT INTO pipeline_config (key, value, description) VALUES
  ('parse_enabled', 'true', 'Парсинг каналов включён'),
  ('min_relevance_score', '70', 'Минимальный score для прохождения'),
  ('auto_approve_threshold', '90', 'Score для автоодобрения'),
  ('rewrite_model', '"gemini-2.5-flash"', 'Модель для рерайта'),
  ('prompt_model', '"gemini-2.5-flash"', 'Модель для генерации промптов'),
  ('image_model', '"imagen4_fast"', 'Модель для генерации карточек'),
  ('image_aspect_ratio', '"1:1"', 'Формат карточек по умолчанию'),
  ('max_posts_per_parse', '20', 'Макс. постов за парсинг одного канала'),
  ('rewrite_prompt_template', to_jsonb('Ты — контент-менеджер канала "Пряничная школа".
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

РЕРАЙТ:'::text), 'Шаблон промпта для рерайта'),
  ('image_prompt_template', to_jsonb('На основе описания пряника создай ДЕТАЛЬНЫЙ промпт для генерации изображения через Imagen 4.

СТРУКТУРА ПРОМПТА (40-80 слов, ТОЛЬКО на английском):
1. Subject: тип пряника, форма, количество
2. Decoration: тип глазури, цвета, узоры, техника
3. Composition: ракурс (overhead flat lay / 45 degree / macro close-up / arranged set)
4. Background: поверхность (wood board / marble / fabric / dark velvet / kraft paper)
5. Style: стиль фото (product photography / editorial / cozy / rustic / minimalist)
6. Lighting: освещение (soft studio / natural daylight / warm golden / dramatic side)
7. Quality: 4K, high detail, professional, sharp focus

КАТЕГОРИИ: {categories}
ТЕХНИКИ: {techniques}

ОПИСАНИЕ (RU):
{rewritten_text}

Ответь ТОЛЬКО в JSON:
{
  "prompt": "English prompt here...",
  "style": "product",
  "aspect_ratio": "1:1"
}'::text), 'Шаблон промпта для генерации изображений'),
  ('schedule_morning', '"10:00"', 'Утренний пост (МСК)'),
  ('schedule_evening', '"18:00"', 'Вечерний пост (МСК)'),
  ('schedule_days', '[1,2,3,4,5,6]', 'Дни недели (1=Пн)'),
  ('broadcast_mode', '"personal"', 'Режим: personal | channel | both'),
  ('video_per_week', '2', 'Видео-постов в неделю');
