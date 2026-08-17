"use client";

import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Kies jouw team
      </h1>

      <Link href="/home" className="w-full max-w-sm">
        <div className="p-6 bg-gray-100 rounded-xl shadow-md text-center cursor-pointer hover:bg-gray-200 transition">
          <h2 className="text-xl font-semibold text-slate-900">
            SCE JO8‑1
          </h2>
        </div>
      </Link>
    </main>
  );
}
