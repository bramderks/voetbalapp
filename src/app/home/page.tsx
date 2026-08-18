"use client";

import TeamBadge from "@/components/TeamBadge";
import NavButton from "@/components/NavButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <header className="flex items-center justify-between mb-10">
        <TeamBadge />
        <h1 className="text-3xl font-bold tracking-wide">VOETBAL APP</h1>
      </header>

      {/* INFO CARDS */}
      <section className="space-y-4">
        <div className="bg-neutral-900 p-5 rounded-xl border border-white shadow-lg">
          <h2 className="text-xl font-bold mb-1">Volgende training</h2>
          <p className="text-neutral-300">
            Dinsdag 18 augustus 2026 — 15:00–16:00
          </p>
        </div>

        <div className="bg-neutral-900 p-5 rounded-xl border border-white shadow-lg">
          <h2 className="text-xl font-bold mb-1">Volgende wedstrijd</h2>
          <p className="text-neutral-300">
            Zaterdag 6 september 2026 — 10:00–11:00
          </p>
        </div>
      </section>

      {/* GRID NAVIGATIE */}
      <section className="grid grid-cols-2 gap-4 mt-10">
        <NavButton label="Team" href="/team/1" />
        <NavButton label="Trainingen" href="/team/1/trainingen" />
        <NavButton label="Wedstrijden" href="/team/1/wedstrijden" />
        <NavButton label="Spelers" href="/team/1/spelers" />
        <NavButton label="Statistieken" href="/team/1/statistieken" />
      </section>

    </main>
  );
}
