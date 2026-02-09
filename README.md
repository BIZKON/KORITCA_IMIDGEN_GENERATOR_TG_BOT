# Пряничная школа — Контент-пайплайн + Админ-панель

Автоматизированный контент-пайплайн для Telegram-бота "Пряничная школа":
парсинг ТГ-каналов → AI-анализ → рерайт → генерация промпта → Imagen 4 → автопост.

## Архитектура

```
📡 ТГ-каналы → 🔍 Парсер → 🤖 AI Score → ✍️ Рерайт → 🎨 Промпт EN → 📸 Imagen 4 → 📮 Автопост
```

## Структура проекта

```
supabase/
├── migrations/
│   ├── 001_pipeline_tables.sql    # Таблицы БД
│   └── 002_cron_schedules.sql     # Cron-расписание
└── functions/
    ├── _shared/                   # Общие утилиты
    │   ├── supabase.ts            # Supabase client
    │   ├── auth.ts                # Авторизация
    │   ├── google-auth.ts         # Google OAuth2
    │   └── config.ts              # Конфиг + логирование
    ├── parse-channels/            # Парсинг t.me/s/
    ├── analyze-posts/             # AI-анализ (Gemini Flash)
    ├── rewrite-post/              # AI-рерайт текста
    ├── generate-prompt/           # Генерация EN-промпта
    ├── generate-card/             # Imagen 4 генерация
    ├── pipeline-orchestrator/     # Оркестратор (cron 30мин)
    ├── auto-post/                 # Автопубликация (cron 1ч)
    ├── schedule-posts/            # Планировщик (cron вс 20:00)
    └── admin-api/                 # REST API для админки
```

## Установка

### 1. Supabase

```bash
# Создать проект на supabase.com
# Применить миграцию 001_pipeline_tables.sql через SQL Editor
# Применить cron-расписание 002_cron_schedules.sql
```

### 2. Secrets (Supabase Dashboard → Edge Functions → Secrets)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_CLOUD_PROJECT_ID=...
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
TELEGRAM_BOT_TOKEN=...
CRON_SECRET=...
ADMIN_SECRET=...
ADMIN_TELEGRAM_IDS=123456789
```

### 3. Деплой Edge Functions

```bash
supabase functions deploy parse-channels
supabase functions deploy analyze-posts
supabase functions deploy rewrite-post
supabase functions deploy generate-prompt
supabase functions deploy generate-card
supabase functions deploy pipeline-orchestrator
supabase functions deploy auto-post
supabase functions deploy schedule-posts
supabase functions deploy admin-api
```

### 4. Storage Bucket

Создать bucket `generations` в Supabase Storage (public).

### 5. Cron настройки

В SQL Editor выполнить:
```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
ALTER DATABASE postgres SET app.settings.cron_secret = 'your-cron-secret';
```

## Admin API

Все запросы требуют заголовок `X-Admin-Token: <ADMIN_SECRET>`.

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | /channels | Список каналов |
| POST | /channels | Добавить канал |
| PATCH | /channels/:id | Обновить канал |
| DELETE | /channels/:id | Удалить канал |
| GET | /pipeline?status=... | Посты пайплайна |
| PATCH | /pipeline/:id | Обновить пост |
| POST | /pipeline/:id/process | Перезапустить обработку |
| POST | /pipeline/:id/approve | Одобрить вручную |
| GET | /queue | Очередь публикаций |
| POST | /queue/add | Добавить в очередь |
| GET | /config | Настройки |
| PATCH | /config | Обновить настройку |
| GET | /stats | Статистика |
| GET | /logs | Логи |
| POST | /trigger/parse | Запуск парсинга |
| POST | /trigger/pipeline | Запуск пайплайна |
| POST | /trigger/schedule | Запуск планировщика |

## Стоимость

~$0.025 на пост (полный цикл). При 12 постах/неделю — ~$0.60/нед (~60₽).
