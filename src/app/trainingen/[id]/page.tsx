"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TeamBadge from "@/components/TeamBadge";
import TrainingLockControl from "@/components/TrainingLockControl";
import TrainingTacticsBoard from "@/components/TrainingTacticsBoard";

type Player = {
  id: number;
  name: string;
  teamId: number;
};

type Attendance = {
  id: number;
  playerId: number;
  activityId: number;
  present: boolean;
  player: Player;
};

type Training = {
  id: number;
  type: "TRAINING";
  date: string;
  startTime: string;
  endTime: string;
  teamId: number;
  locked: boolean;
  lockedAt: string | null;
  team: { id: number; name: string };
  players: Player[];
  attendance: Attendance[];
};

function formatDate(dateString: string) {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatLockedDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrainingDetail({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "tactiek" ? "tactiek" : "aanwezigheid";
  const activityId = Number(params.id);
  const [training, setTraining] = useState<Training | null>(null);
  const [attendance, setAttendance] = useState<Record<number, boolean | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [savingPlayerId, setSavingPlayerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTraining() {
      if (!Number.isInteger(activityId) || activityId <= 0) {
        setError("Ongeldig training-ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/training/${activityId}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error ?? "Training kon niet worden geladen.");

        setTraining(data);
        const map: Record<number, boolean | undefined> = {};
        for (const record of data.attendance ?? []) map[record.playerId] = record.present;
        setAttendance(map);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Training kon niet worden geladen.");
      } finally {
        setLoading(false);
      }
    }

    loadTraining();
  }, [activityId]);

  const presentCount = useMemo(
    () => training?.players.filter((player) => attendance[player.id] === true).length ?? 0,
    [training, attendance]
  );
  const absentCount = useMemo(
    () => training?.players.filter((player) => attendance[player.id] === false).length ?? 0,
    [training, attendance]
  );
  const openCount = useMemo(
    () => training?.players.filter((player) => attendance[player.id] === undefined).length ?? 0,
    [training, attendance]
  );

  async function updateAttendance(playerId: number, present: boolean) {
    if (!training || training.locked) return;

    const previousValue = attendance[playerId];
    setSavingPlayerId(playerId);
    setError(null);
    setAttendance((current) => ({ ...current, [playerId]: present }));

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: training.id, playerId, present }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Aanwezigheid kon niet worden opgeslagen.");
    } catch (err) {
      console.error(err);
      setAttendance((current) => ({ ...current, [playerId]: previousValue }));
      setError(err instanceof Error ? err.message : "Aanwezigheid kon niet worden opgeslagen.");
    } finally {
      setSavingPlayerId(null);
    }
  }

  if (loading) {
    return (
      <main className="app-page">
        <div className="app-container">
          <div className="mx-auto max-w-3xl">
            <TeamBadge />
            <div className="app-card mt-8 p-6">
              <p className="text-sm text-[var(--app-text-muted)]">Training laden...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!training) {
    return (
      <main className="app-page">
        <div className="app-container">
          <div className="mx-auto max-w-5xl">
            <header className="flex items-center justify-between gap-4">
              <Link href="/" className="transition hover:opacity-80"><TeamBadge /></Link>
              <Link href="/" className="app-button app-button-primary"><span className="mr-2">⌂</span>Home</Link>
            </header>
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-700">{error ?? "Training niet gevonden."}</p>
            </div>
            <div className="mt-6"><Link href="/trainingen" className="app-button app-button-secondary">← Alle trainingen</Link></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="app-container">
        <div className="mx-auto max-w-5xl">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="transition hover:opacity-80"><TeamBadge /></Link>
            <Link href="/" className="app-button app-button-primary"><span className="mr-2">⌂</span>Home</Link>
          </header>

          <section className="mt-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-[var(--app-green)]">Training</p>
                <h1 className="mt-2 text-3xl font-bold capitalize tracking-tight">{formatDate(training.date)}</h1>
                <p className="mt-2 text-lg font-medium text-[var(--app-text-muted)]">{training.startTime} – {training.endTime}</p>
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">{training.team.name}</p>
              </div>
              <div>
                {training.locked ? (
                  <div className="rounded-xl bg-red-50 px-4 py-3">
                    <p className="text-sm font-bold uppercase tracking-wide text-red-700">Gesloten</p>
                    {training.lockedAt && <p className="mt-1 text-xs text-red-600">Vastgelegd op {formatLockedDate(training.lockedAt)}</p>}
                  </div>
                ) : (
                  <div className="rounded-xl bg-[var(--app-green-light)] px-4 py-3">
                    <p className="text-sm font-bold uppercase tracking-wide text-[var(--app-green-dark)]">Open</p>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">Aanwezigheid kan worden aangepast</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4"><p className="text-sm font-medium text-red-700">{error}</p></div>}

          <nav className="mt-8 flex overflow-x-auto border-b border-slate-200" aria-label="Training secties">
            <Link href={`/trainingen/${training.id}`} className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-bold transition ${activeTab === "aanwezigheid" ? "border-[var(--app-green)] text-[var(--app-green-dark)]" : "border-transparent text-[var(--app-text-muted)] hover:text-slate-900"}`}>
              Aanwezigheid
            </Link>
            <Link href={`/trainingen/${training.id}?tab=tactiek`} className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-bold transition ${activeTab === "tactiek" ? "border-[var(--app-green)] text-[var(--app-green-dark)]" : "border-transparent text-[var(--app-text-muted)] hover:text-slate-900"}`}>
              Taktiek
            </Link>
          </nav>

          {activeTab === "tactiek" ? (
            <TrainingTacticsBoard activityId={training.id} players={training.players} />
          ) : (
            <>
              <section className="mt-8 grid grid-cols-3 gap-3">
                <div className="app-card p-4"><p className="text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">Spelers</p><p className="mt-1 text-2xl font-bold">{training.players.length}</p></div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Aanwezig</p><p className="mt-1 text-2xl font-bold text-emerald-700">{presentCount}</p></div>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-red-700">Afwezig</p><p className="mt-1 text-2xl font-bold text-red-700">{absentCount}</p></div>
              </section>

              {!training.locked && openCount > 0 && <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3"><p className="text-sm font-medium text-amber-800">{openCount} {openCount === 1 ? "speler heeft" : "spelers hebben"} nog geen aanwezigheid.</p></div>}

              <section className="mt-8">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">Aanwezigheid</h2>
                  <p className="mt-1 text-sm text-[var(--app-text-muted)]">{training.locked ? "Deze training is gesloten. Open de training opnieuw om de aanwezigheid aan te passen." : "Geef per speler aan of deze aanwezig of afwezig was."}</p>
                </div>
                <div className="space-y-3">
                  {training.players.map((player) => {
                    const value = attendance[player.id];
                    const saving = savingPlayerId === player.id;
                    return (
                      <div key={player.id} className="app-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{player.name}</p>
                          {value === true ? <p className="mt-1 text-xs font-medium text-emerald-600">Aanwezig</p> : value === false ? <p className="mt-1 text-xs font-medium text-red-600">Afwezig</p> : <p className="mt-1 text-xs font-medium text-amber-600">Nog niet ingevuld</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:w-[250px]">
                          <button type="button" disabled={training.locked || saving} onClick={() => updateAttendance(player.id, true)} className={`min-h-[46px] rounded-xl border px-4 text-sm font-bold transition ${value === true ? "border-emerald-600 bg-emerald-600 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"} disabled:cursor-not-allowed disabled:opacity-60`}>✓ Aanwezig</button>
                          <button type="button" disabled={training.locked || saving} onClick={() => updateAttendance(player.id, false)} className={`min-h-[46px] rounded-xl border px-4 text-sm font-bold transition ${value === false ? "border-red-600 bg-red-600 text-white" : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"} disabled:cursor-not-allowed disabled:opacity-60`}>✕ Afwezig</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <TrainingLockControl activityId={training.id} locked={training.locked} openCount={openCount} />
            </>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/trainingen" className="app-button app-button-secondary">← Alle trainingen</Link></div>
        </div>
      </div>
    </main>
  );
}
