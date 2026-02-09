-- ============================================================
-- Пряничная школа — Таблицы пользователей и генераций
-- ============================================================

-- 1. Таблица users — пользователи бота
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT DEFAULT 'ru',
  is_active BOOLEAN DEFAULT true,          -- Активен (не заблокировал бота)
  is_premium BOOLEAN DEFAULT false,        -- Telegram Premium
  is_admin BOOLEAN DEFAULT false,          -- Админ бота
  generations_count INT DEFAULT 0,         -- Всего генераций
  generations_today INT DEFAULT 0,         -- Генераций сегодня
  last_generation_at TIMESTAMPTZ,
  daily_limit INT DEFAULT 3,               -- Дневной лимит генераций
  referral_code TEXT UNIQUE,               -- Реферальный код
  referred_by UUID REFERENCES users(id),   -- Кто пригласил
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_referral ON users(referral_code) WHERE referral_code IS NOT NULL;

-- 2. Таблица generations — история генераций пользователей
-- ============================================================
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_id BIGINT NOT NULL,
  prompt_ru TEXT,                           -- Промпт пользователя (RU)
  prompt_en TEXT,                           -- Промпт для модели (EN)
  media_type TEXT DEFAULT 'photo'           -- 'photo' | 'video'
    CHECK (media_type IN ('photo', 'video')),
  model TEXT NOT NULL,                      -- 'imagen4_fast' | 'imagen4' | 'veo31_fast' etc
  aspect_ratio TEXT DEFAULT '1:1',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  image_url TEXT,                           -- URL результата
  video_url TEXT,                           -- URL видео (если видео)
  operation_name TEXT,                      -- Для async видео — operation name
  cost_usd DECIMAL(10,6),
  duration_ms INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_generations_user ON generations(user_id);
CREATE INDEX idx_generations_telegram ON generations(telegram_id);
CREATE INDEX idx_generations_status ON generations(status) WHERE status IN ('pending', 'generating');
CREATE INDEX idx_generations_operation ON generations(operation_name) WHERE operation_name IS NOT NULL;

-- 3. Таблица auto_posts — очередь автопостинга (опционально, расширение)
-- ============================================================
CREATE TABLE auto_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption_ru TEXT NOT NULL,
  prompt_en TEXT,
  category TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'posting', 'posted', 'failed')),
  source TEXT DEFAULT 'pipeline',          -- 'pipeline' | 'manual' | 'admin'
  source_id UUID,                          -- ID из parsed_posts (если из пайплайна)
  broadcast_mode TEXT DEFAULT 'personal',  -- 'personal' | 'channel' | 'both'
  posted_at TIMESTAMPTZ,
  recipients_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_auto_posts_scheduled ON auto_posts(scheduled_at)
  WHERE status = 'scheduled';
CREATE INDEX idx_auto_posts_status ON auto_posts(status);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_only" ON users FOR ALL USING (false);
CREATE POLICY "service_only" ON generations FOR ALL USING (false);
CREATE POLICY "service_only" ON auto_posts FOR ALL USING (false);
