'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/Card';

export default function TrainingRegistrerenPage() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const activityId = Number(searchParams.get('id'));

  const [players, setPlayers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any>(null);
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  const isPast = activity ? new Date(activity.date) < new Date() : false;

  useEffect(() => {
    async function load() {
      const [playersRes, activityRes, attendanceRes] = await Promise.all([
        fetch('/api/players'),
        fetch(`/api/activities?id=${activityId}`),
        fetch(`/api/attendance?activityId=${activityId}`)
      ]);

      const playersData = await playersRes.json();
      const activityData = await activityRes.json();
      const attendanceData = await attendanceRes.json();

      setPlayers(playersData.players ?? []);
      setActivity(activityData);

      const initAttendance: Record<number, boolean> = {};
      for (const p of playersData.players ?? []) {
        const a = attendanceData.find((x: any) => x.playerId === p.id);
        initAttendance[p.id] = a ? a.present : false;
      }

      setAttendance(initAttendance);
      setLoading(false);
    }

    if (activityId) load();
  }, [activityId]);

  const submitTraining = async () => {
    if (isPast) return; // training is verlopen → niet opslaan

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
    }

    await fetch('/api/activities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activityId, status: 'registered' }),
    });

    window.location.href = '/trainingen';
  };

  if (loading) {
    return <main className="mx-auto max-w-md p-4 text-center">Laden...</main>;
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-10 bg-black min-h-screen text-white">

      <PageHeader
        eyebrow="Training"
        title="Registreren"
        icon="🏋️"
        action={
          <Link
            href="/trainingen"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black text-xl font-bold"
          >
            ⬅
          </Link>
        }
      />

      <Card className="mt-4 bg-white text-black">
        <p className="text-lg font-bold">
          {new Date(activity.date).toLocaleDateString('nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {activity.startTime} – {activity.endTime}
        </p>

        {isPast && (
          <p className="mt-3 rounded-xl bg-gray-200 px-3 py-2 text-center text-sm font-semibold text-gray-700">
            Deze training is verlopen — aanwezigheid kan niet meer worden aangepast.
          </p>
        )}
      </Card>

      <div className="space-y-3 mt-4">
        {players.map((player) => (
          <Card key={player.id} className="bg-white text-black">
            <p className="text-lg font-bold">{player.name}</p>

            <div className="mt-3 flex gap-2">
              <button
                disabled={isPast}
                onClick={() =>
                  setAttendance({ ...attendance, [player.id]: true })
                }
                className={`flex-1 rounded-xl px-3 py-3 text-center text-sm font-semibold ${
                  attendance[player.id]
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-700'
                } ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Aanwezig
              </button>

              <button
                disabled={isPast}
                onClick={() =>
                  setAttendance({ ...attendance, [player.id]: false })
                }
                className={`flex-1 rounded-xl px-3 py-3 text-center text-sm font-semibold ${
                  !attendance[player.id]
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-100 text-rose-700'
                } ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Afwezig
              </button>
            </div>
          </Card>
        ))}
      </div>

      {!isPast && (
        <button
          onClick={submitTraining}
          className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white"
        >
          Opslaan
        </button>
      )}
    </main>
  );
}
