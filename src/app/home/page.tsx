"use client";

import Link from "next/link";
import { HomeIcon, PlusIcon, UsersIcon, ChartBarIcon } from "@heroicons/react/24/solid";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { TrophyIcon } from "@heroicons/react/24/solid";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Top bar: home (disabled here) + title */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <HomeIcon className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-slate-900">SCE JO8‑1</span>
        </div>
      </header>

      {/* Grid met blokken */}
      <section className="p-4">
        <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
          <Link href="/trainingen">
            <div className="p-6 bg-gray-100 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 transition flex flex-col items-center gap-2">
              <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
              <span className="font-semibold text-slate-900">Trainingen</span>
            </div>
          </Link>

          <Link href="/wedstrijden">
            <div className="p-6 bg-gray-100 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 transition flex flex-col items-center gap-2">
              <TrophyIcon className="w-8 h-8 text-blue-600" />
              <span className="font-semibold text-slate-900">Wedstrijden</span>
            </div>
          </Link>

          <Link href="/stats">
            <div className="p-6 bg-gray-100 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 transition flex flex-col items-center gap-2">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
              <span className="font-semibold text-slate-900">Statistieken</span>
            </div>
          </Link>

          <Link href="/players">
            <div className="p-6 bg-gray-100 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 transition flex flex-col items-center gap-2">
              <UsersIcon className="w-8 h-8 text-blue-600" />
              <span className="font-semibold text-slate-900">Spelers</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
