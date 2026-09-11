"use client";

import { useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";

interface Player {
  id: number;
  name: string;
}

interface Props {
  params: { id: string };
}

export default function SpelersPage({ params }: Props) {
  const teamId = Number(params.id);
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPlayers = async () => {
      try {
        if (!Number.isInteger(teamId) || teamId <= 0) {
          throw new Error("Ongeldig team-ID.");
        }

        const res = await fetch(`/api/teamPlayers?teamId=${teamId}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Spelers konden niet worden geladen.");
        }

        if (!cancelled) {
          setPlayers(data);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Spelers konden niet worden geladen."
          );
        }
      }
    };

    loadPlayers();

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const addPlayer = async () => {
    if (!name.trim() || !Number.isInteger(teamId) || teamId <= 0) return;

    try {
      setError(null);

      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, teamId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Speler kon niet worden toegevoegd.");
      }

      setName("");

      const res = await fetch(`/api/teamPlayers?teamId=${teamId}`, {
        cache: "no-store",
      });
      const playersData = await res.json();

      if (!res.ok) {
        throw new Error(
          playersData?.error ?? "Spelers konden niet worden geladen."
        );
      }

      setPlayers(playersData);
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : "Speler kon niet worden toegevoegd."
      );
    }
  };

  const deletePlayer = async (id: number) => {
    try {
      setError(null);

      const response = await fetch("/api/players", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Speler kon niet worden verwijderd.");
      }

      const res = await fetch(`/api/teamPlayers?teamId=${teamId}`, {
        cache: "no-store",
      });
      const playersData = await res.json();

      if (!res.ok) {
        throw new Error(
          playersData?.error ?? "Spelers konden niet worden geladen."
        );
      }

      setPlayers(playersData);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Speler kon niet worden verwijderd."
      );
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="mb-6">
        <TeamBadge />
      </div>

      {/* TITEL */}
      <h1 className="text-3xl font-bold tracking-wide mb-8">Spelers</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500 bg-red-950 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

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
