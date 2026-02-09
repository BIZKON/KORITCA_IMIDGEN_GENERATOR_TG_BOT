export default function Test() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Визуальный Тест Дизайна</h1>
        <p className="text-lg text-gray-600">Проверка всех компонентов интерфейса</p>
      </div>

      {/* Color Palette */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Цветовая Палитра</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-orange-400 h-20"></div>
            <p className="p-2 text-xs font-medium">Primary Orange</p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-orange-500 h-20"></div>
            <p className="p-2 text-xs font-medium">Orange 500</p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-blue-500 h-20"></div>
            <p className="p-2 text-xs font-medium">Blue</p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-green-500 h-20"></div>
            <p className="p-2 text-xs font-medium">Green</p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-red-500 h-20"></div>
            <p className="p-2 text-xs font-medium">Red</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Кнопки</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-5 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95">
            Оранжевая кнопка
          </button>
          <button className="px-5 py-3 bg-white border border-orange-200 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors">
            Белая кнопка
          </button>
          <button className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
            Серая кнопка
          </button>
          <button disabled className="px-5 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed">
            Disabled
          </button>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Карточки</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Карточка 1</h3>
            <p className="text-gray-600 text-sm">Это красивая карточка с оранжевой границей</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Карточка 2</h3>
            <p className="text-blue-700 text-sm">Голубой градиент для разнообразия</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-orange-900 mb-2">Карточка 3</h3>
            <p className="text-orange-700 text-sm">Оранжево-жёлтый градиент</p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Статусы / Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-green-50 border-green-200 text-green-700">
            Active ✓
          </span>
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-yellow-50 border-yellow-200 text-yellow-700">
            Paused ⏸
          </span>
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-red-50 border-red-200 text-red-700">
            Error ✗
          </span>
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-blue-50 border-blue-200 text-blue-700">
            Processing...
          </span>
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-orange-50 border-orange-200 text-orange-700">
            Published 🎉
          </span>
        </div>
      </section>

      {/* Input Fields */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Input Fields</h2>
        <div className="space-y-3 max-w-md">
          <input
            type="text"
            placeholder="Обычный input"
            className="w-full px-4 py-3 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <textarea
            placeholder="Текстовая область"
            className="w-full px-4 py-3 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-h-24 resize-y"
          />
          <select className="w-full px-4 py-3 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option>Выберите опцию</option>
            <option>Опция 1</option>
            <option>Опция 2</option>
          </select>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Типографика</h2>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">Заголовок H1 (30px, bold)</h1>
          <h2 className="text-3xl font-bold text-gray-900">Заголовок H2 (24px, bold)</h2>
          <h3 className="text-2xl font-bold text-gray-900">Заголовок H3 (20px, bold)</h3>
          <p className="text-lg text-gray-700">Основной текст (16px, regular)</p>
          <p className="text-sm text-gray-600">Вспомогательный текст (14px, regular)</p>
          <p className="text-xs text-gray-500">Малый текст (12px, regular)</p>
        </div>
      </section>

      {/* Grid System */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Grid System</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gradient-to-br from-orange-100 to-yellow-100 border border-orange-200 rounded-xl p-4 text-center">
              <p className="font-semibold text-orange-700">Cell {i}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Spacing Scale</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">px-4 py-2</span>
            <div className="flex-1 px-4 py-2 bg-orange-100 rounded text-sm">Spacing</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">px-6 py-4</span>
            <div className="flex-1 px-6 py-4 bg-orange-100 rounded text-sm">Spacing</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">px-8 py-6</span>
            <div className="flex-1 px-8 py-6 bg-orange-100 rounded text-sm">Spacing</div>
          </div>
        </div>
      </section>
    </div>
  );
}
