import Image from "next/image";

export default function TeamBadge() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[#e1e7e2] bg-white shadow-sm">
        <Image
          src="/logo/team.png"
          alt="SCE JO8-1"
          width={56}
          height={56}
          className="h-full w-full object-contain"
          priority
        />
      </div>

      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-[#17211b]">
          SCE JO8-1
        </span>

        <span className="text-xs font-medium text-[#647067]">
          Seizoen 2026-2027
        </span>
      </div>
    </div>
  );
}