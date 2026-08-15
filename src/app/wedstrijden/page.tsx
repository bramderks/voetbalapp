import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function WedstrijdenPage() {
  const matches = await prisma.activity.findMany({
    where: { type: 'MATCH' },
    orderBy: { date: 'asc' },
  });

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wedstrijden</p>
          <h1 className="text-2xl font-bold text-slate-900">Overzicht</h1>
        </div>
        <Link href="/" className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
          Home
        </Link>
      </header>

      <div className="space-y-3">
        {matches.map((match) => (
          <div key={match.id} className="card">
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
          </div>
        ))}
      </div>
    </main>
  );
}
