"use client";

import { useEffect, useState } from "react";

interface Match {
  id: number;
  date: string;
  opponent: string | null;
}

export default function WedstrijdenPage() {
  const [list, setList] = useState<Match[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/match/list");
      const data = await res.json();
      setList(data);
    }
    load();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Wedstrijden</h1>

      {list.map((m) => (
        <div key={m.id} className="p-3 bg-gray-100 rounded mb-2">
          <p className="font-semibold">{m.opponent ?? "Onbekende tegenstander"}</p>
          <p>{m.date}</p>
        </div>
      ))}
    </main>
  );
}
