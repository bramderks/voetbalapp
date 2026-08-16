// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Voetbalapp Dashboard</h1>

      <div className="p-4 border rounded-lg bg-white shadow">
        <h2 className="text-xl font-semibold mb-2">Volgende activiteit</h2>
        <p className="text-gray-600">Geen activiteiten gevonden.</p>
      </div>
    </main>
  );
}
