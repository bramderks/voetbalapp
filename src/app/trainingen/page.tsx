// src/app/trainingen/page.tsx
import { prisma } from '@/lib/prisma';

export default async function TrainingenPage() {
  const trainingen = await prisma.activity.findMany({
    where: { type: 'TRAINING' },
    orderBy: { date: 'asc' },
  });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trainingen</h1>

      {trainingen.length === 0 && (
        <p className="text-gray-600">Geen trainingen gevonden.</p>
      )}

      <ul className="space-y-4">
        {trainingen.map((training) => (
          <li key={training.id} className="p-4 border rounded-lg bg-white shadow">
            <h2 className="text-lg font-semibold">Training</h2>
            <p>Datum: {new Date(training.date).toLocaleDateString('nl-NL')}</p>
            <p>Tijd: {training.startTime} - {training.endTime}</p>
            <p>Locatie: {training.location}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
