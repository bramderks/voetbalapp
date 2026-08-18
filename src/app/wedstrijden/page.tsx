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

      {/* TITEL */}
      <h1 className="text-3xl font-bold tracking-wide mb-8">Wedstrijden</h1>

      {/* LIJST */}
      <div className="space-y-4">
        {wedstrijden.map((m) => (
          <a
            key={m.id}
            href={`/wedstrijden/${m.id}`}
            className="
              block 
              bg-neutral-900 
              p-5 
              rounded-xl 
              border border-white 
              hover:bg-neutral-800 
              hover:border-green-400
              transition 
              shadow-lg
            "
          >
            <div className="mb-4">
              <TeamBadge />
            </div>

            <h2 className="text-xl font-bold mb-1">
              SCE JO8‑1 vs {m.opponent}
            </h2>

            <p className="text-neutral-300">{m.dateNL}</p>
            <p className="text-neutral-300">{m.startTime} – {m.endTime}</p>
            <p className="text-neutral-300">{m.location}</p>
          </a>
        ))}
      </div>

    </main>
  );
}
