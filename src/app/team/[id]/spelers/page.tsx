"use client";

import { useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";

interface Player {
  id: number;
  name: string;
}

interface Props {
  params: { teamId: string };
}

export default function SpelersPage({ params }: Props) {
  const teamId = Number(params.teamId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const loadPlayers = async () => {
      const res = await fetch("/api/teamPlayers?teamId=" + teamId);
      const data = await res.json();
      setPlayers(data);
    };

    loadPlayers();
  }, [teamId]);

  const addPlayer = async () => {
    if (!name.trim()) return;

    await fetch("/api/players", {
      method: "POST",
      body: JSON.stringify({ name, teamId }),
    });

    setName("");

    const res = await fetch("/api/teamPlayers?teamId=" + teamId);
    const data = await res.json();
    setPlayers(data);
  };

  const deletePlayer = async (id: number) => {
    await fetch("/api/players", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    const res = await fetch("/api/teamPlayers?teamId=" + teamId);
    const data = await res.json();
    setPlayers(data);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="mb-6">
        <TeamBadge />
      </div>

      {/* TITEL */}
      <h1 className="text-3xl font-bold tracking-wide mb-8">Spelers</h1>

      {/* NIEUWE SPELER */}
      <section
        className="
          bg-neutral-900 
          p-5 
          rounded-xl 
          border border-white 
          shadow-lg 
          mb-10
        "
      >
        <h2 className="text-xl font-bold mb-4">Nieuwe speler</h2>

        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Naam speler"
            className="
              flex-1 
              bg-black 
              border border-white 
              rounded-xl 
              p-3 
              text-white
              placeholder-neutral-500
            "
          />
          <button
            onClick={addPlayer}
            className="
              bg-green-600 
              hover:bg-green-500 
              transition 
              px-4 
              py-2 
              rounded-xl 
              font-bold
            "
          >
            Toevoegen
          </button>
        </div>
      </section>

      {/* OVERZICHT */}
      <section className="space-y-4">
        {players.map((p) => (
          <div
            key={p.id}
            className="
              bg-neutral-900 
              p-5 
              rounded-xl 
              border border-white 
              flex 
              items-center 
              justify-between
              shadow-lg
            "
          >
            <span className="text-xl font-bold">{p.name}</span>

            <button
              onClick={() => deletePlayer(p.id)}
              className="
                bg-red-600 
                hover:bg-red-500 
                transition 
                px-4 
                py-2 
                rounded-xl 
                font-bold
              "
            >
              Verwijderen
            </button>
          </div>
        ))}
      </section>

    </main>
  );
}
