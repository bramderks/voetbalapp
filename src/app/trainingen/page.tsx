export default function TrainingenPage() {
  const trainingen = [
    { id: 1, dateNL: "Dinsdag 18 augustus 2026", startTime: "15:00", endTime: "16:00" },
    { id: 2, dateNL: "Donderdag 20 augustus 2026", startTime: "15:00", endTime: "16:00" },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Trainingen</h1>

      <div className="space-y-4">
        {trainingen.map((t) => (
          <a
            key={t.id}
            href={`/trainingen/${t.id}`}
            className="block bg-neutral-900 p-4 rounded-xl border border-white hover:bg-neutral-800 transition"
          >
            <h2 className="text-xl font-bold">{t.dateNL}</h2>
            <p>{t.startTime} – {t.endTime}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
