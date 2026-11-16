"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";

type Player = { playerId: number; name: string; trainingTotal: number; trainingPresent: number; matchTotal: number; matchPresent: number; goals: number; assists: number };
type Attendance = { playerId: number; playerName: string; present: boolean };
type MatchStat = { playerId: number; playerName: string; goals: number; assists: number };
type Activity = { id: number; type: "TRAINING" | "MATCH"; date: string; startTime: string; endTime: string; opponent: string | null; home: boolean | null; scoreFor: number | null; scoreAgainst: number | null; attendance: Attendance[]; matchStats: MatchStat[] };
type Detail = { team: { id: number; name: string }; players: Player[]; activities: Activity[] };

function dateLabel(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

export default function StatistiekenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const teamId = Number(id);
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/stats/${teamId}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error ?? "Statistieken konden niet worden geladen.");
        if (!cancelled) setData(result as Detail);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Er ging iets mis.");
      }
    }
    if (Number.isInteger(teamId) && teamId > 0) load();
    else setError("Ongeldig team.");
    return () => { cancelled = true; };
  }, [teamId]);

  const activities = useMemo(() => data?.activities ?? [], [data]);
  const toggle = (key: string) => setOpen((current) => current === key ? null : key);

  return (
    <main className="app-page">
      <div className="app-container">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Team kiezen"><TeamBadge /></Link>
          <Link href="/" className="app-button app-button-primary">Team kiezen</Link>
        </header>
        <section className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--app-green)]">{data?.team.name ?? "Teamoverzicht"}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--app-text)]">Statistieken</h1>
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">Tik op een percentage of statistiek om de onderliggende trainingen en wedstrijden te bekijken.</p>
        </section>

        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {!data && !error && <div className="app-card mt-6 p-5">Statistieken laden...</div>}

        {data && <section className="mt-6 grid gap-4">
          {data.players.map((player) => {
            const trainingPct = player.trainingTotal ? Math.round(player.trainingPresent / player.trainingTotal * 100) : 0;
            const matchPct = player.matchTotal ? Math.round(player.matchPresent / player.matchTotal * 100) : 0;
            const sections = [
              { key: "training", label: "Training opkomst", value: `${trainingPct}%`, sub: `${player.trainingPresent} van ${player.trainingTotal} trainingen` },
              { key: "match", label: "Wedstrijd opkomst", value: `${matchPct}%`, sub: `${player.matchPresent} van ${player.matchTotal} wedstrijden` },
              { key: "goals", label: "Doelpunten", value: String(player.goals), sub: "Bekijk per wedstrijd" },
              { key: "assists", label: "Assists", value: String(player.assists), sub: "Bekijk per wedstrijd" },
            ];
            return <article key={player.playerId} className="app-card p-5">
              <h2 className="mb-4 text-xl font-bold text-[var(--app-text)]">{player.name}</h2>
              <div className="grid grid-cols-2 gap-3">
                {sections.map((section) => {
                  const key = `${player.playerId}:${section.key}`;
                  const expanded = open === key;
                  return <button key={section.key} type="button" onClick={() => toggle(key)} aria-expanded={expanded}
                    className={`rounded-xl border p-4 text-left transition ${expanded ? "border-[var(--app-green)] bg-[var(--app-green-light)]" : "border-[var(--app-border)] bg-[var(--app-background)] hover:border-[var(--app-green)]"}`}>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">{section.label}</span>
                    <span className="mt-1 block text-2xl font-bold text-[var(--app-green)]">{section.value}</span>
                    <span className="mt-1 block text-xs text-[var(--app-text-muted)]">{section.sub}</span>
                    <span className="mt-2 block text-xs font-semibold text-[var(--app-green)]">{expanded ? "Verberg details ▲" : "Bekijk details ▼"}</span>
                  </button>;
                })}
              </div>
              {sections.filter((section) => open === `${player.playerId}:${section.key}`).map((section) => {
                const relevant = activities.filter((activity) => section.key === "training" ? activity.type === "TRAINING" : activity.type === "MATCH");
                return <div key={section.key} className="mt-4 border-t border-[var(--app-border)] pt-4">
                  <h3 className="mb-3 font-bold text-[var(--app-text)]">{section.label} — {player.name}</h3>
                  {relevant.length === 0 ? <p className="text-sm text-[var(--app-text-muted)]">Nog geen afgesloten activiteiten.</p> : <ul className="grid gap-2">
                    {relevant.map((activity) => {
                      const attendance = activity.attendance.find((item) => item.playerId === player.playerId);
                      const stat = activity.matchStats.find((item) => item.playerId === player.playerId);
                      const attendanceLabel = attendance ? attendance.present ? "Aanwezig" : "Afwezig" : "Niet geregistreerd";
                      const statOnly = section.key === "goals" || section.key === "assists";
                      const statValue = section.key === "goals" ? stat?.goals ?? 0 : stat?.assists ?? 0;
                      return <li key={activity.id}>
                        <Link href={activity.type === "TRAINING" ? `/trainingen/${activity.id}` : `/wedstrijden/${activity.id}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-[var(--app-background)] p-3 transition hover:bg-[var(--app-green-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-green)]">
                          <div className="min-w-0">
                            <p className="font-semibold capitalize text-[var(--app-text)]">{dateLabel(activity.date)}</p>
                            <p className="text-xs text-[var(--app-text-muted)]">{activity.type === "TRAINING" ? "Training" : `Wedstrijd ${activity.opponent ? `tegen ${activity.opponent}` : ""}`} · {activity.startTime}</p>
                            {activity.type === "MATCH" && activity.scoreFor !== null && activity.scoreAgainst !== null && <p className="text-xs text-[var(--app-text-muted)]">Uitslag {activity.scoreFor}–{activity.scoreAgainst}</p>}
                            <span className="mt-2 block text-xs font-semibold text-[var(--app-green)]">Open {activity.type === "TRAINING" ? "training" : "wedstrijd"} →</span>
                          </div>
                          <span className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold ${statOnly ? "bg-white text-[var(--app-green)]" : attendance?.present ? "bg-green-100 text-green-800" : attendance ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{statOnly ? statValue : attendanceLabel}</span>
                        </Link>
                      </li>;
                    })}
                  </ul>}
                </div>;
              })}
            </article>;
          })}
        </section>}
        <div className="mt-8"><Link href="/" className="app-button app-button-secondary w-full">Ander team kiezen</Link></div>
      </div>
    </main>
  );
}
