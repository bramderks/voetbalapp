import Link from "next/link";
import prisma from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

function formatDate(dateString: string) {
  const [year, month, day] = dateString
    .slice(0, 10)
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function TrainingenPage() {
  const trainingen = await prisma.activity.findMany({
    where: {
      type: "TRAINING",
    },
    orderBy: [
      {
        date: "asc",
      },
      {
        startTime: "asc",
      },
    ],
    include: {
      team: true,
    },
  });

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* HEADER */}
        <header className="flex items-center justify-between">
          <TeamBadge />

          <Link
            href="/"
            className="
              rounded-lg
              border border-white/30
              px-4 py-2
              text-sm
              font-semibold
              transition
              hover:border-green-400
              hover:text-green-400
            "
          >
            Home
          </Link>
        </header>

        {/* TITEL */}
        <section className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
            Teamplanning
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-wide">
            Trainingen
          </h1>

          <p className="mt-2 text-neutral-400">
            Bekijk de geplande trainingen en beheer de aanwezigheid.
          </p>
        </section>

        {/* TRAININGEN */}
        <section className="mt-8">
          {trainingen.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-neutral-400">
                Er zijn nog geen trainingen gepland.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trainingen.map((training) => (
                <Link
                  key={training.id}
                  href={`/trainingen/${training.id}`}
                  className="
                    block
                    rounded-2xl
                    border border-neutral-800
                    bg-neutral-900
                    p-5
                    shadow-lg
                    transition
                    hover:border-green-400
                    hover:bg-neutral-800
                  "
                >
                  <div className="flex items-center justify-between gap-4">

                    {/* DATUM + TIJD */}
                    <div className="min-w-0">
                      <p className="text-lg font-bold capitalize">
                        {formatDate(training.date)}
                      </p>

                      <p className="mt-1 text-neutral-300">
                        {training.startTime} – {training.endTime}
                      </p>

                      {training.team?.name && (
                        <p className="mt-1 text-sm text-neutral-500">
                          {training.team.name}
                        </p>
                      )}
                    </div>

                    {/* STATUS */}
                    <div className="shrink-0">
                      {training.locked ? (
                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-red-500/10
                            px-3 py-1.5
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-red-400
                          "
                        >
                          Gesloten
                        </span>
                      ) : (
                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-green-500/10
                            px-3 py-1.5
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-green-400
                          "
                        >
                          Open
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ONDERSTE NAVIGATIE */}
        <div className="mt-8">
          <Link
            href="/"
            className="
              block
              rounded-xl
              border border-white/20
              bg-neutral-900
              px-4 py-3
              text-center
              font-semibold
              transition
              hover:border-green-400
              hover:text-green-400
            "
          >
            Terug naar Home
          </Link>
        </div>

      </div>
    </main>
  );
}