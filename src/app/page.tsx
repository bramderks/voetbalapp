import TeamBadge from "@/components/TeamBadge";
import NavButton from "@/components/NavButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <TeamBadge />
        <div className="text-2xl font-bold">Menu</div>
      </header>

      <section className="space-y-4">
        <div className="bg-neutral-900 p-4 rounded-xl border border-white">
          <h2 className="text-xl font-bold">Volgende training</h2>
          <p>Dinsdag 18 augustus 2026 — 15:00–16:00</p>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl border border-white">
          <h2 className="text-xl font-bold">Volgende wedstrijd</h2>
          <p>Zaterdag 6 september 2026 — 10:00–11:00</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <NavButton label="Trainingen" href="/trainingen" />
          <NavButton label="Wedstrijden" href="/wedstrijden" />
          <NavButton label="Spelers" href="/spelers" />
          <NavButton label="Team JO8‑1" href="/team" />
        </div>
      </section>
    </main>
  );
}
