import Link from "next/link";
import prisma from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

function formatDate(dateString: string) {
  const [year, month, day] = dateString
    .slice(0, 10)
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  return new Date(year, month - 1, day).toLocaleDateString(
    "nl-NL",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

export default async function WedstrijdenPage() {
  const wedstrijden = await prisma.activity.findMany({
    where: {
      type: "MATCH",
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
            <span
              aria-hidden="true"
              className="text-base leading-none"
            >
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
            Wedstrijden
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#647067]">
            Bekijk de geplande wedstrijden en open de registratie.
          </p>
        </section>

        {/* WEDSTRIJDEN */}
        <section className="mt-8">
          {wedstrijden.length === 0 ? (
            <div className="app-card p-6">
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#e9f7ee]
                    text-2xl
                  "
                >
                  🏆
                </div>

                <div>
                  <h2 className="font-bold text-[#17211b]">
                    Geen wedstrijden
                  </h2>

                  <p className="mt-1 text-sm text-[#647067]">
                    Er zijn nog geen wedstrijden gepland.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {wedstrijden.map((wedstrijd) => (
                <Link
                  key={wedstrijd.id}
                  href={`/wedstrijden/${wedstrijd.id}`}
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
                      className={`
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        text-2xl
                        transition
                        ${
                          wedstrijd.locked
                            ? "bg-red-50"
                            : "bg-[#e9f7ee] group-hover:bg-[#16803c]"
                        }
                      `}
                    >
                      {wedstrijd.locked ? "🔒" : "⚽"}
                    </div>

                    {/* INFORMATIE */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-[#17211b]">
                          {wedstrijd.opponent
                            ? `SCE JO8-1 vs ${wedstrijd.opponent}`
                            : "Wedstrijd"}
                        </p>

                        {/* STATUS */}
                        {wedstrijd.locked ? (
                          <span
                            className="
                              inline-flex
                              items-center
                              rounded-full
                              bg-red-50
                              px-2.5
                              py-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wide
                              text-red-600
                            "
                          >
                            Gesloten
                          </span>
                        ) : (
                          <span
                            className="
                              inline-flex
                              items-center
                              rounded-full
                              bg-[#e9f7ee]
                              px-2.5
                              py-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wide
                              text-[#16803c]
                            "
                          >
                            Open
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm font-medium capitalize text-[#647067]">
                        {formatDate(wedstrijd.date)}
                      </p>

                      <p className="mt-1 text-sm text-[#647067]">
                        {wedstrijd.startTime} – {wedstrijd.endTime}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">

                        {wedstrijd.home !== null && (
                          <span className="text-xs font-semibold text-[#16803c]">
                            {wedstrijd.home
                              ? "Thuiswedstrijd"
                              : "Uitwedstrijd"}
                          </span>
                        )}

                        {wedstrijd.team?.name && (
                          <span className="text-xs font-medium text-[#647067]">
                            {wedstrijd.team.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PIJL */}
                    <span
                      aria-hidden="true"
                      className="
                        shrink-0
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