import { prisma } from '@/lib/prisma';
import { buildStats } from '@/lib/utils';

export default async function StatistiekenPage() {
  const stats = await buildStats();

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Statistieken</p>
        <h1 className="text-2xl font-bold text-slate-900">Team & spelers</h1>
      </header>

      <section className="card mb-5">
        <h2 className="text-lg font-bold text-slate-900">Teamstatistieken</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-100 p-3">
            <p className="text-slate-500">Opkomst</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{stats.team.attendanceRate}%</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-3">
            <p className="text-slate-500">Goals</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{stats.team.goals}</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-3">
            <p className="text-slate-500">Assists</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{stats.team.assists}</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-3">
            <p className="text-slate-500">Resultaat</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{stats.team.wins}-{stats.team.draws}-{stats.team.losses}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Spelerstatistieken</h2>
        {stats.players.map((player) => (
          <div key={player.id} className="card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{player.name}</p>
                <p className="text-sm text-slate-600">Trainingen: {player.trainingCount}</p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p>Opkomst: {player.attendanceRate}%</p>
                <p>Goals: {player.goals}</p>
                <p>Assists: {player.assists}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
