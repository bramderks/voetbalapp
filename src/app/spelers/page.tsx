import TeamBadge from "@/components/TeamBadge";

export default function SpelersPage() {
  const players = [
    "Tobi",
    "Joa",
    "Muad",
    "Mahmoud",
    "Eymen",
    "Romy",
    "Jamie",
    "Moussa",
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Spelers</h1>

      <div className="space-y-4">
        {players.map((name) => (
          <div
            key={name}
            className="bg-neutral-900 p-4 rounded-xl border border-white flex items-center gap-4"
          >
            <TeamBadge />
            <span className="text-xl">{name}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
