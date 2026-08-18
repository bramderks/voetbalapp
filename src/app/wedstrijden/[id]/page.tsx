"use client";

import { useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";

interface Match {
  id: number;
  opponent: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export default function WedstrijdDetail({ params }: { params: { id: string } }) {
  const id = params.id;

  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    fetch(`/api/matches/${id}`)
      .then((r) => r.json())
      .then(setMatch);
  }, [id]);

  if (!match) return <p className="text-white">Laden...</p>;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <TeamBadge />

      <h1 className="text-3xl font-bold mt-4">
        SCE JO8‑1 vs {match.opponent}
      </h1>

      <p className="text-lg">{match.date}</p>
      <p className="text-lg">{match.startTime} – {match.endTime}</p>
      <p className="text-lg">{match.location}</p>
    </main>
  );
}
