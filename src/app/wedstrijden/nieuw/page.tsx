import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

async function createMatch(formData: FormData) {
  'use server';

  const date = String(formData.get('date') ?? '');
  const startTime = String(formData.get('startTime') ?? '');
  const endTime = String(formData.get('endTime') ?? '');
  const opponent = String(formData.get('opponent') ?? '');
  const location = String(formData.get('location') ?? '');

  await prisma.activity.create({
    data: {
      date,
      type: 'MATCH',
      startTime,
      endTime,
      opponent: opponent || null,
      location: location || null,
      status: 'registered',
    },
  });

  redirect('/wedstrijden');
}

export default function NewMatchPage() {
  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-5 flex items-center gap-2">
        <span className="text-2xl leading-none">⚽</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wedstrijd</p>
          <h1 className="text-2xl font-bold text-slate-900">Nieuwe wedstrijd</h1>
        </div>
      </header>

      <form action={createMatch} className="card space-y-4">
        <input name="date" type="date" required className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input name="startTime" type="time" required className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          <input name="endTime" type="time" required className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </div>
        <input name="opponent" placeholder="Tegenstander" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        <input name="location" placeholder="Locatie" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white">
          Aanmaken
        </button>
      </form>
    </main>
  );
}
