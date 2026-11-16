"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteActivityButtonProps = {
  activityId: number;
  activityType: "TRAINING" | "MATCH";
  label?: string;
};

export default function DeleteActivityButton({
  activityId,
  activityType,
  label,
}: DeleteActivityButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    const kind = activityType === "TRAINING" ? "training" : "wedstrijd";
    if (!window.confirm(`Weet je zeker dat je deze ${kind} wilt verwijderen? Alle gekoppelde aanwezigheid, statistieken en tactiekgegevens worden ook verwijderd. Dit kan niet ongedaan worden gemaakt.`)) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/activities/${activityId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? `${kind} kon niet worden verwijderd.`);
      router.push(activityType === "TRAINING" ? "/trainingen" : "/wedstrijden");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verwijderen is niet gelukt.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={remove} disabled={deleting}
        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">
        {deleting ? "Verwijderen..." : label ?? (activityType === "TRAINING" ? "Training verwijderen" : "Wedstrijd verwijderen")}
      </button>
      {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}
