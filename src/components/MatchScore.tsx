"use client";

import { useState } from "react";

type Props = {
  activityId: number;
  locked: boolean;
  scoreFor: number | null;
  scoreAgainst: number | null;
};

export default function MatchScore({
  activityId,
  locked,
  scoreFor: initialScoreFor,
  scoreAgainst: initialScoreAgainst,
}: Props) {
  const [scoreFor, setScoreFor] = useState<string>(
    initialScoreFor === null ? "" : String(initialScoreFor)
  );
  const [scoreAgainst, setScoreAgainst] = useState<string>(
    initialScoreAgainst === null ? "" : String(initialScoreAgainst)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function saveScore() {
    if (locked || saving) return;

    const homeScore = Number(scoreFor);
    const opponentScore = Number(scoreAgainst);

    if (
      !Number.isInteger(homeScore) ||
      homeScore < 0 ||
      !Number.isInteger(opponentScore) ||
      opponentScore < 0
    ) {
      setError(true);
      setMessage("Vul beide scores in. Een score mag 0 zijn.");
      return;
    }

    try {
      setSaving(true);
      setError(false);
      setMessage("");

      const response = await fetch(`/api/match/${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreFor: homeScore,
          scoreAgainst: opponentScore,
        }),
      });

      const text = await response.text();
      let data: { error?: string } | null = null;

      if (text) {
        try {
          data = JSON.parse(text) as { error?: string };
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        throw new Error(data?.error || "Uitslag kon niet worden opgeslagen.");
      }

      setScoreFor(String(homeScore));
      setScoreAgainst(String(opponentScore));
      setMessage("Uitslag opgeslagen.");
    } catch (saveError) {
      setError(true);
      setMessage(
        saveError instanceof Error
          ? saveError.message
          : "Uitslag kon niet worden opgeslagen."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-b border-[#e1e7e2] p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#17211b]">Uitslag</h2>
          <p className="mt-1 text-sm leading-6 text-[#647067]">
            Leg de eindstand vast. De uitslag is verplicht voordat de wedstrijd kan worden gesloten.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#647067]">
              SCE
            </span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={scoreFor}
              onChange={(event) => setScoreFor(event.target.value)}
              disabled={locked || saving}
              aria-label="Score SCE"
              className="h-12 w-20 rounded-xl border border-[#e1e7e2] bg-white px-3 text-center text-lg font-bold text-[#17211b] outline-none transition focus:border-[#16803c] focus:ring-2 focus:ring-[#16803c]/15 disabled:cursor-not-allowed disabled:bg-[#f5f7f5]"
            />
          </label>

          <span className="pb-2 text-xl font-bold text-[#647067]">–</span>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#647067]">
              Tegenstander
            </span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={scoreAgainst}
              onChange={(event) => setScoreAgainst(event.target.value)}
              disabled={locked || saving}
              aria-label="Score tegenstander"
              className="h-12 w-20 rounded-xl border border-[#e1e7e2] bg-white px-3 text-center text-lg font-bold text-[#17211b] outline-none transition focus:border-[#16803c] focus:ring-2 focus:ring-[#16803c]/15 disabled:cursor-not-allowed disabled:bg-[#f5f7f5]"
            />
          </label>

          <button
            type="button"
            onClick={saveScore}
            disabled={locked || saving}
            className="h-12 rounded-xl bg-[#16803c] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#116631] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      </div>

      {message && (
        <p className={`mt-3 text-sm font-semibold ${error ? "text-red-600" : "text-[#16803c]"}`}>
          {message}
        </p>
      )}

      {locked && (
        <p className="mt-3 text-sm font-semibold text-[#647067]">
          Deze uitslag is definitief zolang de wedstrijd gesloten is.
        </p>
      )}
    </div>
  );
}
