"use client";

import { useState } from "react";
import { LayoutDashboard, Radio, GitBranch, CalendarClock, Settings, ScrollText, Sparkles, Plus, RefreshCw, Play, Check, Eye, Clock } from "lucide-react";

export default function AdminPanelPreview() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Дашборд" },
    { id: "channels", icon: Radio, label: "Каналы" },
    { id: "pipeline", icon: GitBranch, label: "Пайплайн" },
    { id: "queue", icon: CalendarClock, label: "Очередь" },
    { id: "config", icon: Settings, label: "Настройки" },
    { id: "logs", icon: ScrollText, label: "Логи" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-orange-100 flex flex-col shadow-lg">
        <div className="p-6 border-b border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-orange-900">Имиджен</h1>
              <p className="text-xs text-orange-600">Админ-панель</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentPage === item.id
                  ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {currentPage === "dashboard" && <DashboardPreview />}
          {currentPage === "channels" && <ChannelsPreview />}
          {currentPage === "pipeline" && <PipelinePreview />}
          {currentPage === "queue" && <QueuePreview />}
          {currentPage === "config" && <ConfigPreview />}
          {currentPage === "logs" && <LogsPreview />}
        </div>
      </main>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Контрольная панель</h1>
          <p className="text-gray-600 mt-1">Здесь живёт вся магия твоего контента</p>
        </div>
        <button className="p-3 rounded-xl bg-white border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm">
          <RefreshCw size={20} className="text-orange-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Активные каналы", value: "12", sub: "8 работают", color: "blue" },
          { label: "Посты в очереди", value: "42", sub: "готово: 15", color: "purple" },
          { label: "Опубликовано", value: "156", sub: "ошибок: 2", color: "green" },
          { label: "Расходы в неделю", value: "$4.20", sub: "все счёты посчитаны", color: "orange" },
        ].map((card, i) => (
          <div key={i} className={`bg-gradient-to-br from-${card.color === "blue" ? "blue" : card.color === "purple" ? "purple" : card.color === "green" ? "green" : "orange"}-50 to-${card.color === "blue" ? "blue" : card.color === "purple" ? "purple" : card.color === "green" ? "green" : "orange"}-100 border border-${card.color === "blue" ? "blue" : card.color === "purple" ? "purple" : card.color === "green" ? "green" : "orange"}-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <p className="text-sm font-medium text-gray-700 mb-2">{card.label}</p>
            <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
            <div className="text-xs text-gray-600">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Запустить парсинг", icon: Play },
            { label: "Запустить пайплайн", icon: RefreshCw },
            { label: "Обновить планировщик", icon: Clock },
          ].map((btn, i) => (
            <button key={i} className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:from-orange-500 hover:to-orange-600 transition-all active:scale-95">
              <btn.icon size={18} />
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelsPreview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Твои каналы</h1>
          <p className="text-gray-600 mt-1">Управляй источниками контента</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95">
          <Plus size={18} /> Добавить канал
        </button>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg">
                  <Radio size={18} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">@channel_{i}</h3>
                  <p className="text-sm text-gray-600">Описание канала</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-green-50 border-green-200 text-green-700">active</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-orange-100">
              <div>
                <p className="text-xs text-gray-600">Похожесть</p>
                <p className="text-2xl font-bold text-orange-600">0.92</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Посты найдено / релевантно</p>
                <p className="text-2xl font-bold text-gray-900">145 <span className="text-lg text-gray-400">/</span> <span className="text-green-600">48</span></p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Последний парсинг</p>
                <p className="text-sm font-medium text-gray-700">сегодня</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelinePreview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Пайплайн</h1>
          <p className="text-gray-600 mt-1">Отслеживай путь контента от идеи до публикации</p>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-200 to-yellow-200 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-blue-50 border-blue-200 text-blue-700">generated</span>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">@channel_1</span>
                </div>
                <p className="text-sm text-gray-700">Интересный контент про пряничные рецепты и техники украшения</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-orange-100">
              <button className="flex items-center gap-1 px-3.5 py-2 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium">
                <Eye size={14} /> Детали
              </button>
              <button className="flex items-center gap-1 px-3.5 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium">
                <Check size={14} /> Одобрить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueuePreview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Очередь публикаций</h1>
          <p className="text-gray-600 mt-1">Посты, которые ждут своего часа</p>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5 mb-4">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-200 to-yellow-200 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-blue-50 border-blue-200 text-blue-700">queued</span>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">@channel_1</span>
                </div>
                <p className="text-sm text-gray-700">Красивая карточка с рецептом пряника и пошаговыми инструкциями</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-orange-100">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-orange-600" />
                <span className="font-medium text-gray-900">2026-02-15 14:30</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfigPreview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Настройки системы</h1>
          <p className="text-gray-600 mt-1">Управляй параметрами работы</p>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <code className="text-sm font-mono font-bold text-orange-700">CONFIG_PARAM_{i}</code>
            <p className="text-xs text-gray-600 mt-2 mb-3">Описание параметра конфигурации</p>
            <input type="text" placeholder="Значение параметра" className="w-full px-4 py-3 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LogsPreview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Логи системы</h1>
          <p className="text-gray-600 mt-1">История всех операций и ошибок</p>
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-600 font-medium">Время</p>
                <p className="text-sm text-gray-900 font-medium">2026-02-09 15:30:45</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Этап</p>
                <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-lg text-xs font-mono text-orange-700 font-semibold">generate</span>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Статус</p>
                <span className="inline-block px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-green-50 border-green-200 text-green-700">success</span>
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Время (ms)</p>
                  <p className="text-sm font-mono text-gray-900 font-semibold">234ms</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Стоимость</p>
                  <p className="text-sm font-mono text-orange-600 font-semibold">$0.0123</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
