"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Ga één pagina terug"
      className="
        inline-flex
        shrink-0
        items-center
        gap-2
        rounded-xl
        border
        border-[#e1e7e2]
        bg-white
        px-4
        py-2.5
        text-sm
        font-bold
        text-[#17211b]
        shadow-sm
        transition
        hover:border-[#16803c]
        hover:text-[#16803c]
        active:translate-y-px
      "
    >
      <span aria-hidden="true" className="text-base leading-none">
        ←
      </span>
      <span>Terug</span>
    </button>
  );
}
