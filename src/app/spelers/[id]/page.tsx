"use client";

import { use, useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Player {
  id: number;
  name: string;
  teamId: number;
}

export default function SpelerDetail({ params }: PageProps) {
  const { id } = use(params);

  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const res = await fetch(`/api/players/${id}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Speler kon niet worden geladen.");
        }

        if (!cancelled) {
          setPlayer(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Speler kon niet worden geladen."
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error)
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <TeamBadge />
        <p className="mt-6 text-red-400">{error}</p>
      </main>
    );

  if (!player)
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <p className="text-neutral-400">Laden...</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mb-6">
        <TeamBadge />
      </div>

      <h1 className="text-3xl font-bold tracking-wide">{player.name}</h1>
      <p className="text-neutral-400 mt-1">Speler ID: {player.id}</p>

      <div className="mt-10 bg-neutral-900 p-5 rounded-xl border border-white shadow-lg">
        <h2 className="text-xl font-bold mb-3">Statistieken</h2>
        <p className="text-neutral-400">Hier komen straks spelerstatistieken.</p>
      </div>
    </main>
  );
}
