"use client";

import { FormEvent, useEffect, useState } from "react";

type Match = {
  id: number;
  teamId: number;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  opponent: string | null;
  home: boolean | null;
  locked: boolean;
  lockedAt: string | null;
};

type Props = {
  activityId: number;
};

export default function EditMatchForm({ activityId }: Props) {
  const [match, setMatch] = useState<Match | null>(null);

  const [opponent, setOpponent] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [home, setHome] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMatch() {
      try {
        setLoading(true);
        setMessage("");

        const response = await fetch(`/api/match/${activityId}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Wedstrijd kon niet worden geladen."
          );
        }

        const loadedMatch: Match = data;

        setMatch(loadedMatch);
        setOpponent(loadedMatch.opponent ?? "");
        setStartTime(loadedMatch.startTime);
        setEndTime(loadedMatch.endTime);
        setHome(loadedMatch.home ?? true);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Wedstrijd kon niet worden geladen."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [activityId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!match) {
      return;
    }

    if (match.locked) {
      setMessage(
        "Deze wedstrijd is gesloten en kan niet meer worden gewijzigd."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(`/api/match/${activityId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opponent,
          startTime,
          endTime,
          home,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Wedstrijd kon niet worden opgeslagen."
        );
      }

      setMatch(data);
      setOpponent(data.opponent ?? "");
      setStartTime(data.startTime);
      setEndTime(data.endTime);
      setHome(data.home ?? true);

      setMessage("Wedstrijd opgeslagen.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Wedstrijd kon niet worden opgeslagen."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Wedstrijd laden...
        </p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">
          {message || "Wedstrijd kon niet worden geladen."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5">
        <div>
          <label
            htmlFor="opponent"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Tegenstander
          </label>

          <input
            id="opponent"
            name="opponent"
            value={opponent}
            onChange={(event) => setOpponent(event.target.value)}
            placeholder="Tegenstander"
            disabled={match.locked}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="startTime"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Begintijd
            </label>

            <input
              id="startTime"
              name="startTime"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              disabled={match.locked}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Eindtijd
            </label>

            <input
              id="endTime"
              name="endTime"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              disabled={match.locked}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="home"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Wedstrijd
          </label>

          <select
            id="home"
            value={home ? "home" : "away"}
            onChange={(event) =>
              setHome(event.target.value === "home")
            }
            disabled={match.locked}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="home">
              Thuiswedstrijd
            </option>

            <option value="away">
              Uitwedstrijd
            </option>
          </select>
        </div>

        {match.locked && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Deze wedstrijd is gesloten en kan niet meer worden gewijzigd.
          </div>
        )}

        {message && (
          <p
            className={
              message === "Wedstrijd opgeslagen."
                ? "text-sm text-emerald-600"
                : "text-sm text-red-600"
            }
          >
            {message}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || match.locked}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Opslaan..." : "Wedstrijd opslaan"}
          </button>
        </div>
      </div>
    </form>
  );
}