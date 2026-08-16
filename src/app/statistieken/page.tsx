import { buildStats } from '@/lib/server-utils';
import { PageHeader } from '@/components/PageHeader';


export const dynamic = 'force-dynamic';

export default async function StatistiekenPage() {
  const stats = await buildStats();

  return (
    <main className="mx-auto max-w-md p-4 pb-10 bg-black min-h-screen text-white">
      <PageHeader eyebrow="Statistieken" title="Team & spelers" icon="📊" />

      {/* Team Statistics Section */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold text-white">Teamstatistieken</h2>

        {/* Trainings Section */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white text-black p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trainingen</p>
            <p className="mt-2 text-2xl font-bold">{stats.team.totalTrainings}</p>
            <p className="mt-1 text-xs text-slate-600">totaal dit seizoen</p>
          </div>
          <div className="rounded-xl bg-white text-black p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Geregistreerd</p>
            <p className="mt-2 text-2xl font-bold">{stats.team.trainingsWithAttendance}</p>
            <p className="mt-1 text-xs text-slate-600">met deelname</p>
          </div>
          <div className="rounded-xl bg-white text-black p-4 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opkomst trainingen</p>
                <p className="mt-1 text-xs text-slate-600">gemiddeld percentage</p>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{stats.team.trainingAttendanceRate}%</p>
            </div>
          </div>
        </div>

        {/* Matches Section */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white text-black p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wedstrijden</p>
            <p className="mt-2 text-2xl font-bold">{stats.team.totalMatches}</p>
            <p className="mt-1 text-xs text-slate-600">totaal dit seizoen</p>
          </div>
          <div className="rounded-xl bg-white text-black p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Geregistreerd</p>
            <p className="mt-2 text-2xl font-bold">{stats.team.matchesWithAttendance}</p>
            <p className="mt-1 text-xs text-slate-600">met deelname</p>
          </div>
          <div className="rounded-xl bg-white text-black p-4 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opkomst wedstrijden</p>
                <p className="mt-1 text-xs text-slate-600">gemiddeld percentage</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.team.matchAttendanceRate}%</p>
            </div>
          </div>
        </div>

        {/* Goals & Assists Section */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white text-black p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Goals</p>
            <p className="mt-2 text-2xl font-bold">{stats.team.totalGoals}</p>
            <p className="mt-1 text-xs text-slate-600">dit seizoen</p>
          </div>
          <div className="rounded-xl bg-white text-black p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assists</p>
            <p className="mt-2 text-2xl font-bold">{stats.team.totalAssists}</p>
            <p className="mt-1 text-xs text-slate-600">dit seizoen</p>
          </div>
        </div>

        {/* Match Results Section */}
        <div className="rounded-xl bg-white text-black p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wedstrijdresultaten</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-2xl font-bold text-emerald-600">{stats.team.wins}</p>
              <p className="mt-1 text-xs text-slate-600">Gewonnen</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-2xl font-bold text-slate-600">{stats.team.draws}</p>
              <p className="mt-1 text-xs text-slate-600">Gelijk</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3">
              <p className="text-2xl font-bold text-rose-600">{stats.team.losses}</p>
              <p className="mt-1 text-xs text-slate-600">Verloren</p>
            </div>
          </div>
        </div>
      </section>

      {/* Player Statistics Section */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-white">Spelerstatistieken</h2>
        <div className="space-y-3">
          {stats.players.map((player) => (
            <div key={player.id} className="rounded-xl bg-white text-black p-4">
              <div className="mb-3">
                <p className="text-base font-bold">{player.name}</p>
              </div>

              {/* Training Stats */}
              <div className="mb-3 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Trainingen</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-bold">{player.trainingCount}</p>
                    <p className="text-xs text-slate-600">Deelgenomen</p>
                  </div>
                  <div>
                    <p className="font-bold">{player.trainingAttendance}</p>
                    <p className="text-xs text-slate-600">Aanwezig</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-600">{player.trainingAttendanceRate}%</p>
                    <p className="text-xs text-slate-600">Opkomst</p>
                  </div>
                </div>
              </div>

              {/* Match Stats */}
              <div className="mb-3 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Wedstrijden</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="font-bold">{player.matchCount}</p>
                    <p className="text-xs text-slate-600">Deelgenomen</p>
                  </div>
                  <div>
                    <p className="font-bold">{player.matchAttendance}</p>
                    <p className="text-xs text-slate-600">Aanwezig</p>
                  </div>
                  <div>
                    <p className="font-bold text-blue-600">{player.matchAttendanceRate}%</p>
                    <p className="text-xs text-slate-600">Opkomst</p>
                  </div>
                </div>
              </div>

              {/* Goals & Assists */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <p className="text-lg font-bold text-emerald-600">{player.goals}</p>
                  <p className="text-xs text-slate-600">Goals</p>
                </div>
                <div className="rounded-lg bg-sky-50 p-2">
                  <p className="text-lg font-bold text-sky-600">{player.assists}</p>
                  <p className="text-xs text-slate-600">Assists</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
