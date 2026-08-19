import Link from "next/link";
import prisma from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";
import MatchRegistration from "@/components/MatchRegistration";

type PageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

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

export default async function WedstrijdRegistrerenPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return (
      <main className="app-page">
        <div className="app-container max-w-4xl">
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
              "
            >
              <span aria-hidden="true">⌂</span>
              <span>Home</span>
            </Link>
          </header>

          <section className="app-card mt-10 p-6">
            <h1 className="text-xl font-bold text-[#17211b]">
              Wedstrijd registreren
            </h1>

            <p className="mt-2 text-sm text-red-600">
              Geen geldige wedstrijd geselecteerd.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const wedstrijd = await prisma.activity.findUnique({
    where: {
      id,
    },
    include: {
      team: true,
      attendance: {
        include: {
          player: true,
        },
        orderBy: {
          player: {
            name: "asc",
          },
        },
      },
      matchStats: {
        include: {
          player: true,
        },
        orderBy: {
          player: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!wedstrijd || wedstrijd.type !== "MATCH") {
    return (
      <main className="app-page">
        <div className="app-container max-w-4xl">
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
              "
            >
              <span aria-hidden="true">⌂</span>
              <span>Home</span>
            </Link>
          </header>

          <section className="app-card mt-10 p-6">
            <h1 className="text-xl font-bold text-[#17211b]">
              Wedstrijd registreren
            </h1>

            <p className="mt-2 text-sm text-red-600">
              Wedstrijd niet gevonden.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="app-container max-w-5xl">

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
            <span aria-hidden="true">⌂</span>
            <span>Home</span>
          </Link>
        </header>

        {/* TITEL */}
        <section className="mt-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#16803c]">
            Wedstrijdregistratie
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17211b]">
            {wedstrijd.opponent
              ? `SCE JO8-1 vs ${wedstrijd.opponent}`
              : "Wedstrijd"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#647067]">
            {formatDate(wedstrijd.date)} · {wedstrijd.startTime} –{" "}
            {wedstrijd.endTime}
          </p>
        </section>

        {/* WEDSTRIJDINFO */}
        <section className="app-card mt-8 p-6">
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">
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
                "
              >
                ⚽
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#17211b]">
                  {wedstrijd.home === true
                    ? "Thuiswedstrijd"
                    : wedstrijd.home === false
                      ? "Uitwedstrijd"
                      : "Locatie onbekend"}
                </h2>

                <p className="mt-1 text-sm text-[#647067]">
                  {wedstrijd.team.name}
                </p>
              </div>
            </div>

            {wedstrijd.locked ? (
              <span
                className="
                  inline-flex
                  rounded-full
                  bg-red-50
                  px-3
                  py-1.5
                  text-xs
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
                  rounded-full
                  bg-[#e9f7ee]
                  px-3
                  py-1.5
                  text-xs
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
        </section>

        {/* REGISTRATIE */}
        <section className="app-card mt-6 overflow-hidden">
          <div className="border-b border-[#e1e7e2] p-6">
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
                  text-xl
                "
              >
                👥
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#17211b]">
                  Wedstrijdregistratie
                </h2>

                <p className="mt-1 text-sm text-[#647067]">
                  Aanwezigheid, goals en assists per speler.
                </p>
              </div>
            </div>
          </div>

          <MatchRegistration
            activityId={wedstrijd.id}
            locked={wedstrijd.locked}
            attendance={wedstrijd.attendance.map((item) => ({
              id: item.id,
              playerId: item.playerId,
              playerName: item.player.name,
              present: item.present,
            }))}
            matchStats={wedstrijd.matchStats.map((item) => ({
              id: item.id,
              playerId: item.playerId,
              goals: item.goals,
              assists: item.assists,
            }))}
          />
        </section>

        {/* TERUG */}
        <div className="mt-8">
          <Link
            href="/wedstrijden"
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
            ← Terug naar Wedstrijden
          </Link>
        </div>
      </div>
    </main>
  );
}