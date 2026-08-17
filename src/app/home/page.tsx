"use client";

import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/solid";

export default function HomePage() {
  return (
    <main className="p-4">
      <Link href="/home">
        <HomeIcon className="w-7 h-7 text-blue-600" />
      </Link>

      <h1 className="text-2xl font-bold mt-4">Home</h1>
    </main>
  );
}
