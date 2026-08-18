// src/app/wedstrijden/registreren/page.tsx
import prisma from "@/lib/prisma";


export default async function RegistrerenWedstrijdPage() {
  const wedstrijden = await prisma.activity.findMany({
    where: { type: 'MATCH' },
    orderBy: { date: 'asc' },
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Wedstrijd registratie</h1>

      {wedstrijden.length === 0 && (
        <p className="text-gray-600">Geen wedstrijden beschikbaar.</p>
      )}

      <ul className="space-y-4">
        {wedstrijden.map((wedstrijd) => (
          <li key={wedstrijd.id} className="p-4 border rounded-lg bg-white shadow">
            <h2 className="text-lg font-semibold mb-2">Wedstrijd</h2>
            <p>Datum: {new Date(wedstrijd.date).toLocaleDateString('nl-NL')}</p>
            <p>Tijd: {wedstrijd.startTime} - {wedstrijd.endTime}</p>
            <p>Locatie: {wedstrijd.location}</p>

            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded">
              Registreren
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
