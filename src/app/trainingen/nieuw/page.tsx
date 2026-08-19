import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";

export default async function NieuweTrainingPage() {
  const team = await prisma.team.findFirst({
    orderBy: {
      id: "asc",
    },
  });

  if (!team) {
    return (
      <main className="app-page">
        <div className="app-container">
          <div className="mx-auto max-w-2xl">
            <TeamBadge />

            <div className="app-card mt-8 p-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-[var(--app-green)]">
                Trainingen
              </p>

              <h1 className="mt-2 text-2xl font-bold">
                Nieuwe training
              </h1>

              <p className="mt-3 text-sm text-[var(--app-text-muted)]">
                Er is nog geen team aangemaakt. Maak eerst een team aan.
              </p>

              <div className="mt-6">
                <Link
                  href="/"
                  className="app-button app-button-secondary"
                >
                  ← Terug naar Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Na deze controle weten we zeker dat team bestaat.
   * We gebruiken daarom alleen primitieve waarden in de
   * server action. Daarmee voorkomen we de TypeScript
   * "possibly null"-fout.
   */
  const teamId = team.id;
  const teamName = team.name;

  async function createTraining(formData: FormData) {
    "use server";

    const date = String(formData.get("date") ?? "").trim();
    const startTime = String(formData.get("startTime") ?? "").trim();
    const endTime = String(formData.get("endTime") ?? "").trim();

    if (!date || !startTime || !endTime) {
      return;
    }

    if (endTime <= startTime) {
      return;
    }

    await prisma.activity.create({
      data: {
        type: "TRAINING",
        date,
        startTime,
        endTime,
        teamId,
      },
    });

    redirect("/trainingen");
  }

  return (
    <main className="app-page">
      <div className="app-container">
        <div className="mx-auto max-w-2xl">

          {/* HEADER */}
          <header className="flex items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="Naar Home"
              className="transition hover:opacity-80"
            >
              <TeamBadge />
            </Link>

            <Link
              href="/"
              className="app-button app-button-primary"
            >
              <span aria-hidden="true" className="mr-2">
                ⌂
              </span>
              Home
            </Link>
          </header>

          {/* TITEL */}
          <section className="mt-10">
            <p className="text-sm font-bold uppercase tracking-widest text-[var(--app-green)]">
              {teamName}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Nieuwe training
            </h1>

            <p className="mt-2 text-sm text-[var(--app-text-muted)]">
              Plan een nieuwe training voor dit team.
            </p>
          </section>

          {/* FORMULIER */}
          <form
            action={createTraining}
            className="app-card mt-8 p-6"
          >
            <div className="grid gap-6">

              {/* DATUM */}
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-semibold text-[var(--app-text)]"
                >
                  Datum
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="app-input"
                />
              </div>

              {/* TIJDEN */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="startTime"
                    className="mb-2 block text-sm font-semibold text-[var(--app-text)]"
                  >
                    Begintijd
                  </label>

                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    required
                    className="app-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="mb-2 block text-sm font-semibold text-[var(--app-text)]"
                  >
                    Eindtijd
                  </label>

                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    required
                    className="app-input"
                  />
                </div>
              </div>

              {/* INFO */}
              <div className="rounded-xl bg-[var(--app-green-light)] p-4">
                <p className="text-sm font-semibold text-[var(--app-green-dark)]">
                  {teamName}
                </p>

                <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                  De training wordt gekoppeld aan dit team.
                  Na het aanmaken kun je de aanwezigheid registreren.
                </p>
              </div>

              {/* ACTIES */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Link
                  href="/trainingen"
                  className="app-button app-button-secondary"
                >
                  Annuleren
                </Link>

                <button
                  type="submit"
                  className="app-button app-button-primary"
                >
                  Training aanmaken
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
}