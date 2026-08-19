"use client";

import { useState } from "react";

type Props = {
  activityId: number;
  locked: boolean;
};

export default function MatchLockControl({
  activityId,
  locked: initialLocked,
}: Props) {
  const [locked, setLocked] = useState(initialLocked);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function updateLock(nextLocked: boolean) {
    if (saving) {
      return;
    }

    if (nextLocked) {
      const confirmed = window.confirm(
        "Weet je zeker dat je deze wedstrijd wilt sluiten? Na het sluiten kunnen aanwezigheid, goals en assists niet meer worden gewijzigd."
      );

      if (!confirmed) {
        return;
      }
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
          locked: nextLocked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            (nextLocked
              ? "Wedstrijd kon niet worden gesloten."
              : "Wedstrijd kon niet opnieuw worden geopend.")
        );
      }

      setLocked(data.locked);

      setMessage(
        data.locked
          ? "Wedstrijd is gesloten."
          : "Wedstrijd is opnieuw geopend."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Er is iets misgegaan."
      );
    } finally {
      setSaving(false);
    }
  }

  if (locked) {
    return (
      <section className="app-card mt-6 p-6">
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-xl
            "
          >
            🔒
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-[#17211b]">
              Wedstrijd gesloten
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#647067]">
              Deze wedstrijd is afgerond. Aanwezigheid, goals en
              assists kunnen niet meer worden gewijzigd.
            </p>

            {message && (
              <p className="mt-3 text-sm font-semibold text-[#16803c]">
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={() => updateLock(false)}
              disabled={saving}
              className="
                mt-5
                inline-flex
                w-full
                items-center
                justify-center
                rounded-xl
                border
                border-[#e1e7e2]
                bg-white
                px-4
                py-3
                text-sm
                font-bold
                text-[#17211b]
                shadow-sm
                transition
                hover:border-[#16803c]
                hover:text-[#16803c]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Bezig..."
                : "Wedstrijd opnieuw openen"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="app-card mt-6 p-6">
      <div className="flex items-start gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#e9f7ee]
            text-xl
          "
        >
          ✓
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-[#17211b]">
            Wedstrijd afronden
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#647067]">
            Na het sluiten staat de aanwezigheid definitief vast
            en worden goals en assists niet meer gewijzigd.
          </p>

          {message && (
            <p className="mt-3 text-sm font-semibold text-[#16803c]">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={() => updateLock(true)}
            disabled={saving}
            className="
              mt-5
              inline-flex
              w-full
              items-center
              justify-center
              rounded-xl
              bg-[#16803c]
              px-4
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
              ? "Wedstrijd sluiten..."
              : "Wedstrijd sluiten"}
          </button>
        </div>
      </div>
    </section>
  );
}