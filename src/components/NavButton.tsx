import Link from 'next/link';

export function NavButton({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <Link href={href} className={`card flex h-24 items-center justify-center text-center text-lg font-semibold text-white ${color}`}>
      {label}
    </Link>
  );
}
