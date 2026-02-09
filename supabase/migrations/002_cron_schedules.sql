-- ============================================================
-- Пряничная школа — Cron-расписание (pg_cron)
-- Применять вручную через SQL Editor в Supabase Dashboard
-- ============================================================

-- Оркестратор пайплайна — каждые 30 минут
SELECT cron.schedule(
  'pipeline-orchestrator',
  '*/30 * * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/pipeline-orchestrator',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.cron_secret'))
  )$$
);

-- Автопост — каждый час
SELECT cron.schedule(
  'auto-post',
  '0 * * * *',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/auto-post',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.cron_secret'))
  )$$
);

-- Планировщик очереди — каждое воскресенье 20:00 UTC
SELECT cron.schedule(
  'schedule-posts',
  '0 20 * * 0',
  $$SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/schedule-posts',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.cron_secret'))
  )$$
);

-- ============================================================
-- Настройки для cron (выполнить в SQL Editor)
-- ============================================================
-- ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
-- ALTER DATABASE postgres SET app.settings.cron_secret = 'your-cron-secret';
