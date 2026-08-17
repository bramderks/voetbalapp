"use client";

import { useEffect, useState } from "react";

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
}

interface Props {
  params: { teamId: string };
}

export default function WedstrijdenPage({ params }: Props) {
  const teamId = Number(params.teamId);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    const load = async () => {
      const mRes = await fetch("/api/match");
      const matchesData = await mRes.json();
      setMatches(matchesData);

      const pRes = await fetch("/api/teamPlayers?teamId=" + teamId);
      const playersData = await pRes.json();
      setPlayers(playersData);
    };
    load();
  }, [teamId]);

  const toggleAttendance = async (matchId: number, playerId: number, present: boolean) => {
    await fetch("/api/attendance", {
      method: "POST",
      body: JSON.stringify({ activityId: matchId, playerId, present }),
    });
  };

  const updateStats = async (matchId: number, playerId: number, goals: number, assists: number) => {
    await fetch("/api/matchstats", {
      method: "POST",
      body: JSON.stringify({ activityId: matchId, playerId, goals, assists }),
    });
  };

  return (
    <main style={{ padding: 16 }}>
      <h1>Wedstrijden</h1>

      <h2>Overzicht</h2>
      <ul>
        {matches.map((m) => (
          <li key={m.id}>
            <button onClick={() => setSelectedMatch(m)}>
              {m.date} {m.opponent ?? "Onbekende tegenstander"}
            </button>
          </li>
        ))}
      </ul>

      {selectedMatch && (
        <section style={{ marginTop: 24 }}>
          <h2>Wedstrijd {selectedMatch.date}</h2>
          <p>
            Tegenstander: {selectedMatch.opponent} – Locatie: {selectedMatch.location}
          </p>
          <ul>
            {players.map((p) => (
              <li key={p.id}>
                {p.name}{" "}
                <button
                  onClick={() =>
                    toggleAttendance(selectedMatch.id, p.id, true)
                  }
                >
                  Aanwezig
                </button>
                <button
                  onClick={() =>
                    toggleAttendance(selectedMatch.id, p.id, false)
                  }
                >
                  Afwezig
                </button>
                <button
                  onClick={() =>
                    updateStats(selectedMatch.id, p.id, 1, 0)
                  }
                >
                  +1 goal
                </button>
                <button
                  onClick={() =>
                    updateStats(selectedMatch.id, p.id, 0, 1)
                  }
                >
                  +1 assist
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
