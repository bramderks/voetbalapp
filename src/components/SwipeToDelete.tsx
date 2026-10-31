"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
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
  locked,
  label,
  children,
}: SwipeToDeleteProps) {
  const router = useRouter();
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (locked || deleting || (event.pointerType === "mouse" && event.button !== 0)) return;
    startX.current = event.clientX;
    startY.current = event.clientY;
    suppressClick.current = false;
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (startX.current === null || startY.current === null) return;
    const dx = event.clientX - startX.current;
    const dy = event.clientY - startY.current;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx < -55) {
        setRevealed(true);
        suppressClick.current = true;
      } else if (dx > 55) {
        setRevealed(false);
      }
    }
    startX.current = null;
    startY.current = null;
  }

  async function deleteActivity() {
    const kind = activityType === "TRAINING" ? "training" : "wedstrijd";
    const confirmed = window.confirm(
      `Weet je zeker dat je deze ${kind} wilt verwijderen?\\n\\nAlle gekoppelde aanwezigheidsregistraties, statistieken en tactiekgegevens worden ook verwijderd. Dit kan niet ongedaan worden gemaakt.`
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
      setRevealed(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {!locked && (
        <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-red-600">
          <button
            type="button"
            onClick={deleteActivity}
            disabled={deleting}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-sm font-bold text-white disabled:opacity-60"
            aria-label={`${label} verwijderen`}
          >
            <span className="text-2xl leading-none" aria-hidden="true">⌫</span>
            <span>{deleting ? "..." : "Verwijder"}</span>
          </button>
        </div>
      )}
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { startX.current = null; startY.current = null; }}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
        className="relative rounded-2xl transition-transform duration-200 ease-out"
        style={{
          transform: revealed && !locked ? "translateX(-96px)" : "translateX(0)",
          touchAction: "pan-y",
        }}
      >
        {children}
      </div>
      {error && (
        <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
