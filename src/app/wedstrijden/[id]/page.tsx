import Link from "next/link";
import prisma from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";
import MatchLockControl from "@/components/MatchLockControl";

export const dynamic = "force-dynamic";

type PageProps = {
  params: {
    id: string;
  };
};

function formatDate(dateString: string) {
  const [year, month, day] = dateString
    .slice(0, 10)
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  return new Date(year, month - 1, day).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function WedstrijdDetailPage({
  params,
}: PageProps) {
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return (
      <main className="app-page">
        <div className="app-container max-w-3xl">
          <div className="app-card p-6">
            <h1 className="text-2xl font-bold text-[#17211b]">
              Wedstrijd
            </h1>

            <p className="mt-2 text-sm text-[#dc2626]">
              Geen geldige wedstrijd geselecteerd.
            </p>
          </div>
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
        <div className="app-container max-w-3xl">
          <div className="app-card p-6">
            <h1 className="text-2xl font-bold text-[#17211b]">
              Wedstrijd
            </h1>

            <p className="mt-2 text-sm text-[#dc2626]">
              Wedstrijd niet gevonden.
            </p>

            <div className="mt-6">
              <Link
                href="/wedstrijden"
                className="app-button app-button-secondary"
              >
                ← Terug naar wedstrijden
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="app-container max-w-4xl">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="transition hover:opacity-80"
            aria-label="Naar Home"
          >
            <TeamBadge />
          </Link>

          <Link
            href="/"
            className="app-button app-button-primary"
          >
            <span aria-hidden="true" className="mr-2 text-base">
              ⌂
            </span>
            Home
          </Link>
        </header>

        {/* PAGINA-TITEL */}
        <section className="mt-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#16803c]">
            Wedstrijd
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17211b]">
            {wedstrijd.opponent
              ? `SCE JO8-1 vs ${wedstrijd.opponent}`
              : "Wedstrijd"}
          </h1>

          <p className="mt-2 text-sm text-[#647067]">
            {wedstrijd.team.name}
          </p>
        </section>

        {/* WEDSTRIJD INFO */}
        <section className="app-card mt-8 p-6">
          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#647067]">
                Datum
              </p>

              <p className="mt-1 font-semibold capitalize text-[#17211b]">
                {formatDate(wedstrijd.date)}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#647067]">
                Tijd
              </p>

              <p className="mt-1 font-semibold text-[#17211b]">
                {wedstrijd.startTime} – {wedstrijd.endTime}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#647067]">
                Tegenstander
              </p>

              <p className="mt-1 font-semibold text-[#17211b]">
                {wedstrijd.opponent ?? "Nog niet ingevuld"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#647067]">
                Wedstrijd
              </p>

              <p className="mt-1 font-semibold text-[#17211b]">
                {wedstrijd.home === true
                  ? "Thuiswedstrijd"
                  : wedstrijd.home === false
                    ? "Uitwedstrijd"
                    : "Nog niet bepaald"}
              </p>
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-6 border-t border-[#e1e7e2] pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#17211b]">
                  Status
                </p>

                <p className="mt-1 text-sm text-[#647067]">
                  {wedstrijd.locked
                    ? "Deze wedstrijd is gesloten."
                    : "Deze wedstrijd staat nog open voor registratie."}
                </p>
              </div>

              <span
                className={
                  wedstrijd.locked
                    ? "inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-600"
                    : "inline-flex rounded-full bg-[#e9f7ee] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#16803c]"
                }
              >
                {wedstrijd.locked ? "Gesloten" : "Open"}
              </span>
            </div>
          </div>
        </section>

        {/* AANWEZIGHEID */}
        <section className="app-card mt-6 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#17211b]">
                Aanwezigheid
              </h2>

              <p className="mt-1 text-sm text-[#647067]">
                {wedstrijd.attendance.length} spelers geregistreerd.
              </p>
            </div>

            <div className="text-2xl">
              👥
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-[#e1e7e2]">
            {wedstrijd.attendance.length === 0 ? (
              <div className="px-4 py-6 text-sm text-[#647067]">
                Er zijn nog geen aanwezigheidsregistraties.
              </div>
            ) : (
              wedstrijd.attendance.map((attendance) => (
                <div
                  key={attendance.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    border-t
                    border-[#e1e7e2]
                    px-4
                    py-3
                    first:border-t-0
                  "
                >
                  <span className="text-sm font-medium text-[#17211b]">
                    {attendance.player.name}
                  </span>

                  <span
                    className={
                      attendance.present
                        ? "rounded-full bg-[#e9f7ee] px-3 py-1 text-xs font-bold text-[#16803c]"
                        : "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600"
                    }
                  >
                    {attendance.present ? "Aanwezig" : "Afwezig"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* WEDSTRIJDSTATISTIEKEN */}
        <section className="app-card mt-6 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#17211b]">
                Wedstrijdstatistieken
              </h2>

              <p className="mt-1 text-sm text-[#647067]">
                Goals en assists per speler.
              </p>
            </div>

            <div className="text-2xl">
              ⚽
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-[#e1e7e2]">
            {wedstrijd.matchStats.length === 0 ? (
              <div className="px-4 py-6 text-sm text-[#647067]">
                Er zijn nog geen wedstrijdstatistieken geregistreerd.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_auto_auto] gap-6 bg-[#f5f7f5] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#647067]">
                  <span>Speler</span>
                  <span>Goals</span>
                  <span>Assists</span>
                </div>

                {wedstrijd.matchStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="
                      grid
                      grid-cols-[1fr_auto_auto]
                      items-center
                      gap-6
                      border-t
                      border-[#e1e7e2]
                      px-4
                      py-3
                    "
                  >
                    <span className="text-sm font-medium text-[#17211b]">
                      {stat.player.name}
                    </span>

                    <span className="text-sm font-bold text-[#17211b]">
                      {stat.goals}
                    </span>

                    <span className="text-sm font-bold text-[#17211b]">
                      {stat.assists}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
{/* WEDSTRIJD AFRONDEN / HEROPENEN */}
<MatchLockControl
  activityId={wedstrijd.id}
  locked={wedstrijd.locked}
/>

        {/* ACTIES */}
        {!wedstrijd.locked && (
          <section className="app-card mt-6 p-6">
            <h2 className="text-lg font-bold text-[#17211b]">
              Wedstrijd beheren
            </h2>

            <p className="mt-1 text-sm text-[#647067]">
              Registreer aanwezigheid en wedstrijdstatistieken zolang
              de wedstrijd open staat.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/wedstrijden/registreren?id=${wedstrijd.id}`}
                className="app-button app-button-primary w-full"
              >
                Aanwezigheid registreren
              </Link>

              <Link
                href={`/wedstrijden/bewerken?id=${wedstrijd.id}`}
                className="app-button app-button-secondary w-full"
              >
                Wedstrijd bewerken
              </Link>
            </div>
          </section>
        )}

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
            ← Terug naar wedstrijden
          </Link>
        </div>

      </div>
    </main>
  );
}