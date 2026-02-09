import { useState } from "react";
import { getConfig, updateConfig, type ConfigItem } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { Save, RefreshCw, Settings } from "lucide-react";

export default function Config() {
  const { data: configs, loading, refetch } = useApi(getConfig);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  function handleEdit(key: string, value: string) {
    setEdits((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(item: ConfigItem) {
    const newValue = edits[item.key];
    if (newValue === undefined) return;

    setSaving(item.key);
    try {
      // Try to parse as JSON, fallback to string
      let parsed: unknown;
      try {
        parsed = JSON.parse(newValue);
      } catch {
        parsed = newValue;
      }
      await updateConfig(item.key, parsed);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[item.key];
        return next;
      });
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <div className="text-orange-500 text-center py-12">Загрузка настроек...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Настройки системы</h1>
          <p className="text-gray-600 mt-1">Управляй параметрами работы</p>
        </div>
        <button 
          onClick={refetch} 
          className="p-3 rounded-xl bg-white border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
        >
          <RefreshCw size={20} className="text-orange-600" />
        </button>
      </div>

      <div className="space-y-4">
        {configs?.map((item) => {
          const currentValue =
            edits[item.key] !== undefined
              ? edits[item.key]
              : typeof item.value === "string"
                ? item.value
                : JSON.stringify(item.value);
          const isModified = edits[item.key] !== undefined;
          const isLongText = String(currentValue).length > 80;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Settings size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <code className="text-sm font-mono font-bold text-orange-700">
                        {item.key}
                      </code>
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {isLongText ? (
                    <textarea
                      value={currentValue}
                      onChange={(e) => handleEdit(item.key, e.target.value)}
                      className="w-full px-4 py-3 border border-orange-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y min-h-[100px]"
                      rows={3}
                    />
                  ) : (
                    <input
                      value={currentValue}
                      onChange={(e) => handleEdit(item.key, e.target.value)}
                      className="w-full px-4 py-3 border border-orange-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  )}
                </div>
                <button
                  onClick={() => handleSave(item)}
                  disabled={!isModified || saving === item.key}
                  className={`mt-1 p-3 rounded-xl transition-all ${
                    isModified
                      ? "bg-green-400 text-white hover:bg-green-500 shadow-md"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  title={isModified ? "Сохранить" : "Нет изменений"}
                >
                  {saving === item.key ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500 border-t border-orange-100 pt-3">
                Обновлено: {new Date(item.updated_at).toLocaleString("ru")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
