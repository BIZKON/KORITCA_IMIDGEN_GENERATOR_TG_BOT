# ✅ Чек-лист Перед Деплоем

Убедитесь, что всё проверено перед отправкой в продакшен.

---

## 📋 Админ-Панель (React + Vite)

### Базовая проверка
- [ ] Установлены все зависимости: `npm install`
- [ ] Проект запускается локально: `npm run dev`
- [ ] Нет красных ошибок в DevTools Console
- [ ] Проект собирается: `npm run build`
- [ ] Папка `dist/` создана без ошибок

### Функциональность
- [ ] Все 6 страниц загружаются без ошибок:
  - [ ] Dashboard
  - [ ] Channels
  - [ ] Pipeline
  - [ ] Queue
  - [ ] Config
  - [ ] Logs
- [ ] Навигация по сайдбару работает
- [ ] Кнопки работают и не выбрасывают ошибки
- [ ] Фильтры работают (если есть)
- [ ] Модальные окна открываются/закрываются
- [ ] Таблицы/списки отображаются корректно

### Дизайн и Стиль
- [ ] Оранжевая цветовая схема везде (#fb923c)
- [ ] Карточки с `rounded-2xl` и бордюром
- [ ] Кнопки с градиентом или мягким фоном
- [ ] Shadows и hover эффекты работают
- [ ] Текст читаем везде (хорошая контрастность)
- [ ] Изображения загружаются (если есть)
- [ ] Шрифты загружаются правильно

### Responsive (Мобильность)
- [ ] Мобильный (375px): всё видно, не обрезано
  - [ ] Сайдбар может быть скрыт (бургер)
  - [ ] Кнопки достаточно большие (48px+)
  - [ ] Текст переносится правильно
- [ ] Планшет (768px): 2 колонки где нужно
- [ ] Десктоп (1024px+): полный функционал, сайдбар фиксирован

### Производительность
- [ ] Страница загружается за <3 секунды
- [ ] Нет утечек памяти (DevTools → Memory)
- [ ] Скроллинг плавный
- [ ] Анимации не идут рывками
- [ ] Network tab: нет 404 ошибок

### TypeScript и Безопасность
- [ ] `npm run build` не выдаёт ошибок TypeScript
- [ ] Нет `any` типов где можно обойтись
- [ ] Все импорты правильные (нет циклических)
- [ ] Переменные окружения не залиты в код

---

## 🔧 Backend (Supabase Edge Functions)

### Конфигурация
- [ ] Supabase проект создан и инициализирован
- [ ] Все 3 SQL миграции применены:
  - [ ] 001_create_tables.sql
  - [ ] 002_setup_cron.sql
  - [ ] 003_setup_rls.sql
- [ ] Database работает (Supabase Dashboard → Database)

### Secrets установлены
- [ ] ATLAS_CLOUD_API_KEY ✓
- [ ] TELEGRAM_BOT_TOKEN ✓
- [ ] TELEGRAM_CHAT_ID ✓
- [ ] GOOGLE_SERVICE_ACCOUNT ✓ (если нужен)
- [ ] ADMIN_PANEL_URL ✓

### Edge Functions
- [ ] Все 13 функций задеплоены:
  - [ ] parse-channels
  - [ ] analyze-posts
  - [ ] rewrite-post
  - [ ] generate-prompt
  - [ ] generate-image-google
  - [ ] pipeline-orchestrator
  - [ ] auto-post
  - [ ] schedule-posts
  - [ ] admin-api
  - [ ] telegram-bot
  - [ ] generate-card
  - [ ] generate-video-google
  - [ ] check-video-status
- [ ] Каждая функция в Supabase Dashboard → Functions
- [ ] Логи отображаются (смотрели ли вы логи хотя бы раз?)

### API тестирование
- [ ] Admin API отвечает на GET запрос:
  ```bash
  curl -X GET https://<project-id>.supabase.co/functions/v1/admin-api \
    -H "Authorization: Bearer <anon-key>"
  ```
- [ ] Функции не возвращают 500 ошибки
- [ ] Ответы валидные JSON

### Telegram Bot
- [ ] Webhook установлен:
  ```bash
  curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
  ```
- [ ] Webhook status: OK (не pending)
- [ ] Bot отвечает на `/start` команду
- [ ] Можно отправить сообщение боту

### Scheduling (Cron)
- [ ] Database config установлен:
  ```sql
  ALTER DATABASE postgres SET app.settings.supabase_url = 'https://...';
  ALTER DATABASE postgres SET app.settings.cron_secret = '...';
  ```
- [ ] Cron функции в pg_cron (Supabase SQL Editor)
- [ ] Логи cron заданий проверены

---

## 📚 Документация

### Файлы на месте
- [ ] README.md ✓
- [ ] DEPLOYMENT_GUIDE.md ✓
- [ ] FRONTEND_DESIGN.md ✓
- [ ] admin-panel/DESIGN.md ✓
- [ ] VISUAL_GUIDE.md ✓
- [ ] COMPLETION_STATUS.md ✓
- [ ] PROJECT_SUMMARY.md ✓
- [ ] QUICK_START.md ✓

### Содержание актуально
- [ ] README содержит правильные ссылки
- [ ] DEPLOYMENT_GUIDE содержит актуальные URL
- [ ] Примеры кода работают
- [ ] Нет устаревшей информации
- [ ] Ссылки не ведут в никуда

---

## 🌐 Деплой Админ-Панели

### Выберите один из вариантов:

#### Вариант 1: Vercel (Рекомендуется)
- [ ] Vercel CLI установлен: `npm install -g vercel`
- [ ] Залогинены в Vercel: `vercel login`
- [ ] Команда работает: `cd admin-panel && vercel deploy --prod`
- [ ] Получен URL админ-панели
- [ ] Панель открывается по URL

#### Вариант 2: Netlify
- [ ] Netlify CLI установлен: `npm install -g netlify-cli`
- [ ] Залогинены в Netlify: `netlify login`
- [ ] Build проходит: `npm run build`
- [ ] Деплой работает: `netlify deploy --prod --dir=dist`
- [ ] Получен URL админ-панели

#### Вариант 3: VPS
- [ ] SSH доступ работает
- [ ] Nginx/Apache настроен
- [ ] Папка `/var/www/admin/` создана
- [ ] Файлы скопированы на сервер
- [ ] Domain указывает на правильный IP
- [ ] HTTPS сертификат установлен (Let's Encrypt)

---

## 🔗 Интеграции

### Supabase
- [ ] Проект активен и доступен
- [ ] Project URL скопирован
- [ ] Anon key скопирован
- [ ] Service role key скопирован (для функций)

### AtlasCloud (Gemini, Imagen)
- [ ] API ключ получен
- [ ] Лимиты проверены
- [ ] Ключ добавлен в Supabase Secrets

### Telegram
- [ ] Bot создан (@BotFather)
- [ ] Token получен
- [ ] Webhook установлен
- [ ] Bot отвечает на сообщения

### Google Cloud (опционально)
- [ ] Project создан (если нужен)
- [ ] Service account создан
- [ ] JSON ключ скопирован
- [ ] Permissions установлены

---

## 🧪 Финальное Тестирование

### Сценарий 1: Парсинг → Пайплайн → Публикация
- [ ] Запустите парсинг (Dashboard → Trigger)
- [ ] Посты появляются в Пайплайне
- [ ] Статус меняется (parsed → generated → ready)
- [ ] Можно одобрить пост вручную
- [ ] Пост попадает в Queue

### Сценарий 2: Админ-панель ↔ Backend
- [ ] Загрузилась админ-панель
- [ ] Данные с сервера отобразились
- [ ] Можно изменить конфиг
- [ ] Изменения сохранились в БД
- [ ] Нет CORS ошибок

### Сценарий 3: Telegram Bot
- [ ] Отправите `/start`
- [ ] Получите ответ
- [ ] Нажмете на кнопку
- [ ] Бот обработает команду
- [ ] В логах появится запись

### Сценарий 4: Мобильный телефон
- [ ] Откроете админ-панель на телефоне
- [ ] Всё видно, не обрезано
- [ ] Можно скроллить
- [ ] Кнопки нажимаются
- [ ] Без горизонтального скролла

---

## 📊 Мониторинг

### Установите мониторинг
- [ ] Supabase Logs настроены (Functions → Logs)
- [ ] Error alerts работают (если есть)
- [ ] Database Logs настроены (если нужны)
- [ ] Email уведомления работают (если настроены)

### Проверьте логи
- [ ] Нет постоянных ERROR в логах
- [ ] Нет WARNING которые должны быть ошибками
- [ ] Duration функций разумный (<10 сек)
- [ ] Нет timeout ошибок

---

## 🔐 Безопасность

### Данные
- [ ] Нет hardcoded ключей в коде
- [ ] Все ключи в Supabase Secrets
- [ ] .env файлы в .gitignore
- [ ] Переменные окружения не в git

### Доступ
- [ ] RLS политики активированы (если используются)
- [ ] Service role key используется только на backend
- [ ] Anon key используется только на frontend
- [ ] CORS правильно настроен

### API
- [ ] API требует авторизацию (где нужно)
- [ ] Rate limiting включен (если есть)
- [ ] Input validation работает
- [ ] SQL injection защита есть (parameterized queries)

---

## 📈 Performance

### Speed
- [ ] Admin Panel загружается <3 сек (на 4G)
- [ ] Первая интеракция <2 сек
- [ ] Нет джанков при скроллинге

### Bundle Size
- [ ] JS bundle <300KB (gzipped)
- [ ] CSS <50KB
- [ ] Изображения оптимизированы

### Memory
- [ ] Нет утечек памяти
- [ ] Memory usage стабильный

---

## ✨ Финальная Проверка

```bash
# 1. Админ-панель локально работает
cd admin-panel
npm install
npm run dev
# ✓ Откройте http://localhost:5173

# 2. Build проходит без ошибок
npm run build
# ✓ dist/ создана

# 3. Deплой команда работает
# Vercel:  vercel deploy --prod
# Netlify: netlify deploy --prod --dir=dist

# 4. Админ-панель доступна по новому URL
# Откройте URL в браузере
# ✓ Работает!
```

---

## 🎉 Готово к Деплою!

Если все пункты выше отмечены ✓, то:

✅ **Проект полностью готов к продакшену!**

🚀 **Приступайте к деплою!**

---

## 📞 Если Что-то Упустили

1. Прочитайте DEPLOYMENT_GUIDE.md
2. Проверьте логи в Supabase
3. Откройте DevTools на админ-панели
4. Проверьте Network tab на ошибки
5. Убедитесь, что все переменные окружения установлены

---

**Последнее обновление**: 2026-02-09  
**Версия**: 1.0.0  
**Статус**: 🟢 Готово к деплою
