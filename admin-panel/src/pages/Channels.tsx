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
import { Plus, Trash2, Pause, Play, RefreshCw, Radio } from "lucide-react";

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

  if (loading) return <div className="text-orange-500 text-center py-12">Загрузка каналов...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Твои каналы</h1>
          <p className="text-gray-600 mt-1">Управляй источниками контента</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refetch} 
            className="p-3 rounded-xl bg-white border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
          >
            <RefreshCw size={20} className="text-orange-600" />
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
          >
            <Plus size={18} /> Добавить канал
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-orange-200 p-6 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Новый канал</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Юзернейм (без @)"
              className="px-4 py-3 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Название (опционально)"
              className="px-4 py-3 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="px-5 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
            >
              Добавить
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Channels grid */}
      {(!channels || channels.length === 0) ? (
        <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center shadow-sm">
          <Radio size={40} className="text-orange-300 mx-auto mb-3" />
          <p className="text-gray-600">Каналов пока нет</p>
          <p className="text-sm text-gray-500 mt-1">Добавьте первый канал, чтобы начать</p>
        </div>
      ) : (
        <div className="space-y-4">
          {channels?.map((ch) => (
            <div
              key={ch.id}
              className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg">
                      <Radio size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">@{ch.username}</h3>
                      {ch.title && (
                        <p className="text-sm text-gray-600">{ch.title}</p>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={ch.status} />
              </div>

              {ch.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
                  {ch.error_message}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-orange-100">
                <div>
                  <p className="text-xs text-gray-600">Похожесть</p>
                  <p className="text-2xl font-bold text-orange-600">{ch.similarity_score}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Посты найдено / релевантно</p>
                  <p className="text-2xl font-bold text-gray-900">{ch.posts_found} <span className="text-lg text-gray-400">/</span> <span className="text-green-600">{ch.posts_relevant}</span></p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Последний парсинг</p>
                  <p className="text-sm font-medium text-gray-700">
                    {ch.last_parsed_at
                      ? new Date(ch.last_parsed_at).toLocaleString("ru").split(",")[0]
                      : "никогда"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(ch)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    ch.status === "active"
                      ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
                      : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                  }`}
                >
                  {ch.status === "active" ? (
                    <>
                      <Pause size={14} /> Приостановить
                    </>
                  ) : (
                    <>
                      <Play size={14} /> Возобновить
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(ch)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-all"
                >
                  <Trash2 size={14} /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
