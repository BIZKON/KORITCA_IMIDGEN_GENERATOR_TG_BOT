import { getStats, triggerParse, triggerPipeline, triggerSchedule } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { Play, RefreshCw, CalendarPlus, DollarSign, Radio, GitBranch, Users } from "lucide-react";
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

  if (loading) return <div className="text-gray-500">Loading...</div>;

  const pipeline = stats?.pipeline || {};
  const pipelineTotal = stats?.pipeline_total || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button onClick={refetch} className="text-gray-400 hover:text-gray-600">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Radio size={20} />}
          label="Каналы"
          value={stats?.channels_total || 0}
          sub={`active: ${stats?.channels?.active || 0}`}
          color="blue"
        />
        <StatCard
          icon={<GitBranch size={20} />}
          label="Посты в пайплайне"
          value={pipelineTotal}
          sub={`ready: ${pipeline.ready || 0}, queued: ${pipeline.queued || 0}`}
          color="purple"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Опубликовано"
          value={pipeline.published || 0}
          sub={`failed: ${pipeline.failed || 0}`}
          color="green"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          label="Расходы / нед."
          value={`$${stats?.cost_week_usd || "0"}`}
          sub={Object.entries(stats?.cost_by_stage || {})
            .map(([k, v]) => `${k}: $${Number(v).toFixed(3)}`)
            .join(", ") || "no data"}
          color="orange"
        />
      </div>

      {/* Pipeline status breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Статусы пайплайна
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(pipeline).map(([status, count]) => (
            <div
              key={status}
              className="px-3 py-1.5 bg-gray-50 rounded-lg text-sm"
            >
              <span className="text-gray-500">{status}:</span>{" "}
              <span className="font-medium">{count as number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Быстрые действия
        </h2>
        <div className="flex gap-3">
          <ActionButton
            icon={<Play size={16} />}
            label="Запуск парсинга"
            loading={triggering === "parse"}
            onClick={() => handleTrigger("parse", triggerParse)}
          />
          <ActionButton
            icon={<RefreshCw size={16} />}
            label="Запуск пайплайна"
            loading={triggering === "pipeline"}
            onClick={() => handleTrigger("pipeline", triggerPipeline)}
          />
          <ActionButton
            icon={<CalendarPlus size={16} />}
            label="Планировщик"
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
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${colors[color]}`}>{icon}</div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1 truncate">{sub}</div>
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
      className="flex items-center gap-2 px-4 py-2 bg-cookie-500 text-white rounded-lg text-sm font-medium hover:bg-cookie-600 disabled:opacity-50 transition-colors"
    >
      {loading ? <RefreshCw size={16} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
