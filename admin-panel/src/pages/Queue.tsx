import { getQueue } from "../lib/api";
import { useApi } from "../hooks/useApi";
import StatusBadge from "../components/StatusBadge";
import { RefreshCw, Clock, Radio } from "lucide-react";

export default function Queue() {
  const { data: posts, loading, refetch } = useApi(getQueue);

  if (loading) return <div className="text-orange-500 text-center py-12">Загрузка очереди...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Очередь публикаций</h1>
          <p className="text-gray-600 mt-1">Посты, которые ждут своего часа</p>
        </div>
        <button 
          onClick={refetch} 
          className="p-3 rounded-xl bg-white border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
        >
          <RefreshCw size={20} className="text-orange-600" />
        </button>
      </div>

      {(!posts || posts.length === 0) ? (
        <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center shadow-sm">
          <Clock size={40} className="text-orange-300 mx-auto mb-3" />
          <p className="text-gray-600">Очередь пуста</p>
          <p className="text-sm text-gray-500 mt-1">Пока что нет постов на публикацию</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => {
            // Parse schedule from admin_notes
            const scheduledMatch = post.admin_notes?.match(/scheduled:([^|]+)/);
            const scheduledAt = scheduledMatch
              ? new Date(scheduledMatch[1]).toLocaleString("ru")
              : "-";

            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-5 mb-4">
                  {post.generated_image_url && (
                    <img
                      src={post.generated_image_url}
                      alt="post"
                      className="w-24 h-24 rounded-xl object-cover shadow-sm flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge status={post.pipeline_status} />
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                        @{post.channel_username}
                      </span>
                      {post.quality_score !== null && (
                        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                          {post.quality_score}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {post.rewritten_text || post.original_text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-orange-600" />
                    <span className="font-medium text-gray-900">{scheduledAt}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Добавлено: {new Date(post.created_at).toLocaleDateString("ru")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
