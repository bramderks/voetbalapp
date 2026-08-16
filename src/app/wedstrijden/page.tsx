// src/app/wedstrijden/page.tsx
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';

export default async function WedstrijdenPage() {
  const wedstrijden = await prisma.activity.findMany({
    where: { type: 'MATCH' },
    orderBy: { date: 'asc' },
  });

  return (
    <main className="p-6 space-y-6">
      <PageHeader
        eyebrow="Overzicht"
        title="Wedstrijden"
      />

      {wedstrijden.length === 0 && (
        <p className="text-gray-600">Geen wedstrijden gevonden.</p>
      )}

      <div className="grid gap-4">
        {wedstrijden.map((wedstrijd) => (
          <Card key={wedstrijd.id}>
            <h2 className="text-lg font-semibold mb-2">Wedstrijd</h2>
            <p>Datum: {new Date(wedstrijd.date).toLocaleDateString('nl-NL')}</p>
            <p>Tijd: {wedstrijd.startTime} - {wedstrijd.endTime}</p>
            <p>Locatie: {wedstrijd.location}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
