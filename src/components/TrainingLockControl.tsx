"use client";

import { useState } from "react";

type Props = {
  activityId: number;
  locked: boolean;
  openCount: number;
};

export default function TrainingLockControl({
  activityId,
  locked: initialLocked,
  openCount,
}: Props) {
  const [locked, setLocked] = useState(initialLocked);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function updateLock(nextLocked: boolean) {
    if (saving) return;

    if (nextLocked && openCount > 0) {
      setMessage(
        `Vul eerst alle ${openCount} openstaande spelers in voordat je de training sluit.`
      );
      return;
    }

    const confirmed = window.confirm(
      nextLocked
        ? "Weet je zeker dat je deze training wilt sluiten? Daarna kan de aanwezigheid niet meer worden gewijzigd."
        : "Wil je deze training opnieuw openen? Daarna kun je de aanwezigheid weer aanpassen."
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(`/api/training/${activityId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locked: nextLocked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            (nextLocked
              ? "Training kon niet worden gesloten."
              : "Training kon niet opnieuw worden geopend.")
        );
      }

      setLocked(data.locked);
      setMessage(
        data.locked
          ? "Training is gesloten."
          : "Training is opnieuw geopend. Je kunt de aanwezigheid weer aanpassen."
      );

      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Er is iets misgegaan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 app-card p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-green-light)] text-xl">
          {locked ? "🔒" : "✓"}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">
            {locked ? "Training gesloten" : "Training afronden"}
          </h2>

          <p className="mt-1 text-sm text-[var(--app-text-muted)]">
            {locked
              ? "Open deze training opnieuw om de aanwezigheid weer te kunnen aanpassen."
              : "Sluit de training wanneer alle aanwezigheid definitief is ingevuld."}
          </p>

          {message && (
            <p className="mt-3 text-sm font-semibold text-[var(--app-green-dark)]">
              {message}
            </p>
          )}

          {!locked && openCount > 0 && (
            <p className="mt-3 text-sm font-medium text-amber-700">
              Vul eerst alle {openCount} openstaande spelers in.
            </p>
          )}

          <button
            type="button"
            onClick={() => updateLock(!locked)}
            disabled={saving || (!locked && openCount > 0)}
            className="
              mt-5
              inline-flex
              min-h-[46px]
              w-full
              items-center
              justify-center
              rounded-xl
              bg-[var(--app-green)]
              px-5
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-[var(--app-green-dark)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {saving
              ? "Bezig..."
              : locked
                ? "🔓 Training opnieuw openen"
                : "🔒 Training sluiten"}
          </button>
        </div>
      </div>
    </section>
  );
}
