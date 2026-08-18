import TeamBadge from "@/components/TeamBadge";
import NavButton from "@/components/NavButton";

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <TeamBadge />

      <h1 className="text-3xl font-bold mt-4">JO8‑1</h1>
      <p className="text-lg">SCE Jongens</p>
      <p className="text-sm text-neutral-400">Seizoen 26‑27</p>

      <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md">
        <NavButton label="Spelers" href="/spelers" />
        <NavButton label="Trainingen" href="/trainingen" />
        <NavButton label="Wedstrijden" href="/wedstrijden" />
        <NavButton label="Statistieken" href="/stats" />
      </div>
    </main>
  );
}
