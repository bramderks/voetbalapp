import TeamBadge from "@/components/TeamBadge";

export default function WedstrijdenPage() {
  const wedstrijden = [
    {
      id: 1,
      opponent: "Tegenstander",
      dateNL: "Zaterdag 6 september 2026",
      startTime: "10:00",
      endTime: "11:00",
      location: "Sportpark SCE",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Wedstrijden</h1>

      <div className="space-y-4">
        {wedstrijden.map((m) => (
          <a
            key={m.id}
            href={`/wedstrijden/${m.id}`}
            className="block bg-neutral-900 p-4 rounded-xl border border-white hover:bg-neutral-800 transition"
          >
            <TeamBadge />
            <h2 className="text-xl font-bold mt-2">
              SCE JO8‑1 vs {m.opponent}
            </h2>
            <p>{m.dateNL}</p>
            <p>{m.startTime} – {m.endTime}</p>
            <p>{m.location}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
