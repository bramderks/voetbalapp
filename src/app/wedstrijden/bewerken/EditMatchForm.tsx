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
  const [locking, setLocking] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("info");

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
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [activityId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!match || match.locked) {
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
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Wedstrijd kon niet worden opgeslagen."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function changeLockState(locked: boolean) {
    if (!match || locking) {
      return;
    }

    if (locked) {
      const confirmed = window.confirm(
        "Weet je zeker dat je deze wedstrijd wilt sluiten?\n\nNa het sluiten kunnen aanwezigheid, goals en assists niet meer worden gewijzigd.\n\nDe wedstrijd kan later wel weer worden heropend."
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setLocking(true);
      setMessage("");

      const response = await fetch(`/api/match/${activityId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            (locked
              ? "Wedstrijd kon niet worden gesloten."
              : "Wedstrijd kon niet worden heropend.")
        );
      }

      setMatch(data);

      setOpponent(data.opponent ?? "");
      setStartTime(data.startTime);
      setEndTime(data.endTime);
      setHome(data.home ?? true);

      if (locked) {
        setMessage("Wedstrijd gesloten.");
      } else {
        setMessage("Wedstrijd heropend.");
      }

      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : locked
            ? "Wedstrijd kon niet worden gesloten."
            : "Wedstrijd kon niet worden heropend."
      );
      setMessageType("error");
    } finally {
      setLocking(false);
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

        {/* STATUS */}
        <div
          className={
            match.locked
              ? "rounded-xl border border-red-200 bg-red-50 px-4 py-4"
              : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"
          }
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p
                className={
                  match.locked
                    ? "text-sm font-bold text-red-700"
                    : "text-sm font-bold text-emerald-700"
                }
              >
                {match.locked
                  ? "Wedstrijd gesloten"
                  : "Wedstrijd open"}
              </p>

              <p
                className={
                  match.locked
                    ? "mt-1 text-xs text-red-600"
                    : "mt-1 text-xs text-emerald-600"
                }
              >
                {match.locked
                  ? "Aanwezigheid, goals en assists kunnen niet meer worden gewijzigd."
                  : "De wedstrijd kan nog worden bewerkt en geregistreerd."}
              </p>
            </div>

            <span className="shrink-0 text-2xl">
              {match.locked ? "🔒" : "🔓"}
            </span>
          </div>
        </div>

        {/* TEGENSTANDER */}
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
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16803c] focus:ring-2 focus:ring-[#e9f7ee] disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        {/* TIJDEN */}
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16803c] focus:ring-2 focus:ring-[#e9f7ee] disabled:cursor-not-allowed disabled:bg-slate-100"
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16803c] focus:ring-2 focus:ring-[#e9f7ee] disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* THUIS / UIT */}
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
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16803c] focus:ring-2 focus:ring-[#e9f7ee] disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="home">
              Thuiswedstrijd
            </option>

            <option value="away">
              Uitwedstrijd
            </option>
          </select>
        </div>

        {/* MELDING */}
        {message && (
          <div
            className={
              messageType === "success"
                ? "rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                : messageType === "error"
                  ? "rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                  : "rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600"
            }
          >
            {message}
          </div>
        )}

        {/* OPSLAAN */}
        {!match.locked && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || locking}
              className="
                rounded-xl
                bg-[#16803c]
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#116631]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Opslaan..."
                : "Wedstrijd opslaan"}
            </button>
          </div>
        )}

        {/* LOCK / UNLOCK */}
        <div className="border-t border-slate-200 pt-5">
          {match.locked ? (
            <button
              type="button"
              disabled={locking}
              onClick={() => changeLockState(false)}
              className="
                w-full
                rounded-xl
                border
                border-emerald-200
                bg-emerald-50
                px-5
                py-3
                text-sm
                font-bold
                text-emerald-700
                transition
                hover:border-emerald-300
                hover:bg-emerald-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {locking
                ? "Wedstrijd heropenen..."
                : "🔓 Wedstrijd heropenen"}
            </button>
          ) : (
            <button
              type="button"
              disabled={locking || saving}
              onClick={() => changeLockState(true)}
              className="
                w-full
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-5
                py-3
                text-sm
                font-bold
                text-red-600
                transition
                hover:border-red-300
                hover:bg-red-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {locking
                ? "Wedstrijd sluiten..."
                : "🔒 Wedstrijd sluiten"}
            </button>
          )}
        </div>

        {/* LOCK DATUM */}
        {match.locked && match.lockedAt && (
          <p className="text-center text-xs text-slate-400">
            Gesloten op{" "}
            {new Date(match.lockedAt).toLocaleString("nl-NL")}
          </p>
        )}
      </div>
    </form>
  );
}