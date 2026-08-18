"use client";

import { useEffect, useState } from "react";
import TeamBadge from "@/components/TeamBadge";

interface Training {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

export default function TrainingDetail({ params }: { params: { id: string } }) {
  const id = params.id;

  const [training, setTraining] = useState<Training | null>(null);

  useEffect(() => {
    fetch(`/api/training/${id}`)
      .then((r) => r.json())
      .then(setTraining);
  }, [id]);

  if (!training) return <p className="text-white">Laden...</p>;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <TeamBadge />

      <h1 className="text-3xl font-bold mt-4">{training.date}</h1>
      <p className="text-lg">{training.startTime} – {training.endTime}</p>

      <div className="mt-6 bg-neutral-900 p-4 rounded-xl border border-white">
        <h2 className="text-xl font-bold mb-4">Aanwezigheid</h2>
        <p className="text-neutral-400">Hier komt jouw toggle‑UI</p>
      </div>
    </main>
  );
}
