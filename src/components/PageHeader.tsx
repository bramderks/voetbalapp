import { BackLink } from '@/components/BackLink';
import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, icon }: { eyebrow: string; title: string; icon?: ReactNode }) {
  return (
    <header className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <span className="text-2xl leading-none">{icon}</span>}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        </div>
      </div>
      <BackLink />
    </header>
  );
}
