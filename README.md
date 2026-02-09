# 🍪 ИМИДЖЕН — Контент-пайплайн + Админ-панель

Автоматизированный контент-пайплайн для Telegram-бота "Пряничная школа":
парсинг ТГ-каналов → AI-анализ → рерайт → генерация промпта → Imagen 4 → автопост.

**Админ-панель переработана в стиле бренда КОРИЦА FAMILY: теплая, уютная, профессиональная.** 🎨

## Архитектура

```
TG-каналы → Парсер → AI Score → Рерайт → Промпт EN → Imagen 4 → Автопост
                                                                    ↓
                                                    Telegram Bot (webhook)
                                                    Mini App (генерация)
                                                    Админ-панель (React + Vite)
```

## Структура проекта

```
supabase/
  migrations/
    001_pipeline_tables.sql        # Таблицы пайплайна (4 таблицы)
    002_cron_schedules.sql         # pg_cron расписание
    003_users_and_generations.sql  # Users, generations, auto_posts
  functions/
    _shared/                       # Общие утилиты
      supabase.ts                  # Supabase client
      auth.ts                      # Авторизация (cron, admin, telegram)
      atlas-cloud.ts               # AtlasCloud API (Gemini, Imagen, Veo)
      config.ts                    # Pipeline config + logging
      telegram.ts                  # Telegram Bot API helper
    parse-channels/                # Парсинг t.me/s/ каналов
    analyze-posts/                 # AI-анализ (Gemini Flash, score 0-100)
    rewrite-post/                  # AI-рерайт текста RU
    generate-prompt/               # Генерация EN-промпта для Imagen
    generate-card/                 # Imagen 4 генерация карточек
    pipeline-orchestrator/         # Оркестратор (cron 30мин)
    auto-post/                     # Автопубликация (cron 1ч)
    schedule-posts/                # Планировщик (cron вс 20:00)
    admin-api/                     # REST API для админ-панели
    telegram-bot/                  # Webhook-обработчик бота
    generate-image-google/         # Генерация фото для пользователей
    generate-video-google/         # Генерация видео (Veo 3.1)
    check-video-status/            # Polling статуса видео

admin-panel/                       # React SPA для админ-панели
  src/
    components/                    # Layout, StatusBadge
    pages/                         # Dashboard, Channels, Pipeline, Queue, Config, Logs
    hooks/                         # useApi
    lib/                           # API client
```

## Установка

### 1. Supabase

1. Создать проект на [supabase.com](https://supabase.com)
2. Применить миграции через SQL Editor:
   - `001_pipeline_tables.sql`
   - `002_cron_schedules.sql` (после настройки app.settings)
   - `003_users_and_generations.sql`

### 2. Supabase Storage

Создать bucket **`generations`** (public) в Supabase Dashboard -> Storage.

### 3. Secrets (Supabase Dashboard -> Edge Functions -> Secrets)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
ATLASCLOUD_API_KEY=...          # https://www.atlascloud.ai (Gemini, Imagen 4, Veo 3.1)
TELEGRAM_BOT_TOKEN=...
BOT_USERNAME=your_bot_username
TELEGRAM_CHANNEL_ID=-100...
MINI_APP_URL=https://...
CRON_SECRET=<generate random string>
ADMIN_SECRET=<generate random string>
ADMIN_TELEGRAM_IDS=123456789
```

### 4. Деплой Edge Functions

```bash
# Все функции
supabase functions deploy parse-channels
supabase functions deploy analyze-posts
supabase functions deploy rewrite-post
supabase functions deploy generate-prompt
supabase functions deploy generate-card
supabase functions deploy pipeline-orchestrator
supabase functions deploy auto-post
supabase functions deploy schedule-posts
supabase functions deploy admin-api
supabase functions deploy telegram-bot
supabase functions deploy generate-image-google
supabase functions deploy generate-video-google
supabase functions deploy check-video-status
```

### 5. Webhook бота

```bash
# Установить webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.supabase.co/functions/v1/telegram-bot"}'
```

### 6. Cron настройки

В SQL Editor:
```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
ALTER DATABASE postgres SET app.settings.cron_secret = 'your-cron-secret';
```
Затем применить `002_cron_schedules.sql`.

### 7. Админ-панель

```bash
cd admin-panel
cp .env.example .env   # Заполнить VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
npm install
npm run dev            # http://localhost:5173
npm run build          # Production build
```

## 🎨 Дизайн Админ-Панели

Админ-панель полностью переработана вдохновляясь дизайном вашего бренда **КОРИЦА FAMILY**:

### Цветовая схема
- **Primary**: `#fb923c` — теплый оранжевый (действия, акценты)
- **Gradients**: Мягкие оранжевые градиенты для кнопок
- **Background**: Белый с оранжевым оттенком (`#fff7ed`)
- **Нейтралы**: Серые тона для текста и вспомогательных элементов

### Компоненты
- ✅ **Карточки**: `rounded-2xl` с мягкой оранжевой границей
- ✅ **Кнопки**: Градиентный фон с микро-интеракциями
- ✅ **Badges**: Border + soft background для статусов
- ✅ **Inputs**: Оранжевая обводка при focus

### Страницы
- 📊 **Dashboard** — контрольная панель со статистикой
- 📡 **Channels** — управление источниками контента
- 🔄 **Pipeline** — отслеживание постов в обработке
- ⏰ **Queue** — очередь публикаций
- ⚙️ **Config** — настройки системы
- 📋 **Logs** — история всех операций

**Смотрите подробнее**: `admin-panel/DESIGN.md` и `FRONTEND_DESIGN.md`

## Edge Functions (13 шт.)

| # | Функция | Триггер | Назначение |
|---|---------|---------|------------|
| 1 | parse-channels | cron 30мин | Парсинг t.me/s/ каналов |
| 2 | analyze-posts | cron 30мин | AI-анализ + score (Gemini Flash) |
| 3 | rewrite-post | cron 30мин | AI-рерайт текста RU |
| 4 | generate-prompt | cron 30мин | Генерация промпта EN |
| 5 | generate-card | cron 30мин | Imagen 4 генерация |
| 6 | pipeline-orchestrator | cron 30мин | Вызывает 1-5 последовательно |
| 7 | auto-post | cron 1ч | Публикация по расписанию |
| 8 | schedule-posts | cron вс 20:00 | Планирование на неделю |
| 9 | admin-api | HTTP | CRUD API для админ-панели |
| 10 | telegram-bot | webhook | Обработка команд бота |
| 11 | generate-image-google | HTTP | Генерация фото (Imagen 4) |
| 12 | generate-video-google | HTTP | Генерация видео (Veo 3.1) |
| 13 | check-video-status | HTTP | Polling статуса видео |

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

## Telegram Bot команды

| Команда | Описание |
|---------|----------|
| /start | Приветствие + кнопки |
| /generate | Создать изображение |
| /stats | Моя статистика |
| /help | Справка |
| /admin | Админ-панель (для админов) |

Любой текст без "/" -> генерация изображения по описанию.

## 🚀 Деплой

### Админ-панель на Vercel (Рекомендуется)

```bash
cd admin-panel
npm install -g vercel
vercel login
vercel deploy --prod
```

### Админ-панель на Netlify

```bash
cd admin-panel
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### Edge Functions

```bash
supabase functions deploy --project-id <YOUR_PROJECT_ID>
```

**Полный гайд**: смотрите `DEPLOYMENT_GUIDE.md`

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Полный гайд по деплою (Backend + Frontend) |
| [FRONTEND_DESIGN.md](./FRONTEND_DESIGN.md) | Описание дизайна админ-панели и изменений |
| [admin-panel/DESIGN.md](./admin-panel/DESIGN.md) | Гайдлайны для разработки компонентов |

---

## 📊 Стоимость

| Этап | API | Стоимость |
|------|-----|-----------|
| Анализ | Gemini 2.5 Flash | ~$0.001 |
| Рерайт | Gemini 2.5 Flash | ~$0.002 |
| Промпт | Gemini 2.5 Flash | ~$0.002 |
| Карточка | Imagen 4 Fast | ~$0.02 |
| **Итого за пост** | | **~$0.025 (~2.5 RUB)** |

**При 12 постах/неделю**: ~$0.60/нед (~60 RUB)

---

## ✨ Что нового

### 🎨 Полный редизайн админ-панели
- ✅ Новая цветовая схема в стиле КОРИЦА FAMILY
- ✅ Красивые карточки вместо таблиц
- ✅ Улучшенные интеракции и микро-анимации
- ✅ Лучше организованная информация
- ✅ Responsive дизайн для всех устройств

### 🛠️ Технические улучшения
- ✅ React 19 + Vite (быстрая разработка)
- ✅ Tailwind CSS для стилизации
- ✅ SWR для кэширования данных
- ✅ Lucide React для иконок
- ✅ TypeScript для типобезопасности

---

## 📋 Быстрая проверка

```bash
# 1. Проверить админ-панель локально
cd admin-panel
npm install
npm run dev
# Откройте http://localhost:5173

# 2. Проверить сборку
npm run build
ls dist/  # должен содержать index.html, assets/ и т.д.

# 3. Проверить API
curl -X GET https://<project-id>.supabase.co/functions/v1/admin-api \
  -H "Authorization: Bearer <anon-key>"
```

---

## 🐛 Решение проблем

| Проблема | Решение |
|----------|---------|
| Admin Panel не загружается | Проверьте DevTools → Console, переменные окружения |
| Edge Function ошибка | Проверьте Supabase → Functions → Logs |
| Telegram webhook не работает | Выполните setWebhook еще раз, проверьте HTTPS |
| Изображения не генерируются | Проверьте ATLASCLOUD_API_KEY и лимиты API |

---

## 🎓 Структура код
