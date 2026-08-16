// src/app/wedstrijden/bewerken/page.tsx
import EditMatchForm from './EditMatchForm';

export default function EditMatchPage({ searchParams }: { searchParams?: { id?: string } }) {
  const activityId = Number(searchParams?.id ?? 0);

  return (
    <main className="mx-auto max-w-md p-4 pb-10">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wedstrijd bewerken</p>
        <h1 className="text-2xl font-bold text-slate-900">Details</h1>
      </header>

      <EditMatchForm activityId={activityId} />
    </main>
  );
}
