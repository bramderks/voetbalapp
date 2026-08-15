import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';

export const dynamic = 'force-dynamic';

export default async function WedstrijdenPage() {
  const matches = await prisma.activity.findMany({
    where: { type: 'MATCH' },
    orderBy: { date: 'asc' },
  });

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <PageHeader eyebrow="Wedstrijden" title="Overzicht" icon="⚽" />

      <div className="space-y-3">
        {matches.map((match) => (
          <Card key={match.id}>
            <p className="text-lg font-bold text-slate-900">{match.opponent ?? 'Tegenstander TBD'}</p>
            <p className="mt-1 text-sm text-slate-600">{formatDate(match.date)}</p>
            <p className="mt-1 text-sm text-slate-600">{match.location ?? 'Locatie TBD'}</p>
            <p className="mt-1 text-sm text-slate-600">{match.startTime} - {match.endTime}</p>
            <div className="mt-3 flex gap-2">
              <Link href={`/wedstrijden/registreren?id=${match.id}`} className="flex-1 rounded-xl bg-emerald-600 px-3 py-3 text-center text-sm font-semibold text-white">
                Registreren
              </Link>
              <Link href={`/wedstrijden/bewerken?id=${match.id}`} className="flex-1 rounded-xl bg-slate-200 px-3 py-3 text-center text-sm font-semibold text-slate-800">
                Bewerken
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
