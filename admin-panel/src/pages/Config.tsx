import { useState } from "react";
import { getConfig, updateConfig, type ConfigItem } from "../lib/api";
import { useApi } from "../hooks/useApi";
import { Save, RefreshCw } from "lucide-react";

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

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        <button onClick={refetch} className="text-gray-400 hover:text-gray-600">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="space-y-3">
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
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono text-cookie-700">
                      {item.key}
                    </code>
                    {item.description && (
                      <span className="text-xs text-gray-400">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {isLongText ? (
                    <textarea
                      value={currentValue}
                      onChange={(e) => handleEdit(item.key, e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono resize-y min-h-[80px]"
                      rows={3}
                    />
                  ) : (
                    <input
                      value={currentValue}
                      onChange={(e) => handleEdit(item.key, e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono"
                    />
                  )}
                </div>
                <button
                  onClick={() => handleSave(item)}
                  disabled={!isModified || saving === item.key}
                  className={`mt-6 p-2 rounded-lg transition-colors ${
                    isModified
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-100 text-gray-300"
                  }`}
                >
                  {saving === item.key ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-300 mt-1">
                Updated: {new Date(item.updated_at).toLocaleString("ru")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
