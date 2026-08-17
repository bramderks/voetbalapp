"use client";

import { useEffect, useState } from "react";

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

  if (!player) return <p>Laden...</p>;

  return (
    <main className="p-4">
      <h1>{player.name}</h1>
    </main>
  );
}
