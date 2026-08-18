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

  if (!match)
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

      {/* TITEL */}
      <h1 className="text-3xl font-bold tracking-wide">
        SCE JO8‑1 vs {match.opponent}
      </h1>

      {/* INFO */}
      <p className="text-lg text-neutral-300 mt-2">{match.date}</p>
      <p className="text-lg text-neutral-300">{match.startTime} – {match.endTime}</p>
      <p className="text-lg text-neutral-300">{match.location}</p>

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
        <h2 className="text-xl font-bold mb-3">Wedstrijd informatie</h2>
        <p className="text-neutral-400">Hier kun je straks extra details tonen.</p>
      </div>

    </main>
  );
}
