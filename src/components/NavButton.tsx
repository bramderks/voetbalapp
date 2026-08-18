"use client";

interface NavButtonProps {
  label: string;
  href: string;
}

export default function NavButton({ label, href }: NavButtonProps) {
  return (
    <a
      href={href}
      className="block bg-neutral-900 border border-white rounded-xl p-4 text-center font-bold hover:bg-neutral-800 transition"
    >
      {label}
    </a>
  );
}
