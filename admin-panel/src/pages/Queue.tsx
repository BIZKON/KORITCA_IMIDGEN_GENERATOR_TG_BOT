import { getQueue } from "../lib/api";
import { useApi } from "../hooks/useApi";
import StatusBadge from "../components/StatusBadge";
import { RefreshCw } from "lucide-react";

export default function Queue() {
  const { data: posts, loading, refetch } = useApi(getQueue);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Очередь публикаций</h1>
        <button onClick={refetch} className="text-gray-400 hover:text-gray-600">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Пост</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Расписание</th>
              <th className="px-4 py-3 font-medium">Канал</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts?.map((post) => {
              // Parse schedule from admin_notes
              const scheduledMatch = post.admin_notes?.match(/scheduled:([^|]+)/);
              const scheduledAt = scheduledMatch
                ? new Date(scheduledMatch[1]).toLocaleString("ru")
                : "-";

              return (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.generated_image_url && (
                        <img
                          src={post.generated_image_url}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <p className="text-sm text-gray-700 line-clamp-1 max-w-[300px]">
                        {post.rewritten_text || post.original_text}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.pipeline_status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500">
                    {post.quality_score ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {scheduledAt}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    @{post.channel_username}
                  </td>
                </tr>
              );
            })}
            {(!posts || posts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Очередь пуста
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
