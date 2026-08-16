import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const teams = await prisma.team.findMany();

  return (
    <main style={{ padding: 16 }}>
      <h1>Voetbalapp – Selecteer team</h1>
      {teams.length === 0 && <p>Geen teams gevonden.</p>}
      <ul>
        {teams.map((team) => (
          <li key={team.id}>
            <Link href={`/team/${team.id}`}>{team.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
