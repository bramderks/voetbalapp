"use client";

import { useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";

interface PageProps {
  params: {
    id: string;
  };
}

interface Player {
  id: number;
  name: string;
  teamId: number;
}

export default function SpelerDetail({ params }: PageProps) {
  const { id } = params;

  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/player/${id}`);
      const data = await res.json();
      setPlayer(data);
    }
    load();
  }, [id]);

  if (!player)
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <p className="text-neutral-400">Laden...</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="mb-6">
        <TeamBadge />
      </div>

      {/* SPELER INFO */}
      <h1 className="text-3xl font-bold tracking-wide">{player.name}</h1>
      <p className="text-neutral-400 mt-1">Speler ID: {player.id}</p>

      {/* CARD */}
      <div
        className="
          mt-10 
          bg-neutral-900 
          p-5 
          rounded-xl 
          border border-white 
          shadow-lg
        "
      >
        <h2 className="text-xl font-bold mb-3">Statistieken</h2>
        <p className="text-neutral-400">Hier komen straks spelerstatistieken.</p>
      </div>

    </main>
  );
}
