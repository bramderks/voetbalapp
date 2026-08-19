import Link from "next/link";
import prisma from "@/lib/prisma";

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
  });
}

type MenuItemProps = {
  href: string;
  label: string;
  icon: string;
};

function MenuItem({ href, label, icon }: MenuItemProps) {
  return (
    <Link
      href={href}
      className="
        group
        flex
        min-h-[150px]
        flex-col
        items-center
        justify-center
        gap-4
        rounded-2xl
        border
        border-[#e1e7e2]
        bg-white
        p-5
        text-center
        shadow-sm
        transition
        duration-150
        hover:-translate-y-0.5
        hover:border-[#16803c]
        hover:shadow-md
        active:translate-y-0
      "
    >
      <span
        aria-hidden="true"
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-[#e9f7ee]
          text-3xl
          transition
          group-hover:bg-[#16803c]
          group-hover:scale-105
        "
      >
        {icon}
      </span>

      <span className="text-base font-bold text-[#17211b]">
        {label}
      </span>
    </Link>
  );
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
      teamId: team?.id,
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
      teamId: team?.id,
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
    <main className="app-page">
      <div className="app-container">

        {/* ==================================================
            WELKOM
            ================================================== */}

        <section className="mb-8">
          <p className="mb-1 text-sm font-semibold text-[#16803c]">
            Welkom bij de Voetbalapp
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#17211b] sm:text-4xl">
            {team?.name ?? "Mijn team"}
          </h1>

          {team?.season && (
            <p className="mt-1 text-sm text-[#647067]">
              Seizoen {team.season}
            </p>
          )}
        </section>

        {/* ==================================================
            VOLGENDE ACTIVITEITEN
            ================================================== */}

        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#17211b]">
              Eerstvolgende
            </h2>

            <p className="mt-1 text-sm text-[#647067]">
              De eerstvolgende training en wedstrijd.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* TRAINING */}

            <Link
              href={
                volgendeTraining
                  ? `/trainingen/${volgendeTraining.id}`
                  : "/trainingen"
              }
              className="
                group
                rounded-2xl
                border
                border-[#e1e7e2]
                bg-white
                p-5
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:border-[#16803c]
                hover:shadow-md
              "
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#e9f7ee]
                    text-2xl
                  "
                  aria-hidden="true"
                >
                  ⚽
                </span>

                <div>
                  <p className="text-sm font-semibold text-[#16803c]">
                    Volgende training
                  </p>
                </div>
              </div>

              {volgendeTraining ? (
                <>
                  <p className="font-bold capitalize text-[#17211b]">
                    {formatDate(volgendeTraining.date)}
                  </p>

                  <p className="mt-1 text-sm text-[#647067]">
                    {volgendeTraining.startTime} –{" "}
                    {volgendeTraining.endTime}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#647067]">
                  Geen training gepland.
                </p>
              )}
            </Link>

            {/* WEDSTRIJD */}

            <Link
              href={
                volgendeWedstrijd
                  ? `/wedstrijden/${volgendeWedstrijd.id}`
                  : "/wedstrijden"
              }
              className="
                group
                rounded-2xl
                border
                border-[#e1e7e2]
                bg-white
                p-5
                shadow-sm
                transition
                hover:-translate-y-0.5
                hover:border-[#16803c]
                hover:shadow-md
              "
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#e9f7ee]
                    text-2xl
                  "
                  aria-hidden="true"
                >
                  🏆
                </span>

                <div>
                  <p className="text-sm font-semibold text-[#16803c]">
                    Volgende wedstrijd
                  </p>
                </div>
              </div>

              {volgendeWedstrijd ? (
                <>
                  <p className="font-bold capitalize text-[#17211b]">
                    {formatDate(volgendeWedstrijd.date)}
                  </p>

                  <p className="mt-1 text-sm text-[#647067]">
                    {volgendeWedstrijd.startTime} –{" "}
                    {volgendeWedstrijd.endTime}
                  </p>

                  {volgendeWedstrijd.opponent && (
                    <p className="mt-2 text-sm text-[#647067]">
                      Tegen{" "}
                      <span className="font-semibold text-[#17211b]">
                        {volgendeWedstrijd.opponent}
                      </span>
                    </p>
                  )}

                  {volgendeWedstrijd.home !== null && (
                    <p className="mt-1 text-sm font-medium text-[#647067]">
                      {volgendeWedstrijd.home ? "Thuis" : "Uit"}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-[#647067]">
                  Geen wedstrijd gepland.
                </p>
              )}
            </Link>

          </div>
        </section>

        {/* ==================================================
            HOOFDMENU
            ================================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#17211b]">
              Teambeheer
            </h2>

            <p className="mt-1 text-sm text-[#647067]">
              Kies wat je wilt bekijken.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

            <MenuItem
              href={team ? `/team/${team.id}` : "/team"}
              label="Team"
              icon="🛡️"
            />

            <MenuItem
              href="/trainingen"
              label="Trainingen"
              icon="⚽"
            />

            <MenuItem
              href="/wedstrijden"
              label="Wedstrijden"
              icon="🏆"
            />

            <MenuItem
              href="/spelers"
              label="Spelers"
              icon="👥"
            />

            <MenuItem
              href="/statistieken"
              label="Statistieken"
              icon="📊"
            />

          </div>
        </section>

      </div>
    </main>
  );
}