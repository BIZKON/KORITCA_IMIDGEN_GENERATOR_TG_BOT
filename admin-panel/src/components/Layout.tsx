import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Radio,
  GitBranch,
  CalendarClock,
  Settings,
  ScrollText,
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-cookie-700">
            Пряничная школа
          </h1>
          <p className="text-xs text-gray-500">Админ-панель</p>
        </div>
        <nav className="flex-1 p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-cookie-50 text-cookie-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
