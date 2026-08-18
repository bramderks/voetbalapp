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
    <main className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <header className="flex items-center justify-between mb-10">
        <Link href="/home">
          <HomeIcon className="w-8 h-8 text-green-400 cursor-pointer" />
        </Link>
        <h1 className="text-3xl font-bold tracking-wide">Statistieken</h1>
      </header>

      {/* LIJST */}
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        {stats.map((s) => (
          <div
            key={s.playerId}
            className="
              bg-neutral-900 
              p-5 
              rounded-xl 
              border border-white 
              shadow-lg
            "
          >
            <h2 className="text-xl font-bold mb-3">{s.name}</h2>

            <p className="text-neutral-300">
              Training opkomst:{" "}
              <span className="font-bold text-white">
                {s.trainingTotal === 0
                  ? "0%"
                  : Math.round((s.trainingPresent / s.trainingTotal) * 100) + "%"}
              </span>
            </p>

            <p className="text-neutral-300">
              Wedstrijd opkomst:{" "}
              <span className="font-bold text-white">
                {s.matchTotal === 0
                  ? "0%"
                  : Math.round((s.matchPresent / s.matchTotal) * 100) + "%"}
              </span>
            </p>

            <p className="text-neutral-300">
              Goals:{" "}
              <span className="font-bold text-white">{s.goals}</span>
            </p>

            <p className="text-neutral-300">
              Assists:{" "}
              <span className="font-bold text-white">{s.assists}</span>
            </p>
          </div>
        ))}
      </div>

    </main>
  );
}
