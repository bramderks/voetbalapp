"use client";

interface NavButtonProps {
  label: string;
  href: string;
}

export default function NavButton({ label, href }: NavButtonProps) {
  return (
    <a
      href={href}
      className="
        block 
        bg-neutral-900 
        border border-white 
        rounded-xl 
        p-5 
        text-center 
        text-lg 
        font-bold 
        tracking-wide
        hover:bg-neutral-800 
        hover:border-green-400
        transition
        shadow-lg
      "
    >
      {label}
    </a>
  );
}
