"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Player = {
  id: number;
  name: string;
  teamId: number;
};

type Zone = "FIELD" | "BENCH" | "POOL";

type Position = {
  playerId: number;
  zone: Zone;
  x: number;
  y: number;
  benchSlot: number | null;
};

type DragState = {
  playerId: number;
  pointerId: number;
  clientX: number;
  clientY: number;
};

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 11;
const MAX_BENCH = 2;

function clamp(value: number, min = 3, max = 97) {
  return Math.max(min, Math.min(max, value));
}

function findKeeper(players: Player[]) {
  return players.find((player) => player.name.trim().toLowerCase() === "romy") ?? null;
}

function formationPositions(players: Player[], playerCount: number): Position[] {
  const keeper = findKeeper(players);
  const outfield = players.filter((player) => player.id !== keeper?.id);
  const startersNeeded = Math.max(0, playerCount - (keeper ? 1 : 0));
  const starters = outfield.slice(0, startersNeeded);
  const extras = outfield.slice(startersNeeded);
  const result: Position[] = [];

  if (keeper) {
    result.push({ playerId: keeper.id, zone: "FIELD", x: 50, y: 91, benchSlot: null });
  }

  const rows = Math.max(1, Math.ceil(starters.length / 3));
  starters.forEach((player, index) => {
    const row = Math.floor(index / 3);
    const indexInRow = index % 3;
    const countInRow = Math.min(3, starters.length - row * 3);
    const spacing = countInRow === 1 ? 50 : countInRow === 2 ? 30 : 22;
    const x = countInRow === 1 ? 50 : 50 + (indexInRow - (countInRow - 1) / 2) * spacing;
    const y = 78 - (row * 48) / rows;
    result.push({ playerId: player.id, zone: "FIELD", x: clamp(x), y: clamp(y), benchSlot: null });
  });

  extras.slice(0, MAX_BENCH).forEach((player, index) => {
    result.push({ playerId: player.id, zone: "BENCH", x: index === 0 ? 28 : 72, y: 50, benchSlot: index + 1 });
  });

  extras.slice(MAX_BENCH).forEach((player) => {
    result.push({ playerId: player.id, zone: "POOL", x: 50, y: 50, benchSlot: null });
  });

  return result;
}

function reconcilePositions(players: Player[], saved: Position[], playerCount: number) {
  const playerIds = new Set(players.map((player) => player.id));
  const byId = new Map(saved.filter((position) => playerIds.has(position.playerId)).map((position) => [position.playerId, position]));

  for (const player of players) {
    if (!byId.has(player.id)) {
      byId.set(player.id, { playerId: player.id, zone: "POOL", x: 50, y: 50, benchSlot: null });
    }
  }

  const keeper = findKeeper(players);
  if (keeper) {
    const keeperPosition = byId.get(keeper.id)!;
    keeperPosition.zone = "FIELD";
    keeperPosition.x = 50;
    keeperPosition.y = 91;
    keeperPosition.benchSlot = null;
  }

  const positions = Array.from(byId.values());
  const field = positions.filter((position) => position.zone === "FIELD");
  const nonKeeperField = field.filter((position) => position.playerId !== keeper?.id);
  const maxOutfield = Math.max(0, playerCount - (keeper ? 1 : 0));

  if (nonKeeperField.length > maxOutfield) {
    nonKeeperField.slice(maxOutfield).forEach((position) => {
      position.zone = "POOL";
      position.benchSlot = null;
      position.x = 50;
      position.y = 50;
    });
  } else if (nonKeeperField.length < maxOutfield) {
    const pool = positions.filter((position) => position.zone === "POOL");
    pool.slice(0, maxOutfield - nonKeeperField.length).forEach((position) => {
      position.zone = "FIELD";
      position.benchSlot = null;
      position.x = 50;
      position.y = 50;
    });
  }

  const bench = positions.filter((position) => position.zone === "BENCH");
  bench.forEach((position, index) => {
    if (index < MAX_BENCH) {
      position.benchSlot = index + 1;
      position.x = index === 0 ? 28 : 72;
      position.y = 50;
    } else {
      position.zone = "POOL";
      position.benchSlot = null;
    }
  });

  return Array.from(byId.values());
}

export default function TrainingTacticsBoard({ activityId, players }: { activityId: number; players: Player[] }) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const benchRef = useRef<HTMLDivElement | null>(null);
  const poolRef = useRef<HTMLDivElement | null>(null);
  const [playerCount, setPlayerCount] = useState(8);
  const [positions, setPositions] = useState<Position[]>(() => formationPositions(players, 8));
  const [drag, setDrag] = useState<DragState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const playerMap = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);
  const keeper = useMemo(() => findKeeper(players), [players]);

  useEffect(() => {
    let cancelled = false;
    async function loadTactics() {
      try {
        setLoading(true);
        const response = await fetch(`/api/training/${activityId}/tactics`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error ?? "Tactiek kon niet worden geladen.");
        if (cancelled) return;
        const count = Number.isInteger(data.playerCount) ? data.playerCount : 8;
        setPlayerCount(Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, count)));
        setPositions(reconcilePositions(players, Array.isArray(data.positions) ? data.positions : [], count));
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setPositions(formationPositions(players, 8));
          setMessage(error instanceof Error ? error.message : "Tactiek kon niet worden geladen.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadTactics();
    return () => {
      cancelled = true;
    };
  }, [activityId, players]);

  async function save(nextPositions: Position[], nextPlayerCount = playerCount) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/training/${activityId}/tactics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerCount: nextPlayerCount, positions: nextPositions }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Tactiek kon niet worden opgeslagen.");
      setMessage("Opstelling opgeslagen");
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Tactiek kon niet worden opgeslagen.");
    } finally {
      setSaving(false);
    }
  }

  function updateCount(value: number) {
    const next = reconcilePositions(players, positions, value);
    setPlayerCount(value);
    setPositions(next);
    void save(next, value);
  }

  function resetFormation() {
    const next = formationPositions(players, playerCount);
    setPositions(next);
    void save(next, playerCount);
  }

  function positionForPointer(rect: DOMRect, clientX: number, clientY: number) {
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100),
    };
  }

  function beginDrag(event: React.PointerEvent, playerId: number) {
    if (saving) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ playerId, pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY });
  }

  function moveDrag(event: React.PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    setDrag((current) => current ? { ...current, clientX: event.clientX, clientY: event.clientY } : current);
  }

  function endDrag(event: React.PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dragged = drag.playerId;
    const fieldRect = fieldRef.current?.getBoundingClientRect();
    const benchRect = benchRef.current?.getBoundingClientRect();
    const poolRect = poolRef.current?.getBoundingClientRect();
    const inside = (rect: DOMRect | null | undefined) => Boolean(rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom);
    const source = positions.find((position) => position.playerId === dragged);
    if (!source) {
      setDrag(null);
      return;
    }

    let targetZone: Zone | null = null;
    if (inside(fieldRect)) targetZone = "FIELD";
    else if (inside(benchRect)) targetZone = "BENCH";
    else if (inside(poolRect)) targetZone = "POOL";

    if (!targetZone) {
      setDrag(null);
      return;
    }

    const next = positions.map((position) => ({ ...position }));
    const target = next.find((position) => position.playerId === dragged)!;

    if (targetZone === "FIELD") {
      const currentFieldCount = next.filter((position) => position.zone === "FIELD").length;
      if (source.zone !== "FIELD" && currentFieldCount >= playerCount) {
        setMessage(`Er kunnen maximaal ${playerCount} spelers op het veld staan.`);
        setDrag(null);
        return;
      }
      if (!fieldRect) {
        setDrag(null);
        return;
      }
      const coords = positionForPointer(fieldRect, event.clientX, event.clientY);
      target.zone = "FIELD";
      target.x = coords.x;
      target.y = coords.y;
      target.benchSlot = null;
    } else if (targetZone === "BENCH") {
      if (keeper?.id === dragged) {
        setMessage("Romy blijft als keeper op het veld.");
        setDrag(null);
        return;
      }
      if (!benchRect) {
        setDrag(null);
        return;
      }
      const slot = event.clientX < benchRect.left + benchRect.width / 2 ? 1 : 2;
      const occupant = next.find((position) => position.zone === "BENCH" && position.benchSlot === slot && position.playerId !== dragged);
      if (occupant) {
        if (source.zone === "FIELD" && fieldRect) {
          const coords = positionForPointer(fieldRect, event.clientX, event.clientY);
          occupant.zone = "FIELD";
          occupant.x = coords.x;
          occupant.y = coords.y;
          occupant.benchSlot = null;
        } else {
          setMessage("Deze bankplek is al bezet.");
          setDrag(null);
          return;
        }
      }
      target.zone = "BENCH";
      target.benchSlot = slot;
      target.x = slot === 1 ? 28 : 72;
      target.y = 50;
    } else {
      if (keeper?.id === dragged) {
        setMessage("Romy blijft als keeper op het veld.");
        setDrag(null);
        return;
      }
      target.zone = "POOL";
      target.x = 50;
      target.y = 50;
      target.benchSlot = null;
    }

    setPositions(next);
    setDrag(null);
    void save(next, playerCount);
  }

  function playerPosition(playerId: number) {
    return positions.find((position) => position.playerId === playerId);
  }

  const fieldPlayers = positions.filter((position) => position.zone === "FIELD");
  const benchPlayers = positions.filter((position) => position.zone === "BENCH").sort((a, b) => (a.benchSlot ?? 0) - (b.benchSlot ?? 0));
  const poolPlayers = players.filter((player) => playerPosition(player.id)?.zone === "POOL");

  if (loading) {
    return <div className="app-card mt-8 p-6"><p className="text-sm text-[var(--app-text-muted)]">Tactiek laden...</p></div>;
  }

  return (
    <section className="mt-8">
      <div className="app-card overflow-hidden p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Taktiek &amp; Opstelling</h2>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">Sleep spelers naar het veld, de bank of de lijst met overige spelers.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm">
              <span>Aantal spelers</span>
              <select value={playerCount} onChange={(event) => updateCount(Number(event.target.value))} disabled={saving} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-bold outline-none focus:border-[var(--app-green)]">
                {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, index) => MIN_PLAYERS + index).map((count) => (
                  <option key={count} value={count}>{count} spelers</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={resetFormation} disabled={saving} className="app-button app-button-secondary">↺ Opstelling wissen</button>
          </div>
        </div>

        {message && <div className="mt-4 rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-[var(--app-text-muted)]">{message}{saving ? " …" : ""}</div>}

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div ref={fieldRef} onPointerMove={moveDrag} onPointerUp={endDrag} className="relative aspect-[3/4] w-full touch-none overflow-hidden rounded-2xl border-4 border-white bg-emerald-600 shadow-inner sm:aspect-[4/5]">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_50%,rgba(0,0,0,0.04)_50%,rgba(0,0,0,0.04)_100%)] bg-[length:100%_25%]" />
            <div className="absolute inset-[3%] rounded-sm border-2 border-white/90" />
            <div className="absolute left-[3%] right-[3%] top-1/2 border-t-2 border-white/90" />
            <div className="absolute left-1/2 top-1/2 h-[18%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90" />
            <div className="absolute left-[25%] right-[25%] top-[3%] h-[15%] border-2 border-t-0 border-white/90" />
            <div className="absolute left-[25%] right-[25%] bottom-[3%] h-[15%] border-2 border-b-0 border-white/90" />
            <div className="absolute left-[39%] right-[39%] top-[3%] h-[7%] border-2 border-t-0 border-white/90" />
            <div className="absolute left-[39%] right-[39%] bottom-[3%] h-[7%] border-2 border-b-0 border-white/90" />

            {fieldPlayers.map((position) => {
              const player = playerMap.get(position.playerId);
              if (!player) return null;
              const isKeeper = keeper?.id === player.id;
              return (
                <button
                  key={player.id}
                  type="button"
                  onPointerDown={(event) => beginDrag(event, player.id)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  className={`absolute z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 select-none items-center justify-center rounded-full border-2 border-white px-1 text-center text-[11px] font-bold leading-tight shadow-lg transition-transform hover:scale-105 active:scale-110 sm:h-16 sm:w-16 sm:text-xs ${isKeeper ? "bg-green-500 text-white" : "bg-black text-white"}`}
                  style={{ left: `${position.x}%`, top: `${position.y}%`, touchAction: "none" }}
                >
                  {player.name}
                </button>
              );
            })}

            {drag && <div className={`pointer-events-none fixed z-[100] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white px-1 text-center text-xs font-bold shadow-2xl ${keeper?.id === drag.playerId ? "bg-green-500 text-white" : "bg-black text-white"}`} style={{ left: drag.clientX, top: drag.clientY }}>{playerMap.get(drag.playerId)?.name}</div>}
          </div>

          <aside className="space-y-4">
            <div ref={benchRef} onPointerMove={moveDrag} onPointerUp={endDrag} className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 touch-none">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Wissels</h3>
                <span className="text-sm font-bold text-[var(--app-text-muted)]">{benchPlayers.length}/{MAX_BENCH}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">Sleep maximaal 2 spelers naar de bank.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[1, 2].map((slot) => {
                  const position = benchPlayers.find((item) => item.benchSlot === slot);
                  const player = position ? playerMap.get(position.playerId) : null;
                  return (
                    <div key={slot} className="flex min-h-28 items-center justify-center rounded-xl border border-slate-200 bg-white p-2">
                      {player ? (
                        <button type="button" onPointerDown={(event) => beginDrag(event, player.id)} onPointerMove={moveDrag} onPointerUp={endDrag} className="flex h-14 w-14 select-none items-center justify-center rounded-full border-2 border-white bg-black px-1 text-center text-[10px] font-bold leading-tight text-white shadow-md" style={{ touchAction: "none" }}>{player.name}</button>
                      ) : <span className="text-xs font-semibold text-slate-400">Wissel {slot}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div ref={poolRef} onPointerMove={moveDrag} onPointerUp={endDrag} className="rounded-2xl border border-slate-200 bg-white p-4 touch-none">
              <h3 className="font-bold">Overige spelers</h3>
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">Sleep spelers naar het veld of de bank.</p>
              <div className="mt-3 space-y-2">
                {poolPlayers.length === 0 ? <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-400">Iedereen is ingedeeld.</p> : poolPlayers.map((player) => (
                  <button key={player.id} type="button" onPointerDown={(event) => beginDrag(event, player.id)} onPointerMove={moveDrag} onPointerUp={endDrag} className="flex w-full select-none items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm font-semibold shadow-sm active:scale-[0.99]" style={{ touchAction: "none" }}>
                    <span className="mr-3 h-3 w-3 rounded-full bg-black" />{player.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--app-text-muted)]">
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500" /> Romy = keeper</span>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-black" /> Veldspeler</span>
          <span>{fieldPlayers.length}/{playerCount} spelers op het veld</span>
        </div>
      </div>
    </section>
  );
}
