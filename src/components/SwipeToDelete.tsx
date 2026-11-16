"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type SwipeToDeleteProps = {
  activityId: number;
  activityType: "TRAINING" | "MATCH";
  locked: boolean;
  label: string;
  children: ReactNode;
};

export default function SwipeToDelete({
  activityId,
  activityType,
  label,
  children,
}: SwipeToDeleteProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteActivity() {
    const kind = activityType === "TRAINING" ? "training" : "wedstrijd";
    const confirmed = window.confirm(
      `Weet je zeker dat je deze ${kind} wilt verwijderen?\n\nAlle gekoppelde aanwezigheidsregistraties, wedstrijdstatistieken en tactiekgegevens worden ook verwijderd. Dit kan niet ongedaan worden gemaakt.`
    );
    if (!confirmed || deleting) return;

    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/activities/${activityId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? `${kind} kon niet worden verwijderd.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : `${kind} kon niet worden verwijderd.`);
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-stretch gap-2">
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={deleteActivity}
        disabled={deleting}
        aria-label={`${label} verwijderen`}
        title={`${label} verwijderen`}
        className="flex w-12 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2 text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60 sm:w-16"
      >
        <span aria-hidden="true" className="text-xl">⌫</span>
        <span className="text-[10px] font-bold">{deleting ? "..." : "Verwijder"}</span>
      </button>
      {error && <p role="alert" className="sr-only">{error}</p>}
    </div>
  );
}
