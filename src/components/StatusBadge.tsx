export function StatusBadge({ status, label }: { status: string; label: string }) {
  const isRegistered = status === 'registered';
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        isRegistered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {label}
    </span>
  );
}
