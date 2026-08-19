"use client";

import { useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";
import Toggle from "@/components/Toggle";

interface Match {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  opponent: string | null;
  location: string | null;
}

interface Player {
  id: number;
  name: string;
  present: boolean | null;
  goals: number;
  assists: number;
}

interface TeamPlayer {
  id: number;
  name: string;
}

interface Props {
  params: { id: string };
}

export default function WedstrijdenPage({ params }: Props) {
  const teamId = Number(params.id);

  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedMatch, setSelectedMatch] =
    useState<Match | null>(null);

  useEffect(() => {
    const load = async () => {
      // Wedstrijden laden
      const mRes = await fetch("/api/match");
      const matchesData = await mRes.json();
      setMatches(matchesData);

      // Spelers laden
      const pRes = await fetch(
        "/api/teamPlayers?teamId=" + teamId
      );
      const playersData = await pRes.json();

      const enriched = playersData.map(
        (p: TeamPlayer) => ({
          ...p,
          present: null,
          goals: 0,
          assists: 0,
        })
      );

      setPlayers(enriched);
    };

    load();
  }, [teamId]);

  const toggleAttendance = async (
    matchId: number,
    playerId: number,
    present: boolean | null
  ) => {
    await fetch("/api/attendance", {
      method: "POST",
      body: JSON.stringify({
        activityId: matchId,
        playerId,
        present,
      }),
    });

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, present }
          : p
      )
    );
  };

  const updateStats = async (
    matchId: number,
    playerId: number,
    goals: number,
    assists: number
  ) => {
    await fetch("/api/matchstats", {
      method: "POST",
      body: JSON.stringify({
        activityId: matchId,
        playerId,
        goals,
        assists,
      }),
    });

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              goals: p.goals + goals,
              assists: p.assists + assists,
            }
          : p
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
        Wedstrijden
      </h1>

      {/* OVERZICHT */}
      <section className="mb-10 rounded-xl border border-white bg-neutral-900 p-5 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">
          Overzicht
        </h2>

        <ul className="space-y-3">
          {matches.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => setSelectedMatch(m)}
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
                  {new Date(
                    m.date
                  ).toLocaleDateString("nl-NL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                <p className="text-neutral-300">
                  {m.opponent ??
                    "Onbekende tegenstander"}{" "}
                  — {m.startTime}–{m.endTime}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* DETAIL */}
      {selectedMatch && (
        <section className="rounded-xl border border-white bg-neutral-900 p-5 shadow-lg">
          <h2 className="mb-4 text-xl font-bold">
            Wedstrijd{" "}
            {new Date(
              selectedMatch.date
            ).toLocaleDateString("nl-NL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>

          <p className="mb-6 text-neutral-300">
            Tegenstander:{" "}
            <span className="font-bold text-white">
              {selectedMatch.opponent ?? "Onbekend"}
            </span>{" "}
            — Locatie:{" "}
            <span className="font-bold text-white">
              {selectedMatch.location ?? "Onbekend"}
            </span>
          </p>

          {/* TABEL */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="py-3 font-bold">
                    Speler
                  </th>
                  <th className="py-3 font-bold">
                    Goals
                  </th>
                  <th className="py-3 font-bold">
                    Assists
                  </th>
                  <th className="py-3 font-bold">
                    Aanwezig
                  </th>
                </tr>
              </thead>

              <tbody>
                {players.map((p) => (
                  <tr
                    key={p.id}
                    className="
                      border-b
                      border-neutral-800
                      transition
                      hover:bg-neutral-800
                    "
                  >
                    {/* Naam */}
                    <td className="py-3 font-bold">
                      {p.name}
                    </td>

                    {/* Goals */}
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateStats(
                              selectedMatch.id,
                              p.id,
                              -1,
                              0
                            )
                          }
                          className="
                            rounded-xl
                            bg-red-600
                            px-3
                            py-1
                            font-bold
                            hover:bg-red-500
                          "
                        >
                          –
                        </button>

                        <span className="font-bold text-green-400">
                          {p.goals}
                        </span>

                        <button
                          onClick={() =>
                            updateStats(
                              selectedMatch.id,
                              p.id,
                              1,
                              0
                            )
                          }
                          className="
                            rounded-xl
                            bg-green-600
                            px-3
                            py-1
                            font-bold
                            hover:bg-green-500
                          "
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Assists */}
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateStats(
                              selectedMatch.id,
                              p.id,
                              0,
                              -1
                            )
                          }
                          className="
                            rounded-xl
                            bg-red-600
                            px-3
                            py-1
                            font-bold
                            hover:bg-red-500
                          "
                        >
                          –
                        </button>

                        <span className="font-bold text-blue-400">
                          {p.assists}
                        </span>

                        <button
                          onClick={() =>
                            updateStats(
                              selectedMatch.id,
                              p.id,
                              0,
                              1
                            )
                          }
                          className="
                            rounded-xl
                            bg-blue-600
                            px-3
                            py-1
                            font-bold
                            hover:bg-blue-500
                          "
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Aanwezigheid */}
                    <td className="py-3">
                      <Toggle
                        value={p.present}
                        onChange={(val) =>
                          toggleAttendance(
                            selectedMatch.id,
                            p.id,
                            val
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </main>
  );
}