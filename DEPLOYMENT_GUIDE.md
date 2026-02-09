# 🚀 Полное Руководство по Деплою

## Архитектура проекта

```
├── supabase/
│   └── functions/
│       ├── telegram-bot/          # Telegram бот
│       ├── pipeline-orchestrator/  # Главный оркестратор
│       ├── parse-channels/         # Парсинг каналов
│       ├── analyze-posts/          # Анализ постов
│       ├── generate-prompt/        # Генерация промпта
│       ├── generate-image-google/  # Генерация изображения
│       ├── rewrite-post/           # Переписывание поста
│       ├── auto-post/              # Автоматическая публикация
│       ├── schedule-posts/         # Планировщик постов
│       ├── check-video-status/     # Проверка видео
│       ├── generate-card/          # Генерация карточки
│       ├── admin-api/              # API админ-панели
│       └── _shared/                # Общие утилиты
├── admin-panel/
│   ├── src/
│   │   ├── components/    # Переиспользуемые компоненты
│   │   ├── pages/         # Страницы админ-панели
│   │   ├── hooks/         # React хуки
│   │   ├── lib/           # Утилиты и API клиент
│   │   ├── index.css      # Глобальные стили
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── docs/                  # Документация
```

---

## Фаза 1: Подготовка к деплою

### Шаг 1: Создание Supabase проекта

```bash
# Перейдите на https://supabase.com
# 1. Создайте новый проект
# 2. Ждите инициализации (5-10 минут)
# 3. Скопируйте:
#    - Project URL (в Settings → API)
#    - anon key
#    - service_role key
```

### Шаг 2: Применение SQL миграций

```bash
# Перейдите в SQL Editor в Supabase панели
# Запустите все SQL файлы в порядке:

# 1. Создание таблиц
-- Скопируйте содержимое суперbase/migrations/001_create_tables.sql

# 2. Настройка CRON заданий
-- Скопируйте содержимое superbase/migrations/002_setup_cron.sql

# 3. RLS политики
-- Скопируйте содержимое superbase/migrations/003_setup_rls.sql
```

### Шаг 3: Получение API ключей

```bash
# 1. AtlasCloud API ключ
#    - Перейдите на https://atlascloud.ai
#    - Создайте аккаунт
#    - Скопируйте API ключ

# 2. Telegram Bot Token
#    - Напишите @BotFather в Telegram
#    - Создайте нового бота
#    - Скопируйте token

# 3. Google Cloud (если используете Google API)
#    - Создайте project на https://console.cloud.google.com
#    - Активируйте нужные APIs
#    - Создайте service account
#    - Скопируйте JSON ключ
```

---

## Фаза 2: Деплой Edge Functions

### Шаг 1: Установка Supabase CLI

```bash
npm install -g supabase
```

### Шаг 2: Логин в Supabase

```bash
supabase login
# Введите access token с https://app.supabase.com/account/tokens
```

### Шаг 3: Установка переменных окружения

```bash
# В Supabase Dashboard → Edge Functions → Secrets
# Добавьте следующие секреты:

ATLAS_CLOUD_API_KEY=<ваш AtlasCloud ключ>
TELEGRAM_BOT_TOKEN=<ваш Telegram бот токен>
TELEGRAM_CHAT_ID=<ID чата для уведомлений>
ADMIN_PANEL_URL=<URL админ-панели после деплоя>
```

### Шаг 4: Деплой Functions

```bash
cd supabase/functions

# Деплой всех функций
supabase functions deploy --project-id <YOUR_PROJECT_ID>

# Или отдельные функции
supabase functions deploy telegram-bot --project-id <YOUR_PROJECT_ID>
supabase functions deploy pipeline-orchestrator --project-id <YOUR_PROJECT_ID>
# и т.д.
```

### Шаг 5: Установка Webhook для Telegram бота

```bash
# После деплоя telegram-bot функции, выполните:
curl -X POST \
  https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<your-project-id>.supabase.co/functions/v1/telegram-bot",
    "allowed_updates": ["message", "callback_query"]
  }'

# Проверьте webhook:
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

---

## Фаза 3: Деплой Админ-Панели

### Шаг 1: Подготовка к продакшену

```bash
cd admin-panel

# 1. Обновите переменные окружения в .env.production
VITE_API_URL=https://<your-project-id>.supabase.co/functions/v1/admin-api
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# 2. Сбойте проект
npm run build

# 3. Проверьте, что dist/ создалась без ошибок
ls dist/
```

### Шаг 2: Деплой на Vercel (Рекомендуется)

```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Залогиньтесь
vercel login

# 3. Деплой из папки admin-panel
cd admin-panel
vercel deploy --prod

# 4. Следуйте инструкциям на экране
# 5. Получите URL вашей админ-панели
```

### Шаг 3: Деплой на Netlify (Альтернатива)

```bash
# 1. Установите Netlify CLI
npm install -g netlify-cli

# 2. Залогиньтесь
netlify login

# 3. Деплой
cd admin-panel
netlify deploy --prod --dir=dist

# 4. Получите URL
```

### Шаг 4: Деплой на собственный VPS

```bash
# 1. Скопируйте dist/ на сервер
scp -r dist/* user@your-server:/var/www/admin/

# 2. Настройте Nginx/Apache для статических файлов
# Пример nginx config:

server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        root /var/www/admin;
        try_files $uri /index.html;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# 3. Перезагрузите Nginx
sudo systemctl reload nginx
```

---

## Фаза 4: Настройка и тестирование

### Шаг 1: Проверка Edge Functions

```bash
# Тестируйте каждую функцию
curl -X POST https://<project-id>.supabase.co/functions/v1/admin-api \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"action": "get-stats"}'
```

### Шаг 2: Проверка Админ-Панели

```bash
# 1. Откройте админ-панель в браузере
# 2. Проверьте отображение данных
# 3. Тестируйте все кнопки и фильтры
# 4. Проверьте консоль на ошибки
```

### Шаг 3: Проверка Telegram Бота

```bash
# 1. Напишите /start боту
# 2. Отправьте тестовое сообщение
# 3. Проверьте логи: Supabase → Functions → telegram-bot → Logs
```

---

## Фаза 5: Мониторинг и Обслуживание

### Настройка мониторинга

```bash
# 1. Включите мониторинг в Supabase
#    Dashboard → Functions → выберите функцию → Logs

# 2. Настройте алерты:
#    - Failed invocations
#    - High latency
#    - Errors

# 3. Изучите Logs регулярно
```

### Резервные копии

```bash
# Supabase автоматически резервирует данные
# Но рекомендуется делать ручные бэкапы:

# Экспорт данных
pg_dump -h <host> -U postgres <database> > backup.sql

# Или используйте Supabase Dashboard:
# Settings → Database → Backups → Request backup now
```

---

## Переменные окружения - Полный список

### Admin Panel (.env.production)
```
VITE_API_URL=https://<project-id>.supabase.co/functions/v1
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Supabase Edge Functions (Secrets)
```
ATLAS_CLOUD_API_KEY=<api-key>
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_CHAT_ID=<chat-id>
GOOGLE_SERVICE_ACCOUNT=<json-key>
ADMIN_PANEL_URL=<admin-panel-url>
```

---

## Проблемы и решения

### Telegram Webhook ошибка
```
Решение: Убедитесь, что URL доступен и HTTPS
- Проверьте firewall
- Используйте https://
- Тестируйте через curl
```

### Edge Function timeout
```
Решение: Оптимизируйте функции или увеличьте timeout
- Проверьте логи в Supabase
- Профилируйте функцию
- Кэшируйте результаты где возможно
```

### Admin Panel не загружается
```
Решение: Проверьте переменные окружения
- Откройте DevTools → Console
- Проверьте CORS ошибки
- Убедитесь, что API доступен
```

---

## Итоговый Чек-лист

- [ ] Supabase проект создан
- [ ] SQL миграции применены
- [ ] Edge Functions задеплоены
- [ ] Telegram webhook установлен
- [ ] Админ-панель задеплоена
- [ ] Переменные окружения установлены
- [ ] Все тесты пройдены
- [ ] Мониторинг настроен
- [ ] Резервные копии настроены
- [ ] Документация обновлена

---

## Следующие шаги

1. **Запустите парсинг**: Протестируйте парсинг каналов
2. **Проверьте пайплайн**: Убедитесь, что посты проходят весь путь
3. **Настройте расписание**: Установите расписание для автоматической публикации
4. **Мониторьте логи**: Регулярно проверяйте логи на ошибки
5. **Оптимизируйте**: На основе данных логов оптимизируйте процессы

---

**Проект готов к работе! 🎉**

Если возникают вопросы - обратитесь к документации в `/supabase` и `/admin-panel`.
