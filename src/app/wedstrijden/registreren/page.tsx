'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MatchRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = Number(searchParams.get('id') ?? 0);

  const [players, setPlayers] = useState<{ id: number; name: string }[]>([]);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Controlled states
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [goals, setGoals] = useState<Record<number, number>>({});
  const [assists, setAssists] = useState<Record<number, number>>({});

  useEffect(() => {
    async function loadData() {
      const [teamRes, activityRes, attendanceRes, statsRes] = await Promise.all([
        fetch('/api/players'),
        fetch(`/api/activities?id=${activityId}`),
        fetch(`/api/attendance?activityId=${activityId}`),
        fetch(`/api/matchstats?activityId=${activityId}`),
      ]);

      const teamData = await teamRes.json();
      const activityData = await activityRes.json();
      const attendanceData = await attendanceRes.json();
      const statsData = await statsRes.json();

      setPlayers(teamData.players ?? []);
      setActivity(activityData ?? null);

      const initAttendance: Record<number, boolean> = {};
      const initGoals: Record<number, number> = {};
      const initAssists: Record<number, number> = {};

      for (const p of teamData.players ?? []) {
        const a = attendanceData.find((x: any) => x.playerId === p.id);
        const s = statsData.find((x: any) => x.playerId === p.id);

        initAttendance[p.id] = a ? a.present : false;
        initGoals[p.id] = s ? s.goals : 0;
        initAssists[p.id] = s ? s.assists : 0;
      }

      setAttendance(initAttendance);
      setGoals(initGoals);
      setAssists(initAssists);

      setLoading(false);
    }

    if (activityId) loadData();
  }, [activityId]);

  const submitMatch = async () => {
    setLoading(true);

    for (const player of players) {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          playerId: player.id,
          present: attendance[player.id] ?? false,
        }),
      });

      await fetch('/api/matchstats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          playerId: player.id,
          goals: goals[player.id] ?? 0,
          assists: assists[player.id] ?? 0,
        }),
      });
    }

    await fetch('/api/activities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activityId, status: 'registered' }),
    });

    router.refresh();
    router.push('/wedstrijden');
  };

  if (loading) {
    return <main className="mx-auto max-w-md p-4 text-center">Laden...</main>;
  }

  if (!activity) {
    return <main className="mx-auto max-w-md p-4 text-center">Geen wedstrijd gevonden.</main>;
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-5 flex items-center gap-2">
        <span className="text-2xl leading-none">⚽</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wedstrijd registreren</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {new Date(activity.date).toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h1>
        </div>
      </header>

      <div className="space-y-4">
        {players.map((player) => (
          <div key={player.id} className="card p-3 rounded-xl border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">{player.name}</span>

              <div className="flex gap-2">
                <label className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <input
                    type="radio"
                    name={`present-${player.id}`}
                    value="true"
                    checked={attendance[player.id] === true}
                    onChange={() => setAttendance({ ...attendance, [player.id]: true })}
                  />
                  🟢 Aanwezig
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                  <input
                    type="radio"
                    name={`present-${player.id}`}
                    value="false"
                    checked={attendance[player.id] === false}
                    onChange={() => setAttendance({ ...attendance, [player.id]: false })}
                  />
                  🔴 Afwezig
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Goals</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGoals({ ...goals, [player.id]: Math.max(0, goals[player.id] - 1) })}
                  className="px-3 py-1 bg-slate-200 rounded-lg"
                >
                  -
                </button>
                <span className="w-6 text-center">{goals[player.id]}</span>
                <button
                  onClick={() => setGoals({ ...goals, [player.id]: goals[player.id] + 1 })}
                  className="px-3 py-1 bg-slate-200 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Assists</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAssists({ ...assists, [player.id]: Math.max(0, assists[player.id] - 1) })}
                  className="px-3 py-1 bg-slate-200 rounded-lg"
                >
                  -
                </button>
                <span className="w-6 text-center">{assists[player.id]}</span>
                <button
                  onClick={() => setAssists({ ...assists, [player.id]: assists[player.id] + 1 })}
                  className="px-3 py-1 bg-slate-200 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={submitMatch}
          className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white"
        >
          Opslaan
        </button>
      </div>
    </main>
  );
}

export default function MatchRegistrationPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md p-4 text-center">Laden...</main>}>
      <MatchRegistrationContent />
    </Suspense>
  );
}
