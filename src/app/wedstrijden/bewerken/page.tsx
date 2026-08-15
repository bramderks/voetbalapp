import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

async function saveMatchDetails(formData: FormData) {
  'use server';

  const activityId = Number(formData.get('activityId'));
  const opponent = String(formData.get('opponent') ?? '');
  const location = String(formData.get('location') ?? '');
  const startTime = String(formData.get('startTime') ?? '');
  const endTime = String(formData.get('endTime') ?? '');

  await prisma.activity.update({
    where: { id: activityId },
    data: {
      opponent,
      location,
      startTime,
      endTime,
    },
  });

  redirect('/wedstrijden');
}

export default async function EditMatchPage({ searchParams }: { searchParams?: { id?: string } }) {
  const activityId = Number(searchParams?.id ?? 0);
  const match = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!match) {
    return <main className="mx-auto max-w-md p-4 text-center">Wedstrijd niet gevonden.</main>;
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wedstrijd bewerken</p>
        <h1 className="text-2xl font-bold text-slate-900">Details</h1>
      </header>

      <form action={saveMatchDetails} className="card space-y-4">
        <input type="hidden" name="activityId" value={match.id} />
        <input name="opponent" defaultValue={match.opponent ?? ''} placeholder="Tegenstander" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        <input name="location" defaultValue={match.location ?? ''} placeholder="Locatie" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input name="startTime" type="time" defaultValue={match.startTime} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          <input name="endTime" type="time" defaultValue={match.endTime} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </div>
        <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white">
          Opslaan
        </button>
      </form>
    </main>
  );
}
