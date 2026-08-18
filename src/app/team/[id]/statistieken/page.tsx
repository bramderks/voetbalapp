"use client";

import { useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";

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
    <main className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="mb-6">
        <TeamBadge />
      </div>

      {/* TITEL */}
      <h1 className="text-3xl font-bold tracking-wide mb-8">Statistieken</h1>

      {/* TABEL */}
      <div
        className="
          bg-neutral-900 
          p-5 
          rounded-xl 
          border border-white 
          shadow-lg 
          overflow-x-auto
        "
      >
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="py-3 font-bold">Speler</th>
              <th className="py-3 font-bold">Training opkomst</th>
              <th className="py-3 font-bold">Wedstrijd opkomst</th>
              <th className="py-3 font-bold">Goals</th>
              <th className="py-3 font-bold">Assists</th>
            </tr>
          </thead>

          <tbody>
            {stats.map((s) => (
              <tr
                key={s.id}
                className="border-b border-neutral-800 hover:bg-neutral-800 transition"
              >
                <td className="py-3 font-bold">{s.name}</td>
                <td className="py-3 text-neutral-300">{s.trainingAttendances}</td>
                <td className="py-3 text-neutral-300">{s.matchAttendances}</td>
                <td className="py-3 text-green-400 font-bold">{s.goals}</td>
                <td className="py-3 text-blue-400 font-bold">{s.assists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </main>
  );
}
