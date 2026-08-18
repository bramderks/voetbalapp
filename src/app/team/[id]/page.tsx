import TeamBadge from "@/components/TeamBadge";
import NavButton from "@/components/NavButton";

interface PageProps {
  params: {
    id: string;
  };
}

export default function TeamDetailPage({ params }: PageProps) {
  const { id } = params;

  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center">

      {/* TEAM BADGE */}
      <div className="mb-6">
        <TeamBadge />
      </div>

      {/* TEAM INFO */}
      <h1 className="text-3xl font-bold tracking-wide">Team #{id}</h1>
      <p className="text-lg text-neutral-300 mt-1">SCE Jongens</p>
      <p className="text-sm text-neutral-500">Seizoen 26‑27</p>

      {/* GRID NAVIGATIE */}
      <div className="grid grid-cols-2 gap-4 mt-10 w-full max-w-md">
        <NavButton label="Spelers" href={`/team/${id}/spelers`} />
        <NavButton label="Trainingen" href={`/team/${id}/trainingen`} />
        <NavButton label="Wedstrijden" href={`/team/${id}/wedstrijden`} />
        <NavButton label="Statistieken" href={`/team/${id}/statistieken`} />
      </div>

    </main>
  );
}
