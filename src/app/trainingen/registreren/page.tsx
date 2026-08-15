'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TrainingRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = Number(searchParams.get('id') ?? 0);
  const [players, setPlayers] = useState<{ id: number; name: string }[]>([]);
  const [activity, setActivity] = useState<{ id: number; date: string; startTime: string; endTime: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [teamRes, activityRes] = await Promise.all([
        fetch('/api/players'),
        fetch(`/api/activities?id=${activityId}`),
      ]);

      const teamData = await teamRes.json();
      const activityData = await activityRes.json();

      setPlayers(teamData.players ?? []);
      setActivity(activityData ?? null);
      setLoading(false);
    }

    if (activityId) {
      loadData();
    }
  }, [activityId]);

  const submitAttendance = async () => {
    setLoading(true);

    for (const player of players) {
      const present = (document.querySelector<HTMLInputElement>(`input[name="present-${player.id}"]:checked`)?.value ?? 'false') === 'true';

      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          playerId: player.id,
          present,
        }),
      });
    }

    await fetch('/api/activities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activityId, status: 'registered' }),
    });

    router.push('/trainingen');
  };

  if (loading) {
    return <main className="mx-auto max-w-md p-4 text-center">Laden...</main>;
  }

  if (!activity) {
    return <main className="mx-auto max-w-md p-4 text-center">Geen training gevonden.</main>;
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Training registreren</p>
        <h1 className="text-2xl font-bold text-slate-900">{new Date(activity.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h1>
      </header>

      <div className="space-y-4">
        {players.map((player) => (
          <div key={player.id} className="card flex items-center justify-between gap-3">
            <span className="font-medium text-slate-800">{player.name}</span>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                <input type="radio" name={`present-${player.id}`} value="true" defaultChecked />
                Aanwezig
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                <input type="radio" name={`present-${player.id}`} value="false" />
                Afwezig
              </label>
            </div>
          </div>
        ))}

        <button onClick={submitAttendance} className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white">
          Opslaan
        </button>
      </div>
    </main>
  );
}
