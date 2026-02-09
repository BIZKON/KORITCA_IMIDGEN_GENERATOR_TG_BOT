# 🛠️ Полезные Скрипты и Команды

## 🚀 Деплой Скрипты

### Bash скрипт для полного деплоя (Linux/Mac)

Создайте файл `deploy.sh`:

```bash
#!/bin/bash

# ИМИДЖЕН Deployment Script
# Использование: bash deploy.sh [vercel|netlify|vps]

set -e

DEPLOY_TYPE=${1:-vercel}

echo "🚀 ИМИДЖЕН Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    exit 1
fi

echo "✓ Node.js установлен: $(node -v)"

# 2. Go to admin-panel
cd admin-panel

# 3. Install dependencies
echo "📦 Установка зависимостей..."
npm install

# 4. Build
echo "🏗️  Сборка проекта..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Сборка не удалась"
    exit 1
fi

echo "✓ Сборка успешна"

# 5. Deploy based on type
case $DEPLOY_TYPE in
    vercel)
        echo "📤 Деплой на Vercel..."
        if ! command -v vercel &> /dev/null; then
            npm install -g vercel
        fi
        vercel deploy --prod
        echo "✓ Деплой на Vercel завершен"
        ;;
    netlify)
        echo "📤 Деплой на Netlify..."
        if ! command -v netlify &> /dev/null; then
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist
        echo "✓ Деплой на Netlify завершен"
        ;;
    vps)
        echo "📤 Деплой на VPS..."
        read -p "Введите user@host: " VPS_HOST
        read -p "Введите путь на сервере (например /var/www/admin): " VPS_PATH
        
        scp -r dist/* "$VPS_HOST:$VPS_PATH/"
        echo "✓ Файлы скопированы на сервер"
        ;;
    *)
        echo "❌ Неизвестный тип деплоя: $DEPLOY_TYPE"
        echo "Используйте: bash deploy.sh [vercel|netlify|vps]"
        exit 1
        ;;
esac

echo ""
echo "🎉 Деплой завершен!"
```

Использование:
```bash
chmod +x deploy.sh
bash deploy.sh vercel
# или
bash deploy.sh netlify
# или
bash deploy.sh vps
```

---

## 🧪 Проверка Скрипты

### Проверка перед деплоем

Создайте файл `check-before-deploy.sh`:

```bash
#!/bin/bash

echo "🔍 Проверка перед деплоем"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd admin-panel

# 1. Check node_modules
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules не найден"
    echo "   Выполните: npm install"
    exit 1
fi
echo "✓ Dependencies установлены"

# 2. Check build
echo ""
echo "🏗️  Тестирование сборки..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Сборка проходит успешно"
else
    echo "❌ Сборка содержит ошибки"
    npm run build
    exit 1
fi

# 3. Check dist folder
if [ ! -d "dist" ]; then
    echo "❌ dist папка не найдена"
    exit 1
fi
echo "✓ dist папка создана"

# 4. Check important files
FILES=("dist/index.html" "dist/assets")
for file in "${FILES[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ $file не найден"
        exit 1
    fi
done
echo "✓ Все важные файлы на месте"

# 5. Check environment variables
echo ""
echo "🔐 Проверка переменных окружения..."
if [ -f ".env" ]; then
    if grep -q "VITE_SUPABASE_URL" .env && \
       grep -q "VITE_SUPABASE_ANON_KEY" .env && \
       grep -q "VITE_API_URL" .env; then
        echo "✓ .env содержит нужные переменные"
    else
        echo "⚠️  .env может быть неполным"
    fi
else
    echo "⚠️  .env файл не найден"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Все проверки пройдены!"
echo "Проект готов к деплою"
```

Использование:
```bash
chmod +x check-before-deploy.sh
bash check-before-deploy.sh
```

---

## 🔧 Утилиты

### Telegram Webhook Setup

Создайте файл `setup-telegram-webhook.sh`:

```bash
#!/bin/bash

echo "🤖 Telegram Webhook Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Введите Telegram Bot Token: " BOT_TOKEN
read -p "Введите URL функции (например https://xxx.supabase.co/functions/v1/telegram-bot): " WEBHOOK_URL

echo ""
echo "📤 Установка webhook..."

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}")

if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✓ Webhook успешно установлен"
    echo ""
    echo "🔍 Информация о webhook:"
    curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | json_pp
else
    echo "❌ Ошибка установки webhook"
    echo "$RESPONSE" | json_pp
    exit 1
fi
```

Использование:
```bash
chmod +x setup-telegram-webhook.sh
bash setup-telegram-webhook.sh
```

---

## 📊 Мониторинг Скрипты

### Проверка статуса Edge Functions

Создайте файл `check-functions-status.sh`:

```bash
#!/bin/bash

echo "🔍 Проверка статуса Edge Functions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Введите Supabase Project ID: " PROJECT_ID
read -p "Введите Anon Key: " ANON_KEY

FUNCTIONS=(
    "parse-channels"
    "analyze-posts"
    "rewrite-post"
    "generate-prompt"
    "generate-image-google"
    "pipeline-orchestrator"
    "auto-post"
    "schedule-posts"
    "admin-api"
    "telegram-bot"
    "generate-card"
    "generate-video-google"
    "check-video-status"
)

echo ""
echo "Проверка функций:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for FUNC in "${FUNCTIONS[@]}"; do
    echo -n "Проверка $FUNC... "
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -X GET "https://${PROJECT_ID}.supabase.co/functions/v1/${FUNC}" \
        -H "Authorization: Bearer ${ANON_KEY}")
    
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "400" ] || [ "$STATUS" = "401" ]; then
        echo "✓ OK (HTTP $STATUS)"
    else
        echo "❌ FAIL (HTTP $STATUS)"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Проверка завершена"
```

Использование:
```bash
chmod +x check-functions-status.sh
bash check-functions-status.sh
```

---

## 🧹 Очистка и Ремонт

### Очистить проект

```bash
#!/bin/bash

echo "🧹 Очистка проекта"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd admin-panel

# Удалить node_modules
if [ -d "node_modules" ]; then
    echo "Удаление node_modules..."
    rm -rf node_modules
    echo "✓ node_modules удален"
fi

# Удалить package-lock.json
if [ -f "package-lock.json" ]; then
    echo "Удаление package-lock.json..."
    rm package-lock.json
    echo "✓ package-lock.json удален"
fi

# Удалить dist
if [ -d "dist" ]; then
    echo "Удаление dist..."
    rm -rf dist
    echo "✓ dist удален"
fi

# Удалить .vite cache
if [ -d "node_modules/.vite" ]; then
    echo "Удаление Vite cache..."
    rm -rf node_modules/.vite
    echo "✓ Vite cache удален"
fi

echo ""
echo "✓ Проект очищен"
echo "Следующий шаг: npm install"
```

---

## 📋 Curl Commands для Тестирования API

### Тестирование Admin API

```bash
# GET stats
curl -X GET "https://<project-id>.supabase.co/functions/v1/admin-api?action=get-stats" \
  -H "Authorization: Bearer <anon-key>"

# GET channels
curl -X GET "https://<project-id>.supabase.co/functions/v1/admin-api?action=get-channels" \
  -H "Authorization: Bearer <anon-key>"

# GET pipeline
curl -X GET "https://<project-id>.supabase.co/functions/v1/admin-api?action=get-pipeline&status=ready" \
  -H "Authorization: Bearer <anon-key>"

# GET queue
curl -X GET "https://<project-id>.supabase.co/functions/v1/admin-api?action=get-queue" \
  -H "Authorization: Bearer <anon-key>"

# GET config
curl -X GET "https://<project-id>.supabase.co/functions/v1/admin-api?action=get-config" \
  -H "Authorization: Bearer <anon-key>"

# GET logs
curl -X GET "https://<project-id>.supabase.co/functions/v1/admin-api?action=get-logs&limit=20" \
  -H "Authorization: Bearer <anon-key>"

# POST trigger parse
curl -X POST "https://<project-id>.supabase.co/functions/v1/admin-api" \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"action":"trigger-parse"}'

# POST trigger pipeline
curl -X POST "https://<project-id>.supabase.co/functions/v1/admin-api" \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"action":"trigger-pipeline"}'
```

### Тестирование Telegram Webhook

```bash
# Установить webhook
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://<project-id>.supabase.co/functions/v1/telegram-bot\"}"

# Получить информацию о webhook
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"

# Удалить webhook
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"

# Отправить тестовое сообщение (как будто от Telegram)
curl -X POST "https://<project-id>.supabase.co/functions/v1/telegram-bot" \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 12345,
    "message": {
      "message_id": 1,
      "date": 1234567890,
      "chat": {
        "id": 123456789,
        "type": "private"
      },
      "text": "/start",
      "from": {
        "id": 123456789,
        "is_bot": false,
        "first_name": "Test"
      }
    }
  }'
```

---

## 🔐 Генерация Ключей и Tokens

### Генерация случайного ключа для CRON_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Или используйте Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Или используйте Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 Docker (Опционально)

Если хотите использовать Docker для консистентной среды:

```dockerfile
# Dockerfile для админ-панели
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_SUPABASE_URL=https://example.supabase.co
ENV VITE_SUPABASE_ANON_KEY=example_key
ENV VITE_API_URL=https://example.supabase.co/functions/v1

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

Использование:
```bash
# Build
docker build -t imidgen-admin .

# Run
docker run -p 3000:3000 imidgen-admin

# Deploy на Docker Hub
docker tag imidgen-admin yourusername/imidgen-admin
docker push yourusername/imidgen-admin
```

---

## 📝 GitHub Actions (CI/CD)

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd admin-panel
          npm install
      
      - name: Build
        run: |
          cd admin-panel
          npm run build
      
      - name: Deploy to Vercel
        run: |
          cd admin-panel
          npx vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

**Используйте эти скрипты для автоматизации! 🚀**
