import { formatDate, getNextActivity, getStatusText } from '@/lib/utils';
import { Card } from '@/components/Card';
import { NavButton } from '@/components/NavButton';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const nextActivity = await getNextActivity();

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Voetbalapp</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
      </header>

      <Card className="mb-6 bg-emerald-50">
        <p className="text-sm font-medium text-emerald-700">Volgende activiteit</p>
        {nextActivity ? (
          <>
            <h2 className="mt-3 text-xl font-bold text-slate-900">{nextActivity.type === 'TRAINING' ? 'Training' : 'Wedstrijd'}</h2>
            <p className="mt-1 text-sm text-slate-700">{formatDate(nextActivity.date)}</p>
            <p className="mt-2 text-sm text-slate-700">
              {nextActivity.startTime} - {nextActivity.endTime}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {nextActivity.location ?? 'Locatie nog niet bekend'}
            </p>
            <p className="mt-2 text-sm text-slate-600">Status: {getStatusText(nextActivity.status)}</p>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-700">Geen toekomstige activiteit gevonden.</p>
        )}
      </Card>

      <nav className="grid grid-cols-2 gap-3">
        <NavButton href="/trainingen" label="Trainingen" color="bg-slate-900" />
        <NavButton href="/wedstrijden" label="Wedstrijden" color="bg-emerald-600" />
        <NavButton href="/spelers" label="Spelers" color="bg-amber-500" />
        <NavButton href="/statistieken" label="Statistieken" color="bg-sky-600" />
      </nav>
    </main>
  );
}
