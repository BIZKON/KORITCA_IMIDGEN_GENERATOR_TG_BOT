import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  GitBranch,
  CalendarClock,
  Settings,
  ScrollText,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Дашборд" },
  { to: "/channels", icon: Radio, label: "Каналы" },
  { to: "/pipeline", icon: GitBranch, label: "Пайплайн" },
  { to: "/queue", icon: CalendarClock, label: "Очередь" },
  { to: "/config", icon: Settings, label: "Настройки" },
  { to: "/logs", icon: ScrollText, label: "Логи" },
];

export default function Layout() {
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
              <h1 className="text-xl font-bold text-orange-900">
                Имиджен
              </h1>
              <p className="text-xs text-orange-600">Админ-панель</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-orange-100">
          <p className="text-xs text-gray-500 text-center">
            Генератор контента для пряничного дела
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
