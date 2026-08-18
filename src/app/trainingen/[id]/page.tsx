"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";

type Player = {
  id: number;
  name: string;
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
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  locked: boolean;
  lockedAt: string | null;
  team: {
    id: number;
    name: string;
  };
  attendance: Attendance[];
};

type RouteProps = {
  params: {
    id: string;
  };
};

function formatDate(dateString: string) {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TrainingDetail({ params }: RouteProps) {
  const activityId = Number(params.id);

  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPlayerId, setSavingPlayerId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTraining() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/training/${activityId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Training kon niet worden geladen."
          );
        }

        setTraining(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Training kon niet worden geladen."
        );
      } finally {
        setLoading(false);
      }
    }

    if (Number.isInteger(activityId) && activityId > 0) {
      loadTraining();
    } else {
      setError("Ongeldig training-ID.");
      setLoading(false);
    }
  }, [activityId]);

  const sortedAttendance = useMemo(() => {
    if (!training) return [];

    return [...training.attendance].sort((a, b) =>
      a.player.name.localeCompare(b.player.name, "nl")
    );
  }, [training]);

  const presentCount = sortedAttendance.filter(
    (item) => item.present
  ).length;

  const absentCount = sortedAttendance.length - presentCount;

  async function toggleAttendance(
    playerId: number,
    currentPresent: boolean
  ) {
    if (!training || training.locked) return;

    try {
      setSavingPlayerId(playerId);
      setError("");

      const response = await fetch("/api/attendance/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId: training.id,
          playerId,
          present: !currentPresent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Aanwezigheid kon niet worden opgeslagen."
        );
      }

      setTraining((current) => {
        if (!current) return current;

        return {
          ...current,
          attendance: current.attendance.map((item) =>
            item.playerId === playerId
              ? {
                  ...item,
                  present: data.present,
                }
              : item
          ),
        };
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Aanwezigheid kon niet worden opgeslagen."
      );
    } finally {
      setSavingPlayerId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="mx-auto w-full max-w-2xl">
          <TeamBadge />

          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <p className="text-neutral-400">Training laden...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !training) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center justify-between">
            <TeamBadge />

            <Link
              href="/"
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold transition hover:border-green-400 hover:text-green-400"
            >
              Home
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-red-500/40 bg-red-950/30 p-6">
            <p className="font-semibold text-red-400">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!training) return null;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* HEADER */}
        <header className="flex items-center justify-between">
          <TeamBadge />

          <Link
            href="/"
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold transition hover:border-green-400 hover:text-green-400"
          >
            Home
          </Link>
        </header>

        {/* TRAINING HEADER */}
        <section className="mt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
                Training
              </p>

              <h1 className="mt-2 text-3xl font-bold capitalize">
                {formatDate(training.date)}
              </h1>

              <p className="mt-2 text-lg text-neutral-300">
                {training.startTime} – {training.endTime}
              </p>

              {training.team?.name && (
                <p className="mt-1 text-sm text-neutral-500">
                  {training.team.name}
                </p>
              )}
            </div>

            <div
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                training.locked
                  ? "bg-red-500/15 text-red-400"
                  : "bg-green-500/15 text-green-400"
              }`}
            >
              {training.locked ? "Gesloten" : "Open"}
            </div>
          </div>
        </section>

        {/* LOCK MELDING */}
        {training.locked && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
            <p className="font-semibold text-red-400">
              Deze training is gesloten.
            </p>

            <p className="mt-1 text-sm text-neutral-400">
              De aanwezigheid staat vast en kan niet meer worden gewijzigd.
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* SUMMARY */}
        <section className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-sm text-neutral-400">Aanwezig</p>
            <p className="mt-1 text-3xl font-bold text-green-400">
              {presentCount}
            </p>
          </div>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-neutral-400">Afwezig</p>
            <p className="mt-1 text-3xl font-bold text-red-400">
              {absentCount}
            </p>
          </div>
        </section>

        {/* PLAYERS */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Aanwezigheid</h2>

            <span className="text-sm text-neutral-500">
              {sortedAttendance.length} spelers
            </span>
          </div>

          <div className="space-y-3">
            {sortedAttendance.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <p className="text-neutral-400">
                  Er zijn nog geen spelers aan deze training gekoppeld.
                </p>
              </div>
            ) : (
              sortedAttendance.map((item) => {
                const isSaving = savingPlayerId === item.playerId;

                return (
                  <button
                    key={item.playerId}
                    type="button"
                    disabled={training.locked || isSaving}
                    onClick={() =>
                      toggleAttendance(
                        item.playerId,
                        item.present
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                      item.present
                        ? "border-green-500/40 bg-green-500/10 hover:bg-green-500/15"
                        : "border-neutral-800 bg-neutral-900 hover:border-neutral-600"
                    } ${
                      training.locked
                        ? "cursor-default"
                        : "cursor-pointer"
                    } ${
                      isSaving ? "opacity-60" : ""
                    }`}
                  >
                    <div>
                      <p className="font-semibold">
                        {item.player.name}
                      </p>

                      <p
                        className={`mt-1 text-sm ${
                          item.present
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {item.present ? "Aanwezig" : "Afwezig"}
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg font-bold ${
                        item.present
                          ? "border-green-400 bg-green-500 text-black"
                          : "border-red-500/50 bg-red-500/10 text-red-400"
                      }`}
                    >
                      {item.present ? "✓" : "×"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* NAVIGATIE */}
        <div className="mt-8 flex gap-3">
          <Link
            href="/trainingen"
            className="flex-1 rounded-xl border border-white/20 bg-neutral-900 px-4 py-3 text-center font-semibold transition hover:border-green-400 hover:text-green-400"
          >
            Alle trainingen
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/20 bg-neutral-900 px-5 py-3 text-center font-semibold transition hover:border-green-400 hover:text-green-400"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}