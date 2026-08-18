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

      {/* TITEL */}
      <h1 className="text-3xl font-bold tracking-wide mb-8">Spelers</h1>

      {/* LIJST */}
      <div className="space-y-4">
        {players.map((name) => (
          <div
            key={name}
            className="
              bg-neutral-900 
              p-5 
              rounded-xl 
              border border-white 
              flex items-center 
              gap-5
              hover:bg-neutral-800 
              hover:border-green-400
              transition 
              shadow-lg
            "
          >
            <TeamBadge />

            <span className="text-xl font-bold tracking-wide">
              {name}
            </span>
          </div>
        ))}
      </div>

    </main>
  );
}
