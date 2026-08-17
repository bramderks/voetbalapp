"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/solid";

interface PageProps {
  params: {
    id: string;
  };
}

interface Training {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

export default function TrainingDetail({ params }: PageProps) {
  const { id } = params;

  const [training, setTraining] = useState<Training | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/training/${id}`);
      const data = await res.json();
      setTraining(data);
    }
    load();
  }, [id]);

  if (!training) return <p>Laden...</p>;

  return (
    <main className="p-4">
      <Link href="/home">
        <HomeIcon className="w-7 h-7 text-blue-600" />
      </Link>

      <h1 className="text-xl font-bold">Training op {training.date}</h1>
    </main>
  );
}
