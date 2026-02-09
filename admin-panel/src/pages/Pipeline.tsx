import { useState } from "react";
import { getPipeline, approvePost, reprocessPost, type PipelinePost } from "../lib/api";
import { useApi } from "../hooks/useApi";
import StatusBadge from "../components/StatusBadge";
import { Check, RefreshCw, RotateCcw, Eye } from "lucide-react";

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Пайплайн</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {data?.total ?? 0} total
          </span>
          <button onClick={refetch} className="text-gray-400 hover:text-gray-600">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1 mb-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
              s === status
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
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={post.pipeline_status} />
                    <span className="text-xs text-gray-400">
                      @{post.channel_username}
                    </span>
                    {post.relevance_score !== null && (
                      <span className="text-xs font-mono text-gray-500">
                        score: {post.relevance_score}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {post.original_text || "(no text)"}
                  </p>
                  {post.rewritten_text && (
                    <p className="text-sm text-green-700 mt-1 line-clamp-2">
                      Rewrite: {post.rewritten_text}
                    </p>
                  )}
                  {post.error_message && (
                    <p className="text-xs text-red-500 mt-1">
                      Error: {post.error_message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  {post.generated_image_url && (
                    <img
                      src={post.generated_image_url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelected(post)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Eye size={12} /> Детали
                </button>
                {post.pipeline_status === "generated" && (
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Check size={12} /> Одобрить
                  </button>
                )}
                {post.pipeline_status === "failed" && (
                  <button
                    onClick={() => handleReprocess(post.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <RotateCcw size={12} /> Повторить
                  </button>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(post.created_at).toLocaleString("ru")}
                </span>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No posts with status "{status}"
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">
              Post Details
              <StatusBadge status={selected.pipeline_status} />
            </h3>
            <dl className="space-y-2 text-sm">
              <Detail label="ID" value={selected.id} />
              <Detail label="Channel" value={`@${selected.channel_username}`} />
              <Detail label="Score" value={selected.relevance_score} />
              <Detail label="Categories" value={selected.detected_categories?.join(", ")} />
              <Detail label="Techniques" value={selected.detected_techniques?.join(", ")} />
              <Detail label="AI Analysis" value={selected.ai_analysis} />
              <Detail label="Original" value={selected.original_text} />
              <Detail label="Rewritten" value={selected.rewritten_text} />
              <Detail label="Prompt EN" value={selected.generated_prompt_en} />
              <Detail label="Image URL" value={selected.generated_image_url} />
              <Detail label="Error" value={selected.error_message} />
            </dl>
            {selected.generated_image_url && (
              <img
                src={selected.generated_image_url}
                alt="Generated"
                className="mt-4 rounded-lg max-h-64 object-contain"
              />
            )}
            <button
              onClick={() => setSelected(null)}
              className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              Close
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
