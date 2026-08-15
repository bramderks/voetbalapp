import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, getStatusText } from '@/lib/utils';

export default async function TrainingenPage() {
  const trainings = await prisma.activity.findMany({
    where: { type: 'TRAINING' },
    orderBy: { date: 'asc' },
  });

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trainingen</p>
          <h1 className="text-2xl font-bold text-slate-900">Overzicht</h1>
        </div>
        <Link href="/" className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
          Home
        </Link>
      </header>

      <div className="space-y-3">
        {trainings.map((training) => (
          <div key={training.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-900">{formatDate(training.date)}</p>
                <p className="text-sm text-slate-600">{training.startTime} - {training.endTime}</p>
                <p className="mt-1 text-sm text-slate-600">{training.location ?? 'Lokatie TBD'}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${training.status === 'registered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {getStatusText(training.status)}
              </span>
            </div>
            <Link href={`/trainingen/registreren?id=${training.id}`} className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
              Registreren
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
