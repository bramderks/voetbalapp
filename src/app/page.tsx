"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Team = { id: number; name: string; season: string | null };

export default function TeamSelectPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/teams", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error ?? "Teams konden niet worden geladen.");
        if (!cancelled) setTeams(Array.isArray(result) ? result : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Er ging iets mis.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function chooseTeam(team: Team) {
    window.localStorage.setItem("voetbalapp-team-id", String(team.id));
    window.localStorage.setItem("voetbalapp-team-name", team.name);
    router.push(`/team/${team.id}/statistieken`);
  }

  return (
    <main className="app-page">
      <div className="app-container">
        <section className="mx-auto max-w-xl py-10 sm:py-16">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#e9f7ee] text-4xl">⚽</div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#16803c]">Welkom bij de</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#17211b]">Voetbalapp</h1>
            <p className="mt-3 text-base text-[#647067]">Kies het team waarmee je verder wilt.</p>
          </div>

          {loading && <div className="rounded-2xl border border-[#e1e7e2] bg-white p-6 text-center text-sm text-[#647067]">Teams laden...</div>}
          {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {!loading && !error && teams.length === 0 && <div className="rounded-2xl border border-[#e1e7e2] bg-white p-6 text-center text-sm text-[#647067]">Er zijn nog geen teams aangemaakt.</div>}

          <div className="grid gap-3">
            {teams.map((team) => (
              <button key={team.id} type="button" onClick={() => chooseTeam(team)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-[#e1e7e2] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#16803c] hover:shadow-md">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e9f7ee] text-2xl">🛡️</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-[#17211b]">{team.name}</span>
                  <span className="mt-1 block text-sm text-[#647067]">{team.season ? `Seizoen ${team.season}` : "Teamomgeving"}</span>
                </span>
                <span aria-hidden="true" className="text-2xl font-semibold text-[#16803c] transition group-hover:translate-x-1">›</span>
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[#879188]">Geen account nodig · Selecteer je team om te beginnen</p>
        </section>
      </div>
    </main>
  );
}
