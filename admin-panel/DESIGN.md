# 🎨 Дизайн Админ-панели Имиджен

##概览 (Обзор)

Админ-панель создана в стиле бренда **КОРИЦА FAMILY** с теплой, уютной цветовой палитрой и дружелюбным интерфейсом.

## 🎯 Цветовая схема

### Основные цвета
- **Оранжевый (Primary)**: `#fb923c` — основной цвет действий и акцентов
- **Белый (Background)**: `#ffffff` — основной фон
- **Серый (Neutral)**: `#f9fafb` - `#6b7280` — нейтральные тона
- **Gradients**: Оранжевые градиенты для кнопок и активных элементов

### Статусы
- ✅ **Active/Published**: Зелёный (`#10b981`)
- ⏸️ **Paused**: Жёлтый (`#f59e0b`)
- ⚠️ **Error/Failed**: Красный (`#ef4444`)
- ⏳ **Processing**: Оранжевый (`#fb923c`)
- ℹ️ **Info/Queued**: Синий (`#3b82f6`)

## 📐 Типография

- **Headings**: System font (SF Pro Display, -apple-system)
- **Body**: System font с линейной высотой 1.5
- **Sizes**: 
  - H1: 30px / 36px font-bold
  - H3: 18px / 20px font-bold
  - Body: 14px - 16px
  - Small: 12px

## 🎭 Компоненты

### Карточки (Cards)
```tsx
// Основной стиль карточки
<div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow">
  {content}
</div>
```
- `rounded-2xl` — мягкие углы (16px)
- `border-orange-100` — мягкая оранжевая граница
- `shadow-sm` — лёгкая тень для глубины
- Hover эффект увеличивает тень

### Кнопки
```tsx
// Основная кнопка
<button className="px-5 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95">
  Действие
</button>

// Вторичная кнопка
<button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
  Отмена
</button>
```
- Градиентный фон для основных действий
- `active:scale-95` — микро-интеракция при клике

### Badges (StatusBadge)
```tsx
<span className="inline-block px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-orange-50 border-orange-200 text-orange-700">
  Status
</span>
```
- Solid border для чёткости
- Мягкий фон с чётким текстом

### Inputs
```tsx
<input 
  className="px-4 py-3 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
/>
```
- `rounded-xl` — 12px border-radius
- Focus ring в оранжевом цвете бренда

## 🎬 Анимации

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
```

### Micro-interactions
- Button hover: `transition-all 0.2s ease`
- Button active: `scale-95`
- Input focus: `transform: translateY(-1px)`

## 📦 Layout Grid

- **Sidebar**: `w-64` (fixed)
- **Main Content**: `flex-1`
- **Card Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Padding**: `p-8` для main section

## 🔤 Типические классы Tailwind

```
Spacing:
- p-4, p-5, p-6, p-8 — padding
- gap-3, gap-4, gap-6 — gaps между элементами
- mb-3, mb-4, mb-6, mb-8 — margin-bottom

Border Radius:
- rounded-lg (8px)
- rounded-xl (12px)
- rounded-2xl (16px)

Shadows:
- shadow-sm — лёгкая
- shadow-md — средняя
- shadow-lg — большая

Colors:
- orange-{50,100,200,...,900} — оранжевый спектр
- bg-orange-50, text-orange-600 и т.д.
```

## 🎨 Пример: Новая карточка

```tsx
<div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2.5 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg">
      <Icon size={20} className="text-orange-600" />
    </div>
    <h3 className="text-lg font-bold text-gray-900">Заголовок</h3>
  </div>
  
  <p className="text-sm text-gray-700 mb-4">Содержание</p>
  
  <div className="flex gap-3 pt-4 border-t border-orange-100">
    <button className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg">
      Действие
    </button>
  </div>
</div>
```

## 📱 Responsive Design

- Mobile first approach
- Breakpoints: `sm:`, `md:`, `lg:`
- Grid: `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-4`

## ✅ Чек-лист при добавлении компонентов

- [ ] Используются `rounded-xl` или `rounded-2xl`
- [ ] Border: `border-orange-100` или `border-orange-200`
- [ ] Shadow: `shadow-sm` с `hover:shadow-md`
- [ ] Кнопки: градиент или мягкий фон
- [ ] Текст: правильная контрастность
- [ ] Спэйсинг: используются стандартные значения (gap, p, m)
- [ ] Анимации: `transition-all 0.2s ease`
- [ ] Mobile: проверено на мобильных устройствах

---

**Дизайн вдохновлён бизнес-ценностями КОРИЦА FAMILY: уютность, поддержка, мотивация и ясность.**
