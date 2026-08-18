import prisma from "@/lib/prisma";

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

export default async function TrainingRegistrerenPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Training registreren
          </h1>

          <p className="mt-2 text-sm text-red-600">
            Geen geldige training geselecteerd.
          </p>
        </div>
      </main>
    );
  }

  const training = await prisma.activity.findUnique({
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
    },
  });

  if (!training || training.type !== "TRAINING") {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Training registreren
          </h1>

          <p className="mt-2 text-sm text-red-600">
            Training niet gevonden.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Training registreren
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {training.team.name}
          </p>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">
                Datum:
              </span>{" "}
              {formatDate(training.date)}
            </p>

            <p>
              <span className="font-medium text-slate-900">
                Tijd:
              </span>{" "}
              {training.startTime} - {training.endTime}
            </p>

            <p>
              <span className="font-medium text-slate-900">
                Status:
              </span>{" "}
              {training.locked ? "Gesloten" : "Open"}
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[1fr_auto] bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <span>Speler</span>
              <span>Aanwezig</span>
            </div>

            {training.attendance.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500">
                Er zijn nog geen aanwezigheidsregistraties.
              </div>
            ) : (
              training.attendance.map((attendance) => (
                <div
                  key={attendance.id}
                  className="grid grid-cols-[1fr_auto] items-center border-t border-slate-200 px-4 py-3"
                >
                  <span className="text-sm text-slate-900">
                    {attendance.player.name}
                  </span>

                  <span
                    className={
                      attendance.present
                        ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                        : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                    }
                  >
                    {attendance.present
                      ? "Aanwezig"
                      : "Afwezig"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}