import { useState } from "react";
import { getLogs } from "../lib/api";
import { useApi } from "../hooks/useApi";
import StatusBadge from "../components/StatusBadge";
import { RefreshCw } from "lucide-react";

const STAGES = ["all", "parse", "analyze", "rewrite", "prompt", "generate", "publish"];

export default function Logs() {
  const [stage, setStage] = useState("all");
  const { data: logs, loading, refetch } = useApi(
    () => getLogs(100, stage === "all" ? undefined : stage),
    [stage]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Логи</h1>
        <button onClick={refetch} className="text-gray-400 hover:text-gray-600">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Stage filter */}
      <div className="flex gap-1 mb-4">
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
              s === stage
                ? "bg-cookie-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Время</th>
                <th className="px-4 py-3 font-medium">Этап</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Время (ms)</th>
                <th className="px-4 py-3 font-medium">Стоимость</th>
                <th className="px-4 py-3 font-medium">Ошибка</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs?.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleString("ru")}
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">
                      {log.stage}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-2 font-mono text-gray-500 text-xs">
                    {log.duration_ms ? `${log.duration_ms}ms` : "-"}
                  </td>
                  <td className="px-4 py-2 font-mono text-gray-500 text-xs">
                    {log.cost_usd ? `$${Number(log.cost_usd).toFixed(4)}` : "-"}
                  </td>
                  <td className="px-4 py-2 text-xs text-red-500 max-w-[200px] truncate">
                    {log.error || "-"}
                  </td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No logs
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
