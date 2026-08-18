import Image from "next/image";

export default function TeamBadge() {
  return (
    <div className="flex items-center space-x-3">
      <Image
        src="/team-logo.png"   // ← pas dit aan naar jouw echte logo-pad
        alt="Team badge"
        width={60}
        height={60}
        className="rounded-full"
      />
      <span className="text-xl font-bold">SCE JO8‑1</span>
    </div>
  );
}
