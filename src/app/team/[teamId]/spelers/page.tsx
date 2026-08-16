"use client";

import { useEffect, useState } from "react";

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
    <main style={{ padding: 16 }}>
      <h1>Spelers</h1>

      <section>
        <h2>Nieuwe speler</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Naam speler"
        />
        <button onClick={addPlayer}>Toevoegen</button>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Overzicht</h2>
        <ul>
          {players.map((p) => (
            <li key={p.id}>
              {p.name}{" "}
              <button onClick={() => deletePlayer(p.id)}>Verwijderen</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
