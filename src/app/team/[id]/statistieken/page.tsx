"use client";

import { useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";

interface PlayerStats {
  playerId: number;
  name: string;
  trainingTotal: number;
  trainingPresent: number;
  matchTotal: number;
  matchPresent: number;
  goals: number;
  assists: number;
}

interface Props {
  params: { id: string };
}

export default function StatistiekenPage({ params }: Props) {
  const teamId = Number(params.id);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (!Number.isInteger(teamId) || teamId <= 0) {
          throw new Error("Ongeldig team-ID.");
        }

        const res = await fetch(`/api/stats/${teamId}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ?? "Statistieken konden niet worden geladen."
          );
        }

        if (!cancelled) {
          setStats(data.players ?? []);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Statistieken konden niet worden geladen."
          );
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  return (
    <main className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="mb-6">
        <TeamBadge />
      </div>

      {/* TITEL */}
      <h1 className="text-3xl font-bold tracking-wide mb-8">Statistieken</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500 bg-red-950 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

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
                key={s.playerId}
                className="border-b border-neutral-800 hover:bg-neutral-800 transition"
              >
                <td className="py-3 font-bold">{s.name}</td>
                <td className="py-3 text-neutral-300">
                  {s.trainingPresent}/{s.trainingTotal}
                </td>
                <td className="py-3 text-neutral-300">
                  {s.matchPresent}/{s.matchTotal}
                </td>
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
