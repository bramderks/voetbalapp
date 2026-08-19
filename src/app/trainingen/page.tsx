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
    <main className="app-page">
      <div className="app-container max-w-4xl">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-4">
          <TeamBadge />

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#16803c]
              px-4
              py-2.5
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-[#116631]
              active:translate-y-px
            "
          >
            <span aria-hidden="true" className="text-base leading-none">
              ⌂
            </span>

            <span>Home</span>
          </Link>
        </header>

        {/* PAGINA-TITEL */}
        <section className="mt-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#16803c]">
            Teamplanning
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17211b]">
            Trainingen
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#647067]">
            Bekijk de geplande trainingen en beheer de aanwezigheid.
          </p>
        </section>

        {/* TRAININGEN */}
        <section className="mt-8">
          {trainingen.length === 0 ? (
            <div className="app-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e9f7ee] text-2xl">
                  ⚽
                </div>

                <div>
                  <h2 className="font-bold text-[#17211b]">
                    Geen trainingen
                  </h2>

                  <p className="mt-1 text-sm text-[#647067]">
                    Er zijn nog geen trainingen gepland.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {trainingen.map((training) => (
                <Link
                  key={training.id}
                  href={`/trainingen/${training.id}`}
                  className="
                    group
                    block
                    rounded-2xl
                    border
                    border-[#e1e7e2]
                    bg-white
                    p-5
                    shadow-[0_4px_14px_rgba(23,33,27,0.06)]
                    transition
                    hover:-translate-y-0.5
                    hover:border-[#16803c]
                    hover:shadow-md
                  "
                >
                  <div className="flex items-center gap-4">

                    {/* ICOON */}
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#e9f7ee]
                        text-2xl
                        transition
                        group-hover:bg-[#16803c]
                        group-hover:grayscale
                      "
                    >
                      ⚽
                    </div>

                    {/* INFORMATIE */}
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold capitalize text-[#17211b]">
                        {formatDate(training.date)}
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#647067]">
                        {training.startTime} – {training.endTime}
                      </p>

                      {training.team?.name && (
                        <p className="mt-1 text-xs font-medium text-[#647067]">
                          {training.team.name}
                        </p>
                      )}
                    </div>

                    {/* STATUS + PIJL */}
                    <div className="flex shrink-0 items-center gap-3">
                      {training.locked ? (
                        <span
                          className="
                            hidden
                            rounded-full
                            bg-[#fef2f2]
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-[#dc2626]
                            sm:inline-flex
                          "
                        >
                          Gesloten
                        </span>
                      ) : (
                        <span
                          className="
                            hidden
                            rounded-full
                            bg-[#e9f7ee]
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-[#16803c]
                            sm:inline-flex
                          "
                        >
                          Open
                        </span>
                      )}

                      <span
                        aria-hidden="true"
                        className="
                          text-xl
                          font-bold
                          text-[#aab6ad]
                          transition
                          group-hover:translate-x-1
                          group-hover:text-[#16803c]
                        "
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* TERUG */}
        <div className="mt-8">
          <Link
            href="/"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-[#e1e7e2]
              bg-white
              px-4
              py-3
              text-sm
              font-bold
              text-[#17211b]
              shadow-sm
              transition
              hover:border-[#16803c]
              hover:text-[#16803c]
            "
          >
            ← Terug naar Home
          </Link>
        </div>
      </div>
    </main>
  );
}