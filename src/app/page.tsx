import Link from "next/link";
import prisma from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";
import NavButton from "@/components/NavButton";

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

export default async function HomePage() {
  const team = await prisma.team.findFirst({
    orderBy: {
      id: "asc",
    },
  });

  const vandaag = new Date();

  const vandaagString = [
    vandaag.getFullYear(),
    String(vandaag.getMonth() + 1).padStart(2, "0"),
    String(vandaag.getDate()).padStart(2, "0"),
  ].join("-");

  const volgendeTraining = await prisma.activity.findFirst({
    where: {
      type: "TRAINING",
      date: {
        gte: vandaagString,
      },
    },
    orderBy: [
      {
        date: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  const volgendeWedstrijd = await prisma.activity.findFirst({
    where: {
      type: "MATCH",
      date: {
        gte: vandaagString,
      },
    },
    orderBy: [
      {
        date: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  return (
    <main className="min-h-screen bg-black text-white p-6">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="flex items-center justify-between mb-10">
        <TeamBadge />

        <h1 className="text-3xl font-bold tracking-wide">
          VOETBAL APP
        </h1>
      </header>

      {/* ======================================================
          VOLGENDE TRAINING
          ====================================================== */}

      <section className="space-y-4">

        <Link
          href={
            volgendeTraining
              ? `/trainingen/${volgendeTraining.id}`
              : "/trainingen"
          }
          className="
            block
            bg-neutral-900
            p-5
            rounded-xl
            border border-white
            shadow-lg
            hover:bg-neutral-800
            hover:border-green-400
            transition
          "
        >
          <h2 className="text-xl font-bold mb-1">
            Volgende training
          </h2>

          {volgendeTraining ? (
            <p className="text-neutral-300">
              {formatDate(volgendeTraining.date)} —{" "}
              {volgendeTraining.startTime}–{volgendeTraining.endTime}
            </p>
          ) : (
            <p className="text-neutral-500">
              Geen training gepland.
            </p>
          )}
        </Link>

        {/* ====================================================
            VOLGENDE WEDSTRIJD
            ==================================================== */}

        <Link
          href={
            volgendeWedstrijd
              ? `/wedstrijden/${volgendeWedstrijd.id}`
              : "/wedstrijden"
          }
          className="
            block
            bg-neutral-900
            p-5
            rounded-xl
            border border-white
            shadow-lg
            hover:bg-neutral-800
            hover:border-green-400
            transition
          "
        >
          <h2 className="text-xl font-bold mb-1">
            Volgende wedstrijd
          </h2>

          {volgendeWedstrijd ? (
            <div className="text-neutral-300">

              <p>
                {formatDate(volgendeWedstrijd.date)} —{" "}
                {volgendeWedstrijd.startTime}–
                {volgendeWedstrijd.endTime}
              </p>

              {volgendeWedstrijd.opponent && (
                <p className="mt-1">
                  Tegenstander:{" "}
                  <span className="text-white font-semibold">
                    {volgendeWedstrijd.opponent}
                  </span>
                </p>
              )}

              {volgendeWedstrijd.home !== null && (
                <p className="mt-1">
                  {volgendeWedstrijd.home
                    ? "Thuis"
                    : "Uit"}
                </p>
              )}

            </div>
          ) : (
            <p className="text-neutral-500">
              Geen wedstrijd gepland.
            </p>
          )}
        </Link>

      </section>

      {/* ======================================================
          NAVIGATIE
          ====================================================== */}

      <section className="grid grid-cols-2 gap-4 mt-10">

        <NavButton
          label="Team"
          href={team ? `/team/${team.id}` : "/team"}
        />

        <NavButton
          label="Trainingen"
          href="/trainingen"
        />

        <NavButton
          label="Wedstrijden"
          href="/wedstrijden"
        />

        <NavButton
          label="Spelers"
          href="/spelers"
        />

        <NavButton
          label="Statistieken"
          href="/statistieken"
        />

      </section>

    </main>
  );
}