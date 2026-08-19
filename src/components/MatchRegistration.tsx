"use client";

import { useState } from "react";

type AttendanceItem = {
  id: number;
  playerId: number;
  playerName: string;
  present: boolean;
};

type MatchStatItem = {
  id: number;
  playerId: number;
  goals: number;
  assists: number;
};

type Props = {
  activityId: number;
  locked: boolean;
  attendance: AttendanceItem[];
  matchStats: MatchStatItem[];
};

type SaveState = "idle" | "saving" | "saved" | "error";

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    if (!response.ok) {
      throw new Error(
        `Opslaan mislukt (${response.status}).`
      );
    }

    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Ongeldige serverrespons (${response.status}).`
    );
  }
}

export default function MatchRegistration({
  activityId,
  locked,
  attendance: initialAttendance,
  matchStats: initialMatchStats,
}: Props) {
  const [attendance, setAttendance] =
    useState<AttendanceItem[]>(initialAttendance);

  const [matchStats, setMatchStats] =
    useState<MatchStatItem[]>(initialMatchStats);

  const [saveStates, setSaveStates] =
    useState<Record<string, SaveState>>({});

  function setSaving(key: string) {
    setSaveStates((current) => ({
      ...current,
      [key]: "saving",
    }));
  }

  function setSaved(key: string) {
    setSaveStates((current) => ({
      ...current,
      [key]: "saved",
    }));

    window.setTimeout(() => {
      setSaveStates((current) => ({
        ...current,
        [key]: "idle",
      }));
    }, 1500);
  }

  function setError(key: string) {
    setSaveStates((current) => ({
      ...current,
      [key]: "error",
    }));
  }

  async function updateAttendance(
    playerId: number,
    present: boolean
  ) {
    if (locked) {
      return;
    }

    const key = `attendance-${playerId}`;

    setSaving(key);

    try {
      const response = await fetch(
        "/api/attendance/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activityId,
            playerId,
            present,
          }),
        }
      );

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Aanwezigheid kon niet worden opgeslagen."
        );
      }

      setAttendance((current) =>
        current.map((item) =>
          item.playerId === playerId
            ? {
                ...item,
                present,
                id: data?.id ?? item.id,
              }
            : item
        )
      );

      setSaved(key);
    } catch (error) {
      console.error(
        "Aanwezigheid opslaan mislukt:",
        error
      );

      setError(key);
    }
  }

  function getMatchStat(
    playerId: number
  ): MatchStatItem {
    return (
      matchStats.find(
        (item) => item.playerId === playerId
      ) ?? {
        id: 0,
        playerId,
        goals: 0,
        assists: 0,
      }
    );
  }

  async function updateMatchStat(
    playerId: number,
    goals: number,
    assists: number
  ) {
    if (locked) {
      return;
    }

    const key = `stats-${playerId}`;

    const safeGoals = Math.max(
      0,
      Math.floor(goals)
    );

    const safeAssists = Math.max(
      0,
      Math.floor(assists)
    );

    setSaving(key);

    try {
      const response = await fetch(
        "/api/match-stats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activityId,
            playerId,
            goals: safeGoals,
            assists: safeAssists,
          }),
        }
      );

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Wedstrijdstatistieken konden niet worden opgeslagen."
        );
      }

      if (!data) {
        throw new Error(
          "De server heeft geen wedstrijdstatistiek teruggegeven."
        );
      }

      setMatchStats((current) => {
        const exists = current.some(
          (item) =>
            item.playerId === playerId
        );

        if (exists) {
          return current.map((item) =>
            item.playerId === playerId
              ? {
                  ...item,
                  id: data.id ?? item.id,
                  goals: safeGoals,
                  assists: safeAssists,
                }
              : item
          );
        }

        return [
          ...current,
          {
            id: data.id,
            playerId,
            goals: safeGoals,
            assists: safeAssists,
          },
        ];
      });

      setSaved(key);
    } catch (error) {
      console.error(
        "Wedstrijdstatistieken opslaan mislukt:",
        error
      );

      setError(key);
    }
  }

  function changeGoals(
    playerId: number,
    amount: number
  ) {
    if (locked) {
      return;
    }

    const stats = getMatchStat(playerId);

    updateMatchStat(
      playerId,
      Math.max(
        0,
        stats.goals + amount
      ),
      stats.assists
    );
  }

  function changeAssists(
    playerId: number,
    amount: number
  ) {
    if (locked) {
      return;
    }

    const stats = getMatchStat(playerId);

    updateMatchStat(
      playerId,
      stats.goals,
      Math.max(
        0,
        stats.assists + amount
      )
    );
  }

  if (attendance.length === 0) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#647067]">
          Er zijn nog geen spelers beschikbaar
          voor deze wedstrijd.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">

      {/* TABELKOP */}

      <div
        className="
          min-w-[620px]
          grid
          grid-cols-[minmax(180px,1fr)_150px_145px_145px]
          items-center
          gap-3
          border-b
          border-[#e1e7e2]
          bg-[#f5f7f5]
          px-6
          py-3
          text-xs
          font-bold
          uppercase
          tracking-wide
          text-[#647067]
        "
      >
        <span>Speler</span>

        <span className="text-center">
          Aanwezig
        </span>

        <span className="text-center">
          Goals
        </span>

        <span className="text-center">
          Assists
        </span>
      </div>

      {/* SPELERS */}

      <div className="min-w-[620px]">
        {attendance.map((player) => {
          const stats = getMatchStat(
            player.playerId
          );

          const attendanceKey =
            `attendance-${player.playerId}`;

          const statsKey =
            `stats-${player.playerId}`;

          const attendanceState =
            saveStates[attendanceKey] ??
            "idle";

          const statsState =
            saveStates[statsKey] ??
            "idle";

          const saving =
            attendanceState === "saving" ||
            statsState === "saving";

          return (
            <div
              key={player.playerId}
              className="
                grid
                grid-cols-[minmax(180px,1fr)_150px_145px_145px]
                items-center
                gap-3
                border-b
                border-[#e1e7e2]
                px-6
                py-4
                last:border-b-0
              "
            >
              {/* SPELER */}

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#17211b]">
                  {player.playerName}
                </p>

                {(
                  attendanceState === "saved" ||
                  statsState === "saved"
                ) && (
                  <p className="mt-1 text-xs font-medium text-[#16803c]">
                    Opgeslagen
                  </p>
                )}

                {(
                  attendanceState === "error" ||
                  statsState === "error"
                ) && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Opslaan mislukt
                  </p>
                )}
              </div>

              {/* AANWEZIGHEID */}

              <div className="flex justify-center">
                <button
                  type="button"
                  disabled={
                    locked || saving
                  }
                  onClick={() =>
                    updateAttendance(
                      player.playerId,
                      !player.present
                    )
                  }
                  className={`
                    inline-flex
                    min-w-[120px]
                    items-center
                    justify-center
                    rounded-xl
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    ${
                      player.present
                        ? "bg-[#e9f7ee] text-[#16803c] hover:bg-[#16803c] hover:text-white"
                        : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                    }
                  `}
                >
                  {player.present
                    ? "Aanwezig"
                    : "Afwezig"}
                </button>
              </div>

              {/* GOALS */}

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={
                    locked ||
                    saving ||
                    stats.goals <= 0
                  }
                  onClick={() =>
                    changeGoals(
                      player.playerId,
                      -1
                    )
                  }
                  aria-label={`Goal verwijderen voor ${player.playerName}`}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#e1e7e2]
                    bg-white
                    text-lg
                    font-bold
                    text-[#647067]
                    transition
                    hover:border-red-300
                    hover:bg-red-50
                    hover:text-red-600
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  −
                </button>

                <span
                  className="
                    flex
                    h-9
                    min-w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#f5f7f5]
                    px-2
                    text-sm
                    font-bold
                    text-[#17211b]
                  "
                >
                  {stats.goals}
                </span>

                <button
                  type="button"
                  disabled={
                    locked || saving
                  }
                  onClick={() =>
                    changeGoals(
                      player.playerId,
                      1
                    )
                  }
                  aria-label={`Goal toevoegen voor ${player.playerName}`}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#16803c]
                    text-lg
                    font-bold
                    text-white
                    transition
                    hover:bg-[#116631]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  +
                </button>
              </div>

              {/* ASSISTS */}

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={
                    locked ||
                    saving ||
                    stats.assists <= 0
                  }
                  onClick={() =>
                    changeAssists(
                      player.playerId,
                      -1
                    )
                  }
                  aria-label={`Assist verwijderen voor ${player.playerName}`}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#e1e7e2]
                    bg-white
                    text-lg
                    font-bold
                    text-[#647067]
                    transition
                    hover:border-red-300
                    hover:bg-red-50
                    hover:text-red-600
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  −
                </button>

                <span
                  className="
                    flex
                    h-9
                    min-w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#f5f7f5]
                    px-2
                    text-sm
                    font-bold
                    text-[#17211b]
                  "
                >
                  {stats.assists}
                </span>

                <button
                  type="button"
                  disabled={
                    locked || saving
                  }
                  onClick={() =>
                    changeAssists(
                      player.playerId,
                      1
                    )
                  }
                  aria-label={`Assist toevoegen voor ${player.playerName}`}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#16803c]
                    text-lg
                    font-bold
                    text-white
                    transition
                    hover:bg-[#116631]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* GESLOTEN */}

      {locked && (
        <div
          className="
            border-t
            border-[#e1e7e2]
            bg-red-50
            px-6
            py-4
          "
        >
          <p className="text-sm font-semibold text-red-600">
            Deze wedstrijd is gesloten.
            Aanwezigheid, goals en assists
            kunnen niet meer worden gewijzigd.
          </p>
        </div>
      )}
    </div>
  );
}