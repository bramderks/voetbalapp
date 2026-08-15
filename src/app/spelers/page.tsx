import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SpelersPage() {
  const players = await prisma.player.findMany({
    where: { teamId: 1 },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Spelers</p>
        <h1 className="text-2xl font-bold text-slate-900">Selectie</h1>
      </header>

      <div className="space-y-3">
        {players.map((player) => (
          <div key={player.id} className="card flex items-center justify-between">
            <span className="text-lg font-medium text-slate-900">{player.name}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Speler
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
