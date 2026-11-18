"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";

type Team = { id: number; name: string; season: string | null };
type Activity = { id: number; date: string; startTime: string; endTime: string; type: "TRAINING" | "MATCH"; opponent?: string | null };

function localDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}
function dateLabel(value: string) {
  return localDate(value).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function TeamDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const teamId = Number(id);
  const [team, setTeam] = useState<Team | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!Number.isInteger(teamId) || teamId <= 0) throw new Error("Ongeldig team.");
        const responses = await Promise.all([
          fetch("/api/teams", { cache: "no-store" }),
          fetch(`/api/training?teamId=${teamId}`, { cache: "no-store" }),
          fetch(`/api/match?teamId=${teamId}`, { cache: "no-store" }),
        ]);
        const values = await Promise.all(responses.map((response) => response.json()));
        const [teams, trainings, matches] = values;
        if (!responses[0].ok) throw new Error(teams?.error ?? "Teams konden niet worden geladen.");
        if (!responses[1].ok) throw new Error(trainings?.error ?? "Trainingen konden niet worden geladen.");
        if (!responses[2].ok) throw new Error(matches?.error ?? "Wedstrijden konden niet worden geladen.");
        const selectedTeam = (Array.isArray(teams) ? teams : []).find((item: Team) => item.id === teamId);
        if (!selectedTeam) throw new Error("Dit team kon niet worden gevonden.");
        const all: Activity[] = [
          ...(Array.isArray(trainings) ? trainings : []).map((item: Omit<Activity, "type">) => ({ ...item, type: "TRAINING" as const })),
          ...(Array.isArray(matches) ? matches : []).map((item: Omit<Activity, "type">) => ({ ...item, type: "MATCH" as const })),
        ];
        if (!cancelled) {
          setTeam(selectedTeam);
          setActivities(all.sort((a, b) => localDate(a.date).getTime() - localDate(b.date).getTime() || a.startTime.localeCompare(b.startTime)));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Teamoverzicht kon niet worden geladen.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [teamId]);

  const { upcoming, recent } = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return {
      upcoming: activities.filter((a) => localDate(a.date) >= today).slice(0, 5),
      recent: activities.filter((a) => localDate(a.date) < today).slice(-3).reverse(),
    };
  }, [activities]);

  const links = [
    { title: "Trainingen", description: "Planning en aanwezigheid", href: `/trainingen?teamId=${teamId}`, icon: "⚽" },
    { title: "Wedstrijden", description: "Wedstrijden en registratie", href: `/wedstrijden?teamId=${teamId}`, icon: "🏆" },
    { title: "Spelers", description: "Beheer je team en spelers", href: `/team/${teamId}/spelers`, icon: "👥" },
    { title: "Statistieken", description: "Opkomst, doelpunten en assists", href: `/team/${teamId}/statistieken`, icon: "📊" },
  ];

  function activityHref(activity: Activity) {
    return activity.type === "TRAINING" ? `/trainingen/${activity.id}` : `/wedstrijden/${activity.id}`;
  }
  function activityTitle(activity: Activity) {
    return activity.type === "TRAINING" ? "Training" : `Wedstrijd ${activity.opponent ? `tegen ${activity.opponent}` : ""}`;
  }

  return (
    <main className="app-page">
      <div className="app-container">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Team kiezen" className="transition hover:opacity-80"><TeamBadge /></Link>
          <Link href="/" className="app-button app-button-secondary">Ander team kiezen</Link>
        </header>
        <section className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--app-green)]">Teamdashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--app-text)]">{team?.name ?? "Teamoverzicht"}</h1>
          {team?.season && <p className="mt-1 text-sm text-[var(--app-text-muted)]">Seizoen {team.season}</p>}
          <p className="mt-3 text-sm text-[var(--app-text-muted)]">Kies een onderdeel of bekijk de eerstvolgende activiteit.</p>
        </section>
        {error && <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-[var(--app-text)]">Teamonderdelen</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {links.map((item) => <Link key={item.title} href={item.href} className="app-card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-green-light)] text-2xl">{item.icon}</span>
              <span className="min-w-0 flex-1"><span className="block font-bold text-[var(--app-text)]">{item.title}</span><span className="mt-1 block text-sm text-[var(--app-text-muted)]">{item.description}</span></span>
              <span className="text-2xl text-[var(--app-green)]">›</span>
            </Link>)}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-[var(--app-text)]">Aankomende activiteiten</h2>
          {loading ? <div className="app-card p-5 text-sm text-[var(--app-text-muted)]">Activiteiten laden...</div> :
            upcoming.length === 0 ? <div className="app-card p-5 text-sm text-[var(--app-text-muted)]">Er staan momenteel geen trainingen of wedstrijden gepland.</div> :
            <div className="grid gap-3">{upcoming.map((activity) => <Link key={`${activity.type}-${activity.id}`} href={activityHref(activity)} className="app-card flex items-center gap-4 p-4 transition hover:shadow-md">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-green-light)] text-xl">{activity.type === "TRAINING" ? "⚽" : "🏆"}</span>
              <span className="min-w-0 flex-1"><span className="block font-semibold capitalize text-[var(--app-text)]">{dateLabel(activity.date)}</span><span className="mt-1 block text-sm text-[var(--app-text-muted)]">{activityTitle(activity)} · {activity.startTime}–{activity.endTime}</span></span>
              <span className="text-xl text-[var(--app-green)]">›</span>
            </Link>)}</div>}
        </section>

        {!loading && recent.length > 0 && <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-[var(--app-text)]">Recent geweest</h2>
          <div className="grid gap-2">{recent.map((activity) => <Link key={`${activity.type}-${activity.id}`} href={activityHref(activity)} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--app-border)] bg-white p-4 transition hover:border-[var(--app-green)]">
            <span><span className="block font-medium capitalize text-[var(--app-text)]">{dateLabel(activity.date)}</span><span className="text-xs text-[var(--app-text-muted)]">{activityTitle(activity)}</span></span><span className="text-sm text-[var(--app-green)]">Bekijken →</span>
          </Link>)}</div>
        </section>}
      </div>
    </main>
  );
}
