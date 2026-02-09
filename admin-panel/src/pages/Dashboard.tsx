import { getStats, triggerParse, triggerPipeline, triggerSchedule } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { Play, RefreshCw, CalendarPlus, DollarSign, Radio, GitBranch, Users, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { data: stats, loading, refetch } = useApi(getStats);
  const [triggering, setTriggering] = useState<string | null>(null);

  async function handleTrigger(name: string, fn: () => Promise<unknown>) {
    setTriggering(name);
    try {
      await fn();
      await refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setTriggering(null);
    }
  }

  if (loading) return <div className="text-orange-500 text-center py-12">Загрузка данных...</div>;

  const pipeline = stats?.pipeline || {};
  const pipelineTotal = stats?.pipeline_total || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Контрольная панель</h1>
          <p className="text-gray-600 mt-1">Здесь живёт вся магия твоего контента</p>
        </div>
        <button 
          onClick={refetch} 
          className="p-3 rounded-xl bg-white border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
        >
          <RefreshCw size={20} className="text-orange-600" />
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={<Radio size={20} />}
          label="Активные каналы"
          value={stats?.channels_total || 0}
          sub={`${stats?.channels?.active || 0} работают`}
          color="blue"
        />
        <StatCard
          icon={<GitBranch size={20} />}
          label="Посты в очереди"
          value={pipelineTotal}
          sub={`готово: ${pipeline.ready || 0}`}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Опубликовано"
          value={pipeline.published || 0}
          sub={`ошибок: ${pipeline.failed || 0}`}
          color="green"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          label="Расходы в неделю"
          value={`$${stats?.cost_week_usd || "0"}`}
          sub="все счёты посчитаны"
          color="orange"
        />
      </div>

      {/* Pipeline status breakdown */}
      <div className="bg-white rounded-2xl border border-orange-100 p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-orange-600" />
          <h2 className="text-lg font-bold text-gray-900">
            Статусы пайплайна
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(pipeline).map(([status, count]) => (
            <div
              key={status}
              className="px-4 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl text-sm font-medium"
            >
              <span className="text-orange-700">{status}:</span>{" "}
              <span className="text-orange-900 font-bold">{count as number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ActionButton
            icon={<Play size={18} />}
            label="Запустить парсинг"
            loading={triggering === "parse"}
            onClick={() => handleTrigger("parse", triggerParse)}
          />
          <ActionButton
            icon={<RefreshCw size={18} />}
            label="Запустить пайплайн"
            loading={triggering === "pipeline"}
            onClick={() => handleTrigger("pipeline", triggerPipeline)}
          />
          <ActionButton
            icon={<CalendarPlus size={18} />}
            label="Обновить планировщик"
            loading={triggering === "schedule"}
            onClick={() => handleTrigger("schedule", triggerSchedule)}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  const colors: Record<string, { bg: string; icon: string; border: string }> = {
    blue: {
      bg: "from-blue-50 to-blue-100",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      icon: "text-purple-600",
      border: "border-purple-200",
    },
    green: {
      bg: "from-green-50 to-green-100",
      icon: "text-green-600",
      border: "border-green-200",
    },
    orange: {
      bg: "from-orange-50 to-yellow-50",
      icon: "text-orange-600",
      border: "border-orange-200",
    },
  };

  const colorConfig = colors[color];

  return (
    <div className={`bg-gradient-to-br ${colorConfig.bg} border ${colorConfig.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className={`p-2.5 rounded-xl bg-white`}>
          <div className={colorConfig.icon}>{icon}</div>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-2">{sub}</div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:from-orange-500 hover:to-orange-600 disabled:opacity-60 transition-all duration-200 active:scale-95"
    >
      {loading ? <RefreshCw size={18} className="animate-spin" /> : icon}
      <span>{label}</span>
    </button>
  );
}
