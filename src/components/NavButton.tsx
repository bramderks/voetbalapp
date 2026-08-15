import Link from 'next/link';
import type { ReactNode } from 'react';

export function NavButton({ href, label, color, icon }: { href: string; label: string; color: string; icon?: ReactNode }) {
  return (
    <Link href={href} className={`card flex h-24 flex-col items-center justify-center gap-1 text-center text-lg font-semibold text-white ${color}`}>
      {icon && <span className="text-2xl leading-none">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}
