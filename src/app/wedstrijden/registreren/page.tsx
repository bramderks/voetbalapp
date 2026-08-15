'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MatchRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = Number(searchParams.get('id') ?? 0);
  const [players, setPlayers] = useState<{ id: number; name: string }[]>([]);
  const [activity, setActivity] = useState<{ id: number; date: string; startTime: string; endTime: string; opponent: string | null; location: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const incrementValue = (field: string, delta: number) => {
    const input = document.querySelector<HTMLInputElement>(`input[name="${field}"]`);
    if (!input) return;
    const next = Math.max(0, Number(input.value || 0) + delta);
    input.value = String(next);
  };

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

  const submitMatch = async () => {
    setLoading(true);

    const form = {
      id: activityId,
      opponent: (document.querySelector<HTMLInputElement>('input[name="opponent"]')?.value ?? '').trim(),
      location: (document.querySelector<HTMLInputElement>('input[name="location"]')?.value ?? '').trim(),
      startTime: (document.querySelector<HTMLInputElement>('input[name="startTime"]')?.value ?? ''),
      endTime: (document.querySelector<HTMLInputElement>('input[name="endTime"]')?.value ?? ''),
      result: (document.querySelector<HTMLInputElement>('input[name="result"]')?.value ?? '').trim(),
    };

    await fetch('/api/activities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    for (const player of players) {
      const present = (document.querySelector<HTMLInputElement>(`input[name="present-${player.id}"]:checked`)?.value ?? 'false') === 'true';
      const goals = Number(document.querySelector<HTMLInputElement>(`input[name="goals-${player.id}"]`)?.value ?? 0);
      const assists = Number(document.querySelector<HTMLInputElement>(`input[name="assists-${player.id}"]`)?.value ?? 0);

      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, playerId: player.id, present }),
      });

      await fetch('/api/match-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, playerId: player.id, goals, assists }),
      });
    }

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
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wedstrijd registreren</p>
        <h1 className="text-2xl font-bold text-slate-900">{new Date(activity.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h1>
      </header>

      <div className="space-y-5">
        <div className="card space-y-3">
          <input name="opponent" defaultValue={activity.opponent ?? ''} placeholder="Tegenstander" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          <input name="location" defaultValue={activity.location ?? ''} placeholder="Locatie" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input name="startTime" defaultValue={activity.startTime} type="time" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
            <input name="endTime" defaultValue={activity.endTime} type="time" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          </div>
          <input name="result" placeholder="Uitslag (bv. 2-1)" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </div>

        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="card space-y-3">
              <div className="flex items-center justify-between gap-3">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Goals</p>
                  <div className="flex items-center justify-between gap-2">
                    <button type="button" onClick={() => incrementValue(`goals-${player.id}`, -1)} className="h-10 w-10 rounded-lg bg-slate-200 text-xl font-bold text-slate-700">−</button>
                    <input name={`goals-${player.id}`} defaultValue={0} className="w-14 rounded-lg border border-slate-300 px-2 py-2 text-center text-base font-semibold" readOnly />
                    <button type="button" onClick={() => incrementValue(`goals-${player.id}`, 1)} className="h-10 w-10 rounded-lg bg-emerald-500 text-xl font-bold text-white">+</button>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Assists</p>
                  <div className="flex items-center justify-between gap-2">
                    <button type="button" onClick={() => incrementValue(`assists-${player.id}`, -1)} className="h-10 w-10 rounded-lg bg-slate-200 text-xl font-bold text-slate-700">−</button>
                    <input name={`assists-${player.id}`} defaultValue={0} className="w-14 rounded-lg border border-slate-300 px-2 py-2 text-center text-base font-semibold" readOnly />
                    <button type="button" onClick={() => incrementValue(`assists-${player.id}`, 1)} className="h-10 w-10 rounded-lg bg-sky-500 text-xl font-bold text-white">+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={submitMatch} className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white">
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
