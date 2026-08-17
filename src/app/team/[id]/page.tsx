import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { teamId: string };
}

export default async function TeamOverviewPage({ params }: Props) {
  const teamId = Number(params.teamId);
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team) {
    return <main>Team niet gevonden.</main>;
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>{team.name}</h1>
      <nav style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link href={`/team/${teamId}/trainingen`}>Trainingen</Link>
        <Link href={`/team/${teamId}/wedstrijden`}>Wedstrijden</Link>
        <Link href={`/team/${teamId}/statistieken`}>Statistieken</Link>
        <Link href={`/team/${teamId}/spelers`}>Spelers</Link>
      </nav>
    </main>
  );
}
