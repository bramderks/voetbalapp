import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';

export const dynamic = 'force-dynamic';

async function deleteMatch(formData: FormData) {
  'use server';

  const id = Number(formData.get('id'));
  await prisma.activity.delete({ where: { id } });
  revalidatePath('/wedstrijden');
}

export default async function WedstrijdenPage() {
  const matches = await prisma.activity.findMany({
    where: { type: 'MATCH' },
    orderBy: { date: 'asc' },
  });

  return (
    <main className="mx-auto max-w-md p-4 pb-10 bg-black min-h-screen text-white">
      <PageHeader
        eyebrow="Wedstrijden"
        title="Overzicht"
        icon="⚽"
        action={
          <Link
            href="/wedstrijden/nieuw"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white"
          >
            +
          </Link>
        }
      />

      <div className="space-y-3 mt-4">
        {matches.map((match) => {
          const isPast = new Date(match.date) < new Date();

          return (
            <Card key={match.id} className="bg-white text-black">
              <p className="text-lg font-bold">{match.opponent ?? 'Tegenstander TBD'}</p>
              <p className="mt-1 text-sm text-slate-600">{formatDate(match.date)}</p>
              <p className="mt-1 text-sm text-slate-600">{match.location ?? 'Locatie TBD'}</p>
              <p className="mt-1 text-sm text-slate-600">
                {match.startTime} - {match.endTime}
              </p>

              <div className="mt-3 flex gap-2">
                {!isPast && (
                  <>
                    <Link
                      href={`/wedstrijden/registreren?id=${match.id}`}
                      className="flex-1 rounded-xl bg-emerald-600 px-3 py-3 text-center text-sm font-semibold text-white"
                    >
                      Registreren
                    </Link>

                    <Link
                      href={`/wedstrijden/bewerken?id=${match.id}`}
                      className="flex-1 rounded-xl bg-slate-200 px-3 py-3 text-center text-sm font-semibold text-slate-800"
                    >
                      Bewerken
                    </Link>
                  </>
                )}

                {isPast && (
                  <div className="flex-1 rounded-xl bg-gray-300 px-3 py-3 text-center text-sm font-semibold text-gray-800">
                    Verlopen
                  </div>
                )}
              </div>

              <form action={deleteMatch} className="mt-2">
                <input type="hidden" name="id" value={match.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-rose-100 px-3 py-2 text-center text-sm font-semibold text-rose-700"
                >
                  Verwijderen
                </button>
              </form>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
