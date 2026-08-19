"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";

type PlayerStats = {
  playerId: number;
  name: string;
  trainingTotal: number;
  trainingPresent: number;
  matchTotal: number;
  matchPresent: number;
  goals: number;
  assists: number;
};

export default function StatistiekenPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/stats");

        if (!res.ok) {
          throw new Error("Statistieken konden niet worden geladen.");
        }

        const data = await res.json();
        setStats(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Statistieken konden niet worden geladen."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function percentage(present: number, total: number) {
    if (total === 0) {
      return 0;
    }

    return Math.round((present / total) * 100);
  }

  return (
    <main className="app-page">
      <div className="app-container">

        {/* ==================================================
            HEADER
            ================================================== */}
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="transition hover:opacity-80"
            aria-label="Naar Home"
          >
            <TeamBadge />
          </Link>

          <Link
            href="/"
            className="app-button app-button-primary"
          >
            <span aria-hidden="true" className="mr-2 text-base">
              ⌂
            </span>
            Home
          </Link>
        </header>

        {/* ==================================================
            TITEL
            ================================================== */}
        <section className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--app-green)]">
            Teamoverzicht
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--app-text)]">
            Statistieken
          </h1>

          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            Bekijk de aanwezigheid en wedstrijdstatistieken per speler.
          </p>
        </section>

        {/* ==================================================
            INHOUD
            ================================================== */}
        <section className="mt-8">
          {loading ? (
            <div className="app-card p-6">
              <p className="text-sm text-[var(--app-text-muted)]">
                Statistieken laden...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            </div>
          ) : stats.length === 0 ? (
            <div className="app-card p-6">
              <p className="text-sm text-[var(--app-text-muted)]">
                Er zijn nog geen statistieken beschikbaar.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {stats.map((s) => {
                const trainingPercentage = percentage(
                  s.trainingPresent,
                  s.trainingTotal
                );

                const matchPercentage = percentage(
                  s.matchPresent,
                  s.matchTotal
                );

                return (
                  <div
                    key={s.playerId}
                    className="
                      app-card
                      p-5
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-md
                    "
                  >
                    {/* SPELER */}
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <h2 className="text-xl font-bold text-[var(--app-text)]">
                        {s.name}
                      </h2>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-green-light)] text-lg">
                        📊
                      </div>
                    </div>

                    {/* AANWEZIGHEID */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[var(--app-background)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                          Training opkomst
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[var(--app-green)]">
                          {trainingPercentage}%
                        </p>

                        <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                          {s.trainingPresent} van {s.trainingTotal} trainingen
                        </p>
                      </div>

                      <div className="rounded-xl bg-[var(--app-background)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                          Wedstrijd opkomst
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[var(--app-green)]">
                          {matchPercentage}%
                        </p>

                        <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                          {s.matchPresent} van {s.matchTotal} wedstrijden
                        </p>
                      </div>
                    </div>

                    {/* WEDSTRIJDSTATISTIEKEN */}
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[var(--app-border)] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                          Goals
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[var(--app-text)]">
                          {s.goals}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[var(--app-border)] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                          Assists
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[var(--app-text)]">
                          {s.assists}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================================================
            ONDERSTE NAVIGATIE
            ================================================== */}
        <div className="mt-8">
          <Link
            href="/"
            className="app-button app-button-secondary w-full"
          >
            <span aria-hidden="true" className="mr-2">
              ⌂
            </span>
            Terug naar Home
          </Link>
        </div>

      </div>
    </main>
  );
}