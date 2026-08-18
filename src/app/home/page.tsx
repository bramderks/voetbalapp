"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AttendanceItem = {
  present: boolean;
};

export default function Dashboard() {
  const [players, setPlayers] = useState(0);
  const [trainings, setTrainings] = useState(0);
  const [matches, setMatches] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState<number | null>(null);

  async function load() {
    // Spelers
    const pRes = await fetch("/api/players/list");
    const pData = await pRes.json();
    setPlayers(pData.length);

    // Trainingen
    const tRes = await fetch("/api/training/list");
    const tData = await tRes.json();
    setTrainings(tData.length);

    // Wedstrijden
    const mRes = await fetch("/api/match/list").catch(() => null);
    const mData = mRes ? await mRes.json() : [];
    setMatches(mData.length);

    // Opkomstpercentage
    const aRes = await fetch("/api/attendance/all").catch(() => null);
    if (aRes) {
      const aData: AttendanceItem[] = await aRes.json();
      const total = aData.length;
      const present = aData.filter((a) => a.present).length;

      setAttendanceRate(
        total > 0 ? Math.round((present / total) * 100) : null
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">

        <Link href="/spelers">
          <div className="p-6 bg-gray-100 rounded-xl shadow-md hover:bg-gray-200 transition cursor-pointer">
            <p className="text-xl font-semibold text-slate-900">Spelers</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{players}</p>
          </div>
        </Link>

        <Link href="/trainingen">
          <div className="p-6 bg-gray-100 rounded-xl shadow-md hover:bg-gray-200 transition cursor-pointer">
            <p className="text-xl font-semibold text-slate-900">Trainingen</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{trainings}</p>
          </div>
        </Link>

        <Link href="/wedstrijden">
          <div className="p-6 bg-gray-100 rounded-xl shadow-md hover:bg-gray-200 transition cursor-pointer">
            <p className="text-xl font-semibold text-slate-900">Wedstrijden</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{matches}</p>
          </div>
        </Link>

        <Link href="/statistieken">
          <div className="p-6 bg-gray-100 rounded-xl shadow-md hover:bg-gray-200 transition cursor-pointer">
            <p className="text-xl font-semibold text-slate-900">Opkomst</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {attendanceRate !== null ? `${attendanceRate}%` : "—"}
            </p>
          </div>
        </Link>

      </div>
    </main>
  );
}
