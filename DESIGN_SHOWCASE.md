# 🎨 Витрина Дизайна Админ-Панели

## Как Просмотреть Дизайн

### Локально (Рекомендуется)
```bash
cd admin-panel
npm install
npm run dev
# Откройте http://localhost:5173
# Нажмите на "Дизайн Тест" в левой навигации
```

### Основной дизайн - Цветовая Схема

#### Primary Colors
```
🟠 Orange-400: #fb923c (основные кнопки)
🟠 Orange-500: #f97316 (hover состояние)
🟠 Orange-600: #ea580c (active состояние)
```

#### Backgrounds
```
⚪ White: #ffffff
⚪ Orange-50: #fff7ed (мягкий фон)
⚪ Gradient: #fff7ed → #fafaf9 → #fff7ed
```

#### Neutrals
```
⚫ Gray-900: #111827 (заголовки)
⚫ Gray-700: #374151 (основной текст)
⚫ Gray-600: #4b5563 (вспомогательный)
⚫ Gray-500: #6b7280 (очень светлый)
```

---

## Компоненты в Админ-Панели

### 1. Layout (Боковая панель)
```tsx
// Структура:
- Лого с иконкой Sparkles ✨
- Заголовок "Имиджен"
- Навигационное меню 6 пунктов + тест
- Выпадающий список ссылок
- Тестовая ссылка (Дизайн Тест)
- Профессиональный footer
```

**Особенности:**
- Белая боковая панель с оранжевой границей
- Активные пункты: градиент orange-400 → orange-500
- Неактивные пункты: серый текст с hover эффектом
- Smooth переходы: `transition-all duration-200`

---

### 2. Dashboard (Главная страница)

#### Заголовок
```
Контрольная панель
Здесь живёт вся магия твоего контента
```
- Размер: 30px, bold, gray-900
- Кнопка refresh справа

#### Stat Cards (4 карточки)
```
┌─────────────┐
│ 📡 Активные │ Blue gradient
│ каналы: 12  │
└─────────────┘
```

**Все 4 карточки:**
1. **Активные каналы** (Blue gradient)
2. **Посты в очереди** (Purple gradient)
3. **Опубликовано** (Green gradient)
4. **Расходы в неделю** (Orange gradient)

#### Pipeline Statuses
```
┌──────────────────────────────────┐
│ ⚡ Статусы пайплайна            │
│ [ready: 5] [queued: 3] [pub: 12] │
└──────────────────────────────────┘
```
- Мягкие оранжево-жёлтые pill-shaped badges
- Inline layout с flex wrap

#### Quick Actions
```
┌────────────────────────────────────────┐
│ Быстрые действия                       │
│ [▶ Запуск парсинга] [🔄 Пайплайн] [...] │
└────────────────────────────────────────┘
```

---

### 3. Channels (Управление каналами)

#### Добавление Канала
- Input поля с orange focus ring
- Кнопка "Добавить" с зелёным градиентом
- Кнопка "Отмена" с серым фоном

#### Список Каналов (Card Layout)
```
┌─────────────────────────────────────┐
│ 📡 @username                        │
│    "Название канала"                │
│                                     │
│ Похожесть: 92                       │
│ Посты: 150 / 45                     │
│ Последний: 12.02.2026               │
│                                     │
│ [⏸ Приостановить] [🗑 Удалить]     │
└─────────────────────────────────────┘
```

---

### 4. Pipeline (Отслеживание постов)

#### Фильтры
```
[all] [parsed] [analyzed] [rejected] [ready] [published] [failed]
```
- Active: orange gradient + shadow
- Inactive: gray background

#### Post Cards
```
┌──────────────────────────────────────────┐
│ [Status Badge] @channel_name score: 92   │
│                                          │
│ "Оригинальный текст поста из канала..."  │
│                                          │
│ ✨ "Переработанный текст..."            │
│                                          │
│ [👁 Детали] [✓ Одобрить] 12.02.2026      │
└──────────────────────────────────────────┘
```

#### Модальное окно деталей
- Большой заголовок
- Вся информация о посте
- Генерированное изображение
- Кнопка закрытия

---

### 5. Queue (Очередь публикаций)

```
┌──────────────────────────────────────┐
│ [Image] @channel                     │
│         "Текст поста..."             │
│         ⏰ 15.02.2026 14:30           │
└──────────────────────────────────────┘
```

---

### 6. Config (Настройки)

```
┌──────────────────────────────────────┐
│ ⚙️ PARAMETER_NAME                   │
│    Описание параметра                │
│                                      │
│ [Input field для значения]           │
│                                      │
│ Обновлено: 12.02.2026 10:30    [💾] │
└──────────────────────────────────────┘
```

---

### 7. Logs (Логи системы)

```
┌──────────────────────────────────────┐
│ 14:30:15      │ parse    │ ✓ Active │
│ 200ms         │ $0.002   │          │
└──────────────────────────────────────┘
```

---

## Кнопки и Интеракции

### Типы Кнопок

#### Primary (Оранжевый градиент)
```css
background: linear-gradient(to right, #fb923c, #f97316);
color: white;
border-radius: 0.75rem; /* rounded-xl */
padding: 0.75rem 1.25rem;
font-weight: 600;

&:hover {
  box-shadow: 0 10px 25px rgba(251, 146, 60, 0.3);
}

&:active {
  transform: scale(0.95);
}
```

#### Secondary (Белая с границей)
```css
background: white;
border: 1px solid #fed7aa; /* orange-200 */
color: #92400e; /* orange-900 */
border-radius: 0.75rem;
padding: 0.75rem 1rem;

&:hover {
  background: #fff7ed; /* orange-50 */
}
```

#### Tertiary (Серая)
```css
background: #f3f4f6; /* gray-100 */
color: #374151; /* gray-700 */
border-radius: 0.75rem;

&:hover {
  background: #e5e7eb; /* gray-200 */
}
```

---

## Cards и Containers

### Основная Карточка
```css
background: white;
border: 1px solid #fed7aa; /* orange-100 */
border-radius: 1rem; /* rounded-2xl */
padding: 1.5rem; /* p-6 */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

&:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Gradient Карточка
```css
background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); /* blue gradient */
border: 1px solid #93c5fd; /* blue-200 */
/* ... остальное как выше */
```

---

## Статусы и Badges

### Status Badge
```css
display: inline-block;
padding: 0.375rem 0.875rem; /* px-3.5 py-1.5 */
border-radius: 0.5rem;
font-size: 0.75rem;
font-weight: 600;
border: 1px solid;

/* Цвета зависят от статуса */
```

**Примеры:**
- `active`: bg-green-50, border-green-200, text-green-700
- `paused`: bg-yellow-50, border-yellow-200, text-yellow-700
- `published`: bg-green-50, border-green-200, text-green-800
- `failed`: bg-red-50, border-red-200, text-red-700

---

## Анимации

### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

animation: fadeIn 0.3s ease-out;
```

### Slide In
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

animation: slideIn 0.3s ease-out;
```

### Loading Spin
```css
animation: spin 1s linear infinite;
```

---

## Responsive Breakpoints

```
Mobile-first approach:
- Default: Mobile (<640px)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

Примеры:
grid-cols-1           /* Mobile: 1 column */
md:grid-cols-2        /* Tablet: 2 columns */
lg:grid-cols-4        /* Desktop: 4 columns */
```

---

## Шрифты

```
Font Family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

Sizes:
- 12px (text-xs)
- 14px (text-sm)
- 16px (text-base / default)
- 18px (text-lg)
- 20px (text-xl)
- 24px (text-2xl)
- 30px (text-3xl)
- 36px (text-4xl)

Weights:
- 400 (normal)
- 500 (medium) - для полужирного текста
- 600 (semibold) - для заголовков
- 700 (bold) - для выделения
- 900 (black) - для логотипа
```

---

## Spacing Scale

```
p-1  = 0.25rem (4px)
p-2  = 0.5rem  (8px)
p-3  = 0.75rem (12px)
p-4  = 1rem    (16px)     ← Standard
p-5  = 1.25rem (20px)
p-6  = 1.5rem  (24px)     ← Cards
p-8  = 2rem    (32px)     ← Large
p-12 = 3rem    (48px)     ← Very Large

gap-3  = 0.75rem  ← Between items
gap-4  = 1rem     ← Between cards
gap-6  = 1.5rem   ← Large spacing
```

---

## Тестирование Дизайна

### Чек-лист для Вас:

1. ✅ **Откройте Admin Panel**
   - Боковая панель загружается?
   - Логотип виден?
   - Навигация работает?

2. ✅ **Проверьте Dashboard**
   - 4 карточки статистики видны?
   - Цвета градиентов правильные?
   - Кнопки действий кликаются?

3. ✅ **Проверьте Channels**
   - Форма добавления работает?
   - Карточки каналов красивые?
   - Статусы работают?

4. ✅ **Проверьте Pipeline**
   - Фильтры работают?
   - Постов видно?
   - Модальное окно открывается?

5. ✅ **Проверьте Page Test**
   - Все компоненты видны?
   - Цветовая палитра отображается?
   - Input поля работают?

---

## Проблемы и Решения

### Проблема: Цвета не отображаются
**Решение:**
```bash
# Очистить кэш и пересобрать
cd admin-panel
npm run dev -- --force
```

### Проблема: Layout сломан
**Решение:**
- Проверьте, что sidebar отображается как `w-64`
- Проверьте, что main content является `flex-1`

### Проблема: Кнопки не имеют градиент
**Решение:**
- Убедитесь, что tailwind.config.js подключен
- Проверьте, что используется `bg-gradient-to-r from-orange-400 to-orange-500`

---

## Next Steps

После проверки дизайна:
1. ✅ Все выглядит хорошо → Идите на деплой
2. ⚠️ Что-то не так → Отправьте мне скрин с проблемой
3. 🎨 Хотите изменить цвета → Скажите какие цвета предпочитаете

**Готовы к деплою? Читайте `DEPLOYMENT_GUIDE.md`**
