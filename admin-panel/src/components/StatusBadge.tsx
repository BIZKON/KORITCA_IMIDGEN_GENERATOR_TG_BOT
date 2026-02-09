const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  active: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  paused: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  parsed: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
  analyzed: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  rewriting: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  rewritten: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  prompting: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  prompted: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  generating: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  generated: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  ready: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  queued: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  published: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800" },
  failed: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  skipped: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" },
  scheduled: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  posted: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  completed: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  started: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
};

export default function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" };
  return (
    <span
      className={`inline-block px-3.5 py-1.5 rounded-lg text-xs font-semibold border ${color.bg} ${color.border} ${color.text}`}
    >
      {status}
    </span>
  );
}
