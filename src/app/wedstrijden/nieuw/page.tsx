"use client";

import { useState } from "react";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/solid";

export default function NieuweWedstrijdPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [location, setLocation] = useState("");

  async function saveMatch() {
    await fetch("/api/match/create", {
      method: "POST",
      body: JSON.stringify({ date, time, opponent, location }),
    });
    window.location.href = "/wedstrijden";
  }

  return (
    <main className="min-h-screen bg-white p-4">
      <header className="flex items-center justify-between mb-6">
        <Link href="/wedstrijden">
          <HomeIcon className="w-7 h-7 text-blue-600 cursor-pointer" />
        </Link>
      </header>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nieuwe wedstrijd</h1>

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
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <input
          type="text"
          placeholder="Tegenstander"
          className="p-3 border rounded-lg"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
        />

        <input
          type="text"
          placeholder="Locatie"
          className="p-3 border rounded-lg"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button
          onClick={saveMatch}
          className="p-3 bg-blue-600 text-white rounded-lg shadow-md"
        >
          Opslaan
        </button>
      </div>
    </main>
  );
}
