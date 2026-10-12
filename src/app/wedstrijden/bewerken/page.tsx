import EditMatchForm from "./EditMatchForm";

type EditMatchPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function EditMatchPage({ searchParams }: EditMatchPageProps) {
  // In the current Next.js App Router, searchParams is asynchronous.
  // Reading it synchronously made the ID undefined and sent 0 to the form,
  // which triggered the "Ongeldig wedstrijd-ID" error when editing a match.
  const params = await searchParams;
  const activityId = Number(params.id ?? 0);

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
