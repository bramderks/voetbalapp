"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/solid";

type PlayerStats = {
  playerId: number;
  name: string;
  trainingTotal: number;
  trainingPresent: number;
  matchTotal: number;
  matchPresent: number;
  goals: number;
  assists: number;
};

export default function StatistiekenPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white p-4">
      <header className="flex items-center justify-between mb-6">
        <Link href="/home">
          <HomeIcon className="w-7 h-7 text-blue-600 cursor-pointer" />
        </Link>
      </header>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Statistieken
      </h1>

      <div className="flex flex-col gap-4 max-w-xl mx-auto">
        {stats.map((s) => (
          <div
            key={s.playerId}
            className="p-4 bg-gray-100 rounded-xl shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              {s.name}
            </h2>

            <p className="text-slate-700">
              Training opkomst:{" "}
              <span className="font-semibold">
                {s.trainingTotal === 0
                  ? "0%"
                  : Math.round((s.trainingPresent / s.trainingTotal) * 100) + "%"}
              </span>
            </p>

            <p className="text-slate-700">
              Wedstrijd opkomst:{" "}
              <span className="font-semibold">
                {s.matchTotal === 0
                  ? "0%"
                  : Math.round((s.matchPresent / s.matchTotal) * 100) + "%"}
              </span>
            </p>

            <p className="text-slate-700">
              Goals: <span className="font-semibold">{s.goals}</span>
            </p>

            <p className="text-slate-700">
              Assists: <span className="font-semibold">{s.assists}</span>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
