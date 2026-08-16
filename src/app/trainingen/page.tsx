'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { formatDate, getStatusText } from '@/lib/utils';

export default function TrainingenPage() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/activities/list');
      const data = await res.json();

      const trainingsOnly = data.filter((a: any) => a.type === 'TRAINING');
      setTrainings(trainingsOnly);

      const attRes = await fetch('/api/attendance/all');
      const allAttendance = await attRes.json();

      const counts: Record<number, number> = {};

      for (const t of trainingsOnly) {
        const presentCount = allAttendance.filter(
          (x: any) => x.activityId === t.id && x.present === true
        ).length;

        counts[t.id] = presentCount;
      }

      setAttendance(counts);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <main className="mx-auto max-w-md p-4 text-center">Laden...</main>;
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-10 bg-black min-h-screen text-white">

      <PageHeader
        eyebrow="Trainingen"
        title="Overzicht"
        icon="🏋️"
        action={
          <Link
            href="/trainingen/nieuw"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white"
          >
            +
          </Link>
        }
      />

      <div className="space-y-3 mt-4">
        {trainings.length === 0 && (
          <p className="text-center text-gray-400">Geen trainingen gevonden.</p>
        )}

        {trainings.map((t) => {
          const isPast = new Date(t.date) < new Date();

          const content = (
            <div className="rounded-xl border-2 border-white bg-white text-black p-4 transition shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    Training
                  </p>

                  <p className="text-lg font-bold">
                    {new Date(t.date).toLocaleDateString('nl-NL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>

                  <p className="text-sm mt-1">
                    Aanwezig: {attendance[t.id] ?? 0} spelers
                  </p>
                </div>

                <span
                  className={
                    isPast
                      ? 'px-3 py-1 rounded-lg bg-gray-300 text-gray-800 text-sm font-semibold'
                      : t.status === 'registered'
                      ? 'px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-semibold'
                      : 'px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-sm font-semibold'
                  }
                >
                  {isPast ? 'Verlopen' : t.status === 'registered' ? 'Geregistreerd' : 'Open'}
                </span>
              </div>
            </div>
          );

          if (isPast) {
            return <div key={t.id}>{content}</div>;
          }

          return (
            <Link key={t.id} href={`/trainingen/registreren?id=${t.id}`} className="block">
              {content}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
