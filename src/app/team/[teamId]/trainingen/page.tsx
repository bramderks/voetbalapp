"use client";

import { useEffect, useState } from "react";

interface Training {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

interface Player {
  id: number;
  name: string;
}

interface Props {
  params: { teamId: string };
}

export default function TrainingenPage({ params }: Props) {
  const teamId = Number(params.teamId);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  useEffect(() => {
    const load = async () => {
      const tRes = await fetch("/api/training");
      const trainingsData = await tRes.json();
      setTrainings(trainingsData);

      const pRes = await fetch("/api/teamPlayers?teamId=" + teamId);
      const playersData = await pRes.json();
      setPlayers(playersData);
    };
    load();
  }, [teamId]);

  const isPast = (training: Training) =>
    new Date(training.date) < new Date();

  const toggleAttendance = async (trainingId: number, playerId: number, present: boolean) => {
    await fetch("/api/attendance", {
      method: "POST",
      body: JSON.stringify({ activityId: trainingId, playerId, present }),
    });
  };

  return (
    <main style={{ padding: 16 }}>
      <h1>Trainingen</h1>

      <h2>Overzicht</h2>
      <ul>
        {trainings.map((t) => (
          <li key={t.id}>
            <button onClick={() => setSelectedTraining(t)}>
              {t.date} {t.startTime}-{t.endTime}
            </button>
          </li>
        ))}
      </ul>

      {selectedTraining && (
        <section style={{ marginTop: 24 }}>
          <h2>Training {selectedTraining.date}</h2>
          {isPast(selectedTraining) && (
            <p>Training is voorbij, aanwezigheid kan niet meer gewijzigd worden.</p>
          )}
          <ul>
            {players.map((p) => (
              <li key={p.id}>
                {p.name}{" "}
                {!isPast(selectedTraining) && (
                  <>
                    <button
                      onClick={() =>
                        toggleAttendance(selectedTraining.id, p.id, true)
                      }
                    >
                      Aanwezig
                    </button>
                    <button
                      onClick={() =>
                        toggleAttendance(selectedTraining.id, p.id, false)
                      }
                    >
                      Afwezig
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
