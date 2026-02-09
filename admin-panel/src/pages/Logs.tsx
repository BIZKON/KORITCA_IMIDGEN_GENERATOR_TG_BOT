import { useState } from "react";
import { getLogs } from "../lib/api";
import { useApi } from "../hooks/useApi";
import StatusBadge from "../components/StatusBadge";
import { RefreshCw, Activity } from "lucide-react";

const STAGES = ["all", "parse", "analyze", "rewrite", "prompt", "generate", "publish"];

export default function Logs() {
  const [stage, setStage] = useState("all");
  const { data: logs, loading, refetch } = useApi(
    () => getLogs(100, stage === "all" ? undefined : stage),
    [stage]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Логи системы</h1>
          <p className="text-gray-600 mt-1">История всех операций и ошибок</p>
        </div>
        <button 
          onClick={refetch} 
          className="p-3 rounded-xl bg-white border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
        >
          <RefreshCw size={20} className="text-orange-600" />
        </button>
      </div>

      {/* Stage filter */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-2xl border border-orange-100 shadow-sm">
        <span className="text-xs font-semibold text-gray-600 self-center">Этап:</span>
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              s === stage
                ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-orange-500 text-center py-12">Загрузка логов...</div>
      ) : (!logs || logs.length === 0) ? (
        <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center shadow-sm">
          <Activity size={40} className="text-orange-300 mx-auto mb-3" />
          <p className="text-gray-600">Нет логов для этого этапа</p>
          <p className="text-sm text-gray-500 mt-1">Логи будут появляться со временем</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs?.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Время</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {new Date(log.created_at).toLocaleString("ru")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Этап</p>
                  <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-lg text-xs font-mono text-orange-700 font-semibold">
                    {log.stage}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Статус</p>
                  <StatusBadge status={log.status} />
                </div>
                <div className="flex items-end gap-6">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Время (ms)</p>
                    <p className="text-sm font-mono text-gray-900 font-semibold">
                      {log.duration_ms ? `${log.duration_ms}ms` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Стоимость</p>
                    <p className="text-sm font-mono text-orange-600 font-semibold">
                      {log.cost_usd ? `$${Number(log.cost_usd).toFixed(4)}` : "-"}
                    </p>
                  </div>
                </div>
              </div>
              {log.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                  <strong>Ошибка:</strong> {log.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
