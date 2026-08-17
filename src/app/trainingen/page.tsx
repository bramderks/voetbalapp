"use client";

import { useState } from "react";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/solid";

export default function NieuweTrainingPage() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  async function saveTraining() {
    await fetch("/api/training/create", {
      method: "POST",
      body: JSON.stringify({ date, startTime, endTime }),
    });
    window.location.href = "/trainingen";
  }

  return (
    <main className="min-h-screen bg-white p-4">
      <header className="flex items-center justify-between mb-6">
        <Link href="/trainingen">
          <HomeIcon className="w-7 h-7 text-blue-600 cursor-pointer" />
        </Link>
      </header>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nieuwe training</h1>

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <input
          type="date"
          className="p-3 border rounded-lg"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          className="p-3 border rounded-lg"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <input
          type="time"
          className="p-3 border rounded-lg"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <button
          onClick={saveTraining}
          className="p-3 bg-blue-600 text-white rounded-lg shadow-md"
        >
          Opslaan
        </button>
      </div>
    </main>
  );
}
