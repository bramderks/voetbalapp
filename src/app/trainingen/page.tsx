import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { formatDate, getStatusText } from '@/lib/utils';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

async function deleteTraining(formData: FormData) {
  'use server';

  const id = Number(formData.get('id'));
  await prisma.activity.delete({ where: { id } });
  revalidatePath('/trainingen');
}

export default async function TrainingenPage() {
  const trainings = await prisma.activity.findMany({
    where: { type: 'TRAINING' },
    orderBy: { date: 'asc' },
  });

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <PageHeader
        eyebrow="Trainingen"
        title="Overzicht"
        icon="🏋️"
        action={
          <Link href="/trainingen/nieuw" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
            +
          </Link>
        }
      />

      <div className="space-y-3">
        {trainings.map((training) => (
          <Card key={training.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-900">{formatDate(training.date)}</p>
                <p className="text-sm text-slate-600">{training.startTime} - {training.endTime}</p>
                <p className="mt-1 text-sm text-slate-600">{training.location ?? 'Lokatie TBD'}</p>
              </div>
              <StatusBadge status={training.status} label={getStatusText(training.status)} />
            </div>
            <Link href={`/trainingen/registreren?id=${training.id}`} className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
              Registreren
            </Link>
            <form action={deleteTraining} className="mt-2">
              <input type="hidden" name="id" value={training.id} />
              <button type="submit" className="w-full rounded-xl bg-rose-100 px-3 py-2 text-center text-sm font-semibold text-rose-700">
                Verwijderen
              </button>
            </form>
          </Card>
        ))}
      </div>
    </main>
  );
}
