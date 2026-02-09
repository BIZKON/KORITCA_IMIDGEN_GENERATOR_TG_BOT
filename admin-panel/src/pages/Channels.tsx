import { useState } from "react";
import {
  getChannels,
  addChannel,
  updateChannel,
  deleteChannel,
  type Channel,
} from "../lib/api";
import { useApi } from "../hooks/useApi";
import StatusBadge from "../components/StatusBadge";
import { Plus, Trash2, Pause, Play, RefreshCw } from "lucide-react";

export default function Channels() {
  const { data: channels, loading, refetch } = useApi(getChannels);
  const [showAdd, setShowAdd] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newTitle, setNewTitle] = useState("");

  async function handleAdd() {
    if (!newUsername.trim()) return;
    try {
      await addChannel({ username: newUsername.trim(), title: newTitle.trim() || undefined });
      setNewUsername("");
      setNewTitle("");
      setShowAdd(false);
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  }

  async function handleToggle(ch: Channel) {
    const newStatus = ch.status === "active" ? "paused" : "active";
    await updateChannel(ch.id, { status: newStatus });
    refetch();
  }

  async function handleDelete(ch: Channel) {
    if (!confirm(`Delete channel @${ch.username}?`)) return;
    await deleteChannel(ch.id);
    refetch();
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Каналы</h1>
        <div className="flex gap-2">
          <button onClick={refetch} className="text-gray-400 hover:text-gray-600">
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-3 py-1.5 bg-cookie-500 text-white rounded-lg text-sm hover:bg-cookie-600"
          >
            <Plus size={16} /> Добавить
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex gap-3">
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="username (без @)"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Название (опционально)"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              Добавить
            </button>
          </div>
        </div>
      )}

      {/* Channels table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Канал</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Посты</th>
              <th className="px-4 py-3 font-medium">Парсинг</th>
              <th className="px-4 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {channels?.map((ch) => (
              <tr key={ch.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    @{ch.username}
                  </div>
                  {ch.title && (
                    <div className="text-xs text-gray-400">{ch.title}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ch.status} />
                  {ch.error_message && (
                    <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate">
                      {ch.error_message}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-mono">{ch.similarity_score}</td>
                <td className="px-4 py-3">
                  <span className="text-gray-600">{ch.posts_found}</span>
                  <span className="text-gray-300"> / </span>
                  <span className="text-green-600">{ch.posts_relevant}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {ch.last_parsed_at
                    ? new Date(ch.last_parsed_at).toLocaleString("ru")
                    : "never"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggle(ch)}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title={ch.status === "active" ? "Pause" : "Resume"}
                    >
                      {ch.status === "active" ? (
                        <Pause size={14} className="text-yellow-500" />
                      ) : (
                        <Play size={14} className="text-green-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(ch)}
                      className="p-1.5 rounded hover:bg-gray-100"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!channels || channels.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Каналов пока нет. Нажмите "Добавить".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
