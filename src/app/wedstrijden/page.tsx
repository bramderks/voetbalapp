"use client";

import Link from "next/link";
import { HomeIcon, PlusIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function WedstrijdenPage() {
  const [wedstrijden, setWedstrijden] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/match/list");
      const data = await res.json();
      setWedstrijden(data);
    }
    load();
  }, []);

  function isLocked(dateString) {
    const d = new Date(dateString);
    const now = new Date();
    return now > new Date(d.getTime() + 24 * 60 * 60 * 1000);
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link href="/home">
          <HomeIcon className="w-7 h-7 text-blue-600 cursor-pointer" />
        </Link>

        <Link href="/wedstrijden/nieuw">
          <button className="p-2 bg-blue-600 text-white rounded-full shadow-md">
            <PlusIcon className="w-6 h-6" />
          </button>
        </Link>
      </header>

      <section className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Wedstrijden</h1>

        <div className="flex flex-col gap-4">
          {wedstrijden.map((w) => (
            <Link key={w.id} href={`/wedstrijden/${w.id}`}>
              <div className="p-4 bg-gray-100 rounded-xl shadow-md hover:bg-gray-200 transition cursor-pointer flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-900">{w.date}</p>
                  <p className="text-sm text-slate-600">
                    {w.opponent || "Tegenstander onbekend"}
                  </p>
                </div>

                {isLocked(w.date) && (
                  <LockClosedIcon className="w-6 h-6 text-red-600" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
