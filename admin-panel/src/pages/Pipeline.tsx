import { useState } from "react";
import { getPipeline, approvePost, reprocessPost, type PipelinePost } from "../lib/api";
import { useApi } from "../hooks/useApi";
import StatusBadge from "../components/StatusBadge";
import { Check, RefreshCw, RotateCcw, Eye, X, GitBranch } from "lucide-react";

const STATUSES = [
  "all", "parsed", "analyzed", "rejected", "rewriting", "rewritten",
  "prompting", "prompted", "generating", "generated", "ready",
  "queued", "published", "failed", "skipped",
];

export default function Pipeline() {
  const [status, setStatus] = useState("all");
  const { data, loading, refetch } = useApi(
    () => getPipeline(status),
    [status]
  );
  const [selected, setSelected] = useState<PipelinePost | null>(null);

  async function handleApprove(id: string) {
    await approvePost(id);
    refetch();
  }

  async function handleReprocess(id: string) {
    await reprocessPost(id);
    refetch();
  }

  const posts = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Пайплайн</h1>
          <p className="text-gray-600 mt-1">Отслеживай путь контента от идеи до публикации</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-orange-100 border border-orange-200 rounded-xl">
            <span className="text-sm font-semibold text-orange-700">
              {data?.total ?? 0} постов
            </span>
          </div>
          <button 
            onClick={refetch} 
            className="p-3 rounded-xl bg-white border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
          >
            <RefreshCw size={20} className="text-orange-600" />
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-2xl border border-orange-100 shadow-sm">
        <span className="text-xs font-semibold text-gray-600 self-center">Фильтры:</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              s === status
                ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-orange-500 text-center py-12">Загрузка постов...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center shadow-sm">
          <GitBranch size={40} className="text-orange-300 mx-auto mb-3" />
          <p className="text-gray-600">Нет постов со статусом "{status}"</p>
          <p className="text-sm text-gray-500 mt-1">Они появятся со временем</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <StatusBadge status={post.pipeline_status} />
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                      @{post.channel_username}
                    </span>
                    {post.relevance_score !== null && (
                      <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {post.relevance_score}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {post.original_text || "(без текста)"}
                  </p>
                  {post.rewritten_text && (
                    <p className="text-sm text-green-700 line-clamp-2 bg-green-50 p-3 rounded-lg border border-green-200">
                      ✨ {post.rewritten_text}
                    </p>
                  )}
                  {post.error_message && (
                    <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mt-2">
                      ⚠️ {post.error_message}
                    </p>
                  )}
                </div>
                {post.generated_image_url && (
                  <img
                    src={post.generated_image_url}
                    alt="generated"
                    className="w-20 h-20 rounded-xl object-cover shadow-sm flex-shrink-0"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-orange-100 flex-wrap">
                <button
                  onClick={() => setSelected(post)}
                  className="flex items-center gap-1 px-3.5 py-2 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                >
                  <Eye size={14} /> Детали
                </button>
                {post.pipeline_status === "generated" && (
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="flex items-center gap-1 px-3.5 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium transition-colors"
                  >
                    <Check size={14} /> Одобрить
                  </button>
                )}
                {post.pipeline_status === "failed" && (
                  <button
                    onClick={() => handleReprocess(post.id)}
                    className="flex items-center gap-1 px-3.5 py-2 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 font-medium transition-colors"
                  >
                    <RotateCcw size={14} /> Переделать
                  </button>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {new Date(post.created_at).toLocaleString("ru")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Детали поста
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="flex gap-4 mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
              <StatusBadge status={selected.pipeline_status} />
              <span className="text-sm font-medium text-orange-700">@{selected.channel_username}</span>
              {selected.relevance_score !== null && (
                <span className="text-sm font-mono text-orange-900">Score: {selected.relevance_score}</span>
              )}
            </div>

            <dl className="space-y-4 text-sm">
              <Detail label="ID" value={selected.id} />
              <Detail label="Категории" value={selected.detected_categories?.join(", ")} />
              <Detail label="Техники" value={selected.detected_techniques?.join(", ")} />
              <Detail label="Анализ AI" value={selected.ai_analysis} />
              <Detail label="Оригинальный текст" value={selected.original_text} />
              <Detail label="Переработанный текст" value={selected.rewritten_text} />
              <Detail label="Промпт (EN)" value={selected.generated_prompt_en} />
              <Detail label="URL изображения" value={selected.generated_image_url} />
              <Detail label="Ошибка" value={selected.error_message} />
            </dl>

            {selected.generated_image_url && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-600 mb-2">Сгенерированное изображение</p>
                <img
                  src={selected.generated_image_url}
                  alt="Generated"
                  className="rounded-xl max-h-72 object-contain border border-orange-200 w-full"
                />
              </div>
            )}

            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-gray-800 break-words">{String(value)}</dd>
    </div>
  );
}
