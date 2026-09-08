import Link from "next/link";
import prisma from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

export default async function SpelersPage() {
  const team = await prisma.team.findFirst({
    orderBy: { id: "asc" },
  });

  const players = await prisma.player.findMany({
    where: team ? { teamId: team.id } : undefined,
    orderBy: { name: "asc" },
  });

  return (
    <main className="app-page">
      <div className="app-container">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="transition hover:opacity-80" aria-label="Naar Home">
            <TeamBadge />
          </Link>
          <Link href="/" className="app-button app-button-primary">
            <span aria-hidden="true" className="mr-2 text-base">⌂</span>
            Home
          </Link>
        </header>

        <section className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--app-green)]">
            Teamoverzicht
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--app-text)]">
            Spelers
          </h1>
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            {team ? `Bekijk de spelers van ${team.name}.` : "Er is nog geen team ingesteld."}
          </p>
        </section>

        <section className="mt-8">
          {players.length === 0 ? (
            <div className="app-card p-6">
              <p className="text-sm text-[var(--app-text-muted)]">
                Er zijn nog geen spelers beschikbaar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="app-card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-green-light)] text-lg font-bold text-[var(--app-green)]">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-[var(--app-text)]">
                      {player.name}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--app-text-muted)]">
                      Speler
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8">
          <Link href="/" className="app-button app-button-secondary w-full">
            <span aria-hidden="true" className="mr-2">⌂</span>
            Terug naar Home
          </Link>
        </div>
      </div>
    </main>
  );
}
