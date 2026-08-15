import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, getStatusText } from '@/lib/utils';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function TrainingenPage() {
  const trainings = await prisma.activity.findMany({
    where: { type: 'TRAINING' },
    orderBy: { date: 'asc' },
  });

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <PageHeader eyebrow="Trainingen" title="Overzicht" />

      <div className="space-y-3">
        {trainings.map((training) => (
          <Card key={training.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-900">{formatDate(training.date)}</p>
                <p className="text-sm text-slate-600">{training.startTime} - {training.endTime}</p>
                <p className="mt-1 text-sm text-slate-600">{training.location ?? 'Lokatie TBD'}</p>
              </div>
              <StatusBadge status={training.status} label={getStatusText(training.status)} />
            </div>
            <Link href={`/trainingen/registreren?id=${training.id}`} className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
              Registreren
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
