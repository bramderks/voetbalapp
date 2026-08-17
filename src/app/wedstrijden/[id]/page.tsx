"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeIcon, PlusIcon, MinusIcon, LockClosedIcon } from "@heroicons/react/24/solid";

export default function WedstrijdDetail({ params }) {
  const { id } = params;

  const [wedstrijd, setWedstrijd] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function load() {
      const w = await fetch(`/api/match/${id}`).then((r) => r.json());
      const p = await fetch("/api/player/list").then((r) => r.json());
      setWedstrijd(w);
      setPlayers(p);
    }
    load();
  }, [id]);

  if (!wedstrijd) return null;

  const locked =
    new Date() >
    new Date(new Date(wedstrijd.date).getTime() + 24 * 60 * 60 * 1000);

  async function updateStat(playerId, field, delta) {
    await fetch(`/api/match/stat/${id}`, {
      method: "POST",
      body: JSON.stringify({ playerId, field, delta }),
    });
    location.reload();
  }

  return (
    <main className="min-h-screen bg-white p-4">
      <header className="flex items-center justify-between mb-6">
        <Link href="/wedstrijden">
          <HomeIcon className="w-7 h-7 text-blue-600 cursor-pointer" />
        </Link>

        {locked && <LockClosedIcon className="w-7 h-7 text-red-600" />}
      </header>

      <h1 className="text-2xl font-bold text-slate-900 mb-4">
        Wedstrijd tegen {wedstrijd.opponent}
      </h1>

      <p className="text-slate-700 mb-6">{wedstrijd.date}</p>

      <div className="flex flex-col gap-4 max-w-xl mx-auto">
        {players.map((p) => (
          <div
            key={p.id}
            className="p-4 bg-gray-100 rounded-xl shadow-md flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-slate-600">
                Goals: {p.goals || 0} — Assists: {p.assists || 0}
              </p>
            </div>

            {!locked && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStat(p.id, "goals", 1)}
                  className="p-2 bg-blue-600 text-white rounded-full"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => updateStat(p.id, "goals", -1)}
                  className="p-2 bg-blue-600 text-white rounded-full"
                >
                  <MinusIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => updateStat(p.id, "assists", 1)}
                  className="p-2 bg-green-600 text-white rounded-full"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => updateStat(p.id, "assists", -1)}
                  className="p-2 bg-green-600 text-white rounded-full"
                >
                  <MinusIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
