import Link from 'next/link';

export function BackLink({ href = '/', label = 'Home' }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
      {label}
    </Link>
  );
}
