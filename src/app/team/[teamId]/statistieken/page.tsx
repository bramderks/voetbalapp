"use client";

import { useEffect, useState } from "react";

interface PlayerStats {
  id: number;
  name: string;
  trainingAttendances: number;
  matchAttendances: number;
  goals: number;
  assists: number;
}

interface Props {
  params: { teamId: string };
}

export default function StatistiekenPage({ params }: Props) {
  const teamId = Number(params.teamId);
  const [stats, setStats] = useState<PlayerStats[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/stats/${teamId}`);
      const data = await res.json();
      setStats(data);
    };
    load();
  }, [teamId]);

  return (
    <main style={{ padding: 16 }}>
      <h1>Statistieken</h1>
      <table>
        <thead>
          <tr>
            <th>Speler</th>
            <th>Training opkomst</th>
            <th>Wedstrijd opkomst</th>
            <th>Goals</th>
            <th>Assists</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.trainingAttendances}</td>
              <td>{s.matchAttendances}</td>
              <td>{s.goals}</td>
              <td>{s.assists}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
