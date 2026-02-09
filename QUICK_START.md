# ⚡ Быстрый Старт ИМИДЖЕН

## 🎯 За 5 Минут

### 1️⃣ Локальная разработка админ-панели

```bash
cd admin-panel
npm install
npm run dev

# Откройте http://localhost:5173
# Готово!
```

---

## 🚀 Деплой в Продакшен

### Вариант 1: Vercel (Рекомендуется)

```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Залогиньтесь
vercel login

# 3. Деплой из папки admin-panel
cd admin-panel
vercel deploy --prod

# 4. Получите URL вашей админ-панели
```

### Вариант 2: Netlify

```bash
# 1. Установите Netlify CLI
npm install -g netlify-cli

# 2. Залогиньтесь
netlify login

# 3. Деплой
cd admin-panel
netlify deploy --prod --dir=dist
```

### Вариант 3: На собственный VPS

```bash
# 1. Сбойте проект
cd admin-panel
npm run build

# 2. Скопируйте dist/ на сервер
scp -r dist/* user@your-server:/var/www/admin/

# 3. Настройте nginx/apache
# Смотрите DEPLOYMENT_GUIDE.md

# 4. Готово!
```

---

## 📋 Переменные Окружения

### Админ-панель (.env)

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=https://<project-id>.supabase.co/functions/v1
```

### Supabase Secrets

```env
ATLAS_CLOUD_API_KEY=<key>
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_CHAT_ID=<id>
GOOGLE_SERVICE_ACCOUNT=<json>
ADMIN_PANEL_URL=<url>
```

---

## 🛠️ Частые Команды

```bash
# Разработка
npm run dev

# Проверка перед деплоем
npm run build

# Удалить node_modules (если проблемы)
rm -rf node_modules package-lock.json
npm install

# Очистить Vite кэш
rm -rf node_modules/.vite
```

---

## 📁 Важные Файлы

| Файл | Назначение |
|------|-----------|
| `admin-panel/src/` | Исходный код админ-панели |
| `admin-panel/DESIGN.md` | Гайдлайны дизайна |
| `DEPLOYMENT_GUIDE.md` | Полный гайд деплоя |
| `FRONTEND_DESIGN.md` | Описание дизайна |
| `VISUAL_GUIDE.md` | Примеры компонентов |
| `README.md` | Главная документация |

---

## 🔗 Полезные Ссылки

- [Supabase](https://supabase.com)
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React](https://react.dev)
- [Vite](https://vitejs.dev)

---

## 🐛 Если Что-то Не Работает

### Admin Panel не загружается
```
1. Откройте DevTools (F12) → Console
2. Проверьте CORS ошибки
3. Убедитесь, что .env переменные установлены
4. Перезагрузите страницу (Ctrl+Shift+R)
```

### Edge Function ошибка
```
1. Проверьте Supabase → Functions → [function-name] → Logs
2. Убедитесь, что все секреты установлены
3. Проверьте SQL миграции
```

### Telegram webhook не работает
```
1. Проверьте URL доступен (https://)
2. Выполните setWebhook снова:
   curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://<project-id>.supabase.co/functions/v1/telegram-bot"
     }'
```

---

## ✅ Чек-Лист Перед Деплоем

- [ ] Админ-панель работает локально (`npm run dev`)
- [ ] Нет ошибок в DevTools Console
- [ ] Сборка проходит (`npm run build`)
- [ ] Переменные окружения установлены
- [ ] Backend функции задеплоены
- [ ] Telegram webhook установлен
- [ ] Все секреты в Supabase установлены

---

## 📞 Нужна Помощь?

1. **Прочитайте документацию**
   - README.md
   - DEPLOYMENT_GUIDE.md
   - DESIGN.md

2. **Проверьте логи**
   - Supabase Dashboard
   - DevTools Console
   - Terminal

3. **Поищите решение**
   - Google "ошибка"
   - Stack Overflow
   - GitHub Issues

---

## 🎉 Готово!

Проект готов к деплою. Выбирайте способ деплоя выше и вперед! 🚀

**Успехов! 💪**
