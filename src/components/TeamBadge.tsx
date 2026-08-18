import Image from "next/image";

export default function TeamBadge() {
  return (
    <div className="flex items-center space-x-4">
      <div className="bg-neutral-900 p-2 rounded-xl border border-white shadow-lg">
        <Image
          src="/team-logo.png"
          alt="Team badge"
          width={60}
          height={60}
          className="rounded-lg"
        />
      </div>

      <div className="flex flex-col">
        <span className="text-2xl font-bold tracking-wide">SCE JO8‑1</span>
        <span className="text-neutral-400 text-sm">Seizoen 2026‑2027</span>
      </div>
    </div>
  );
}
