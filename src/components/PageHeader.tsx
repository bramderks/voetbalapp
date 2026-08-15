import { BackLink } from '@/components/BackLink';

export function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      </div>
      <BackLink />
    </header>
  );
}
