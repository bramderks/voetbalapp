import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';


export const dynamic = 'force-dynamic';

export default async function SpelersPage() {
  const players = await prisma.player.findMany({
    where: { teamId: 1 },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="mx-auto max-w-md p-4 pb-10 bg-black min-h-screen text-white">
      <PageHeader eyebrow="Spelers" title="Selectie" icon="👥" />

      <div className="space-y-3 mt-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="rounded-xl bg-white text-black p-4 flex items-center justify-between shadow"
          >
            <span className="text-lg font-medium">{player.name}</span>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              Speler
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
