"use client";

import { useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";
import Toggle from "@/components/Toggle";

interface Training {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

interface Player {
  id: number;
  name: string;
  present: boolean | null;
}

interface Props {
  params: { id: string };
}

export default function TrainingenPage({ params }: Props) {
  const teamId = Number(params.id);

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTraining, setSelectedTraining] =
    useState<Training | null>(null);

  useEffect(() => {
    const load = async () => {
      // TRAININGEN LADEN
      const tRes = await fetch("/api/training");
      const trainingsData = await tRes.json();
      setTrainings(trainingsData);

      // SPELERS LADEN
      const pRes = await fetch(
        "/api/teamPlayers?teamId=" + teamId
      );
      const playersData = await pRes.json();

      const enriched = playersData.map(
        (p: { id: number; name: string }) => ({
          ...p,
          present: null,
        })
      );

      setPlayers(enriched);
    };

    load();
  }, [teamId]);

  const isPast = (training: Training) =>
    new Date(training.date) < new Date();

  const toggleAttendance = async (
    trainingId: number,
    playerId: number,
    present: boolean | null
  ) => {
    await fetch("/api/attendance", {
      method: "POST",
      body: JSON.stringify({
        activityId: trainingId,
        playerId,
        present,
      }),
    });

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, present } : p
      )
    );
  };

  return (
    <main className="min-h-screen bg-black p-6 text-white">

      {/* HEADER */}
      <div className="mb-6">
        <TeamBadge />
      </div>

      <h1 className="mb-8 text-3xl font-bold tracking-wide">
        Trainingen
      </h1>

      {/* OVERZICHT */}
      <section className="mb-10 rounded-xl border border-white bg-neutral-900 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">
          Overzicht
        </h2>

        <ul className="space-y-3">
          {trainings.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setSelectedTraining(t)}
                className="
                  w-full
                  rounded-xl
                  border
                  border-white
                  bg-black
                  p-3
                  text-left
                  transition
                  hover:border-green-400
                  hover:bg-neutral-800
                "
              >
                <p className="text-lg font-bold">
                  {new Date(t.date).toLocaleDateString(
                    "nl-NL",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>

                <p className="text-neutral-300">
                  {t.startTime}–{t.endTime}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* DETAILPAGINA */}
      {selectedTraining && (
        <section className="rounded-xl border border-white bg-neutral-900 p-5 shadow-lg">
          <h2 className="mb-4 text-xl font-bold">
            Training{" "}
            {new Date(
              selectedTraining.date
            ).toLocaleDateString("nl-NL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>

          {isPast(selectedTraining) && (
            <p className="mb-4 text-red-400">
              Training is voorbij — aanwezigheid kan
              niet meer gewijzigd worden.
            </p>
          )}

          <ul className="space-y-3">
            {players.map((p) => (
              <li
                key={p.id}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-white
                  bg-black
                  p-3
                "
              >
                <span className="text-lg font-bold">
                  {p.name}
                </span>

                {!isPast(selectedTraining) ? (
                  <Toggle
                    value={p.present}
                    onChange={(val) =>
                      toggleAttendance(
                        selectedTraining.id,
                        p.id,
                        val
                      )
                    }
                  />
                ) : (
                  <span className="text-neutral-400">
                    {p.present === true
                      ? "Aanwezig"
                      : p.present === false
                        ? "Afwezig"
                        : "Geen status"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

    </main>
  );
}