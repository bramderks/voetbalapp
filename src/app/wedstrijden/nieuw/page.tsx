"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";

export default function NieuweWedstrijdPage() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [home, setHome] = useState<"HOME" | "AWAY">("HOME");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!date || !startTime || !endTime || !opponent.trim()) {
      setError("Vul datum, begintijd, eindtijd en tegenstander in.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/match/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          startTime,
          endTime,
          opponent: opponent.trim(),
          home: home === "HOME",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "De wedstrijd kon niet worden aangemaakt."
        );
      }

      window.location.href = "/wedstrijden";
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "De wedstrijd kon niet worden aangemaakt."
      );
      setSaving(false);
    }
  }

  return (
    <main className="app-page">
      <div className="app-container max-w-2xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/wedstrijden" aria-label="Terug naar wedstrijden">
            <TeamBadge />
          </Link>

          <Link href="/wedstrijden" className="app-button app-button-secondary">
            ← Wedstrijden
          </Link>
        </header>

        <section className="mt-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#16803c]">
            Teamplanning
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17211b]">
            Nieuwe wedstrijd
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#647067]">
            Voeg een nieuwe wedstrijd toe aan de planning.
          </p>
        </section>

        <form onSubmit={saveMatch} className="mt-8 app-card p-6">
          <div className="grid gap-5">
            <div>
              <label htmlFor="date" className="mb-2 block text-sm font-bold text-[#17211b]">
                Datum
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-xl border border-[#d6ddd8] bg-white px-4 py-3 text-[#17211b] outline-none transition focus:border-[#16803c]"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="startTime" className="mb-2 block text-sm font-bold text-[#17211b]">
                  Begintijd
                </label>
                <input
                  id="startTime"
                  type="time"
                  required
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="w-full rounded-xl border border-[#d6ddd8] bg-white px-4 py-3 text-[#17211b] outline-none transition focus:border-[#16803c]"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="mb-2 block text-sm font-bold text-[#17211b]">
                  Eindtijd
                </label>
                <input
                  id="endTime"
                  type="time"
                  required
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="w-full rounded-xl border border-[#d6ddd8] bg-white px-4 py-3 text-[#17211b] outline-none transition focus:border-[#16803c]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="opponent" className="mb-2 block text-sm font-bold text-[#17211b]">
                Tegenstander
              </label>
              <input
                id="opponent"
                type="text"
                required
                placeholder="Naam van de tegenstander"
                value={opponent}
                onChange={(event) => setOpponent(event.target.value)}
                className="w-full rounded-xl border border-[#d6ddd8] bg-white px-4 py-3 text-[#17211b] outline-none transition focus:border-[#16803c]"
              />
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-bold text-[#17211b]">
                Waar wordt gespeeld?
              </legend>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHome("HOME")}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    home === "HOME"
                      ? "border-[#16803c] bg-[#e9f7ee] text-[#16803c]"
                      : "border-[#d6ddd8] bg-white text-[#647067]"
                  }`}
                >
                  Thuis
                </button>

                <button
                  type="button"
                  onClick={() => setHome("AWAY")}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    home === "AWAY"
                      ? "border-[#16803c] bg-[#e9f7ee] text-[#16803c]"
                      : "border-[#d6ddd8] bg-white text-[#647067]"
                  }`}
                >
                  Uit
                </button>
              </div>
            </fieldset>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link href="/wedstrijden" className="app-button app-button-secondary flex-1">
                Annuleren
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="app-button app-button-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Opslaan..." : "Wedstrijd aanmaken"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
