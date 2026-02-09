const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  parsed: "bg-gray-100 text-gray-700",
  analyzed: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  rewriting: "bg-purple-100 text-purple-700",
  rewritten: "bg-purple-100 text-purple-700",
  prompting: "bg-indigo-100 text-indigo-700",
  prompted: "bg-indigo-100 text-indigo-700",
  generating: "bg-orange-100 text-orange-700",
  generated: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  queued: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-gray-500",
  scheduled: "bg-blue-100 text-blue-700",
  posted: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  started: "bg-yellow-100 text-yellow-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {status}
    </span>
  );
}
