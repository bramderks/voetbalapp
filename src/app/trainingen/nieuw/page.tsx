import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function NieuweTrainingPage() {
  const team = await prisma.team.findFirst({
    orderBy: {
      id: "asc",
    },
  });

  if (!team) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Nieuwe training
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Er is nog geen team aangemaakt. Maak eerst een team aan.
          </p>
        </div>
      </main>
    );
  }

  const teamId = team.id;
  const teamName = team.name;

  async function createTraining(formData: FormData) {
    "use server";

    const date = String(formData.get("date") ?? "");
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");

    if (!date || !startTime || !endTime) {
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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Nieuwe training
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {teamName}
          </p>
        </div>

        <form
          action={createTraining}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5">
            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Datum
              </label>

              <input
                id="date"
                name="date"
                type="date"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Begintijd
                </label>

                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Eindtijd
                </label>

                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Training aanmaken
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}