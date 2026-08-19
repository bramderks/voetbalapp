// src/lib/utils.ts

import prisma from "@/lib/prisma";

type ActivityToCreate = {
  type: "TRAINING" | "MATCH";
  date: string;
  startTime: string;
  endTime: string;
  teamId: number;
  opponent?: string | null;
  home?: boolean | null;
};

const START_DATE = "2026-08-18";
const END_DATE = "2027-05-31";

const TRAINING_START_TIME = "15:00";
const TRAINING_END_TIME = "16:00";

const MATCH_START_TIME = "14:00";
const MATCH_END_TIME = "15:30";

/**
 * Zet een Date om naar YYYY-MM-DD zonder timezone-verschuiving.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Maakt een lokale datum aan.
 */
function createDate(
  year: number,
  month: number,
  day: number
): Date {
  return new Date(year, month - 1, day);
}

/**
 * Genereert alle trainingen en wedstrijden voor het seizoen.
 *
 * Planning:
 *
 * Eerste week:
 * - dinsdag 18 augustus 2026
 * - donderdag 20 augustus 2026
 *
 * Daarna:
 * - iedere woensdag
 * - 15:00 - 16:00
 *
 * Wedstrijden:
 * - iedere zaterdag
 * - 14:00 - 15:30
 *
 * Einddatum:
 * - 31 mei 2027
 *
 * Bestaande activiteiten worden behouden.
 * Alleen ontbrekende activiteiten worden toegevoegd.
 */
export async function generateActivities(): Promise<ActivityToCreate[]> {
  const teams = await prisma.team.findMany({
    orderBy: {
      id: "asc",
    },
  });

  if (teams.length === 0) {
    throw new Error(
      "Er is nog geen team aanwezig. Maak eerst een team aan."
    );
  }

  /*
   * Voorlopig gebruiken we het eerste team.
   *
   * Zodra de teamselectie in de app beschikbaar is, kunnen we
   * deze generator uitbreiden zodat expliciet een teamId wordt
   * meegegeven.
   */
  const team = teams[0];

  const end = createDate(2027, 5, 31);

  const items: ActivityToCreate[] = [];

  /*
   * ----------------------------------------------------------
   * EERSTE WEEK
   * ----------------------------------------------------------
   */

  const firstTrainingDates = [
    createDate(2026, 8, 18), // dinsdag
    createDate(2026, 8, 20), // donderdag
  ];

  for (const date of firstTrainingDates) {
    items.push({
      type: "TRAINING",
      date: formatDate(date),
      startTime: TRAINING_START_TIME,
      endTime: TRAINING_END_TIME,
      teamId: team.id,
      opponent: null,
      home: null,
    });
  }

  /*
   * ----------------------------------------------------------
   * WEKELIJKSE TRAININGEN
   *
   * Iedere woensdag vanaf 26 augustus 2026.
   * ----------------------------------------------------------
   */

  const firstWednesday = createDate(2026, 8, 26);

  for (
    let date = new Date(firstWednesday);
    date <= end;
    date.setDate(date.getDate() + 7)
  ) {
    items.push({
      type: "TRAINING",
      date: formatDate(date),
      startTime: TRAINING_START_TIME,
      endTime: TRAINING_END_TIME,
      teamId: team.id,
      opponent: null,
      home: null,
    });
  }

  /*
   * ----------------------------------------------------------
   * WEDSTRIJDEN
   *
   * Iedere zaterdag vanaf 22 augustus 2026.
   *
   * Tegenstander en thuis/uit blijven leeg totdat de gebruiker
   * ze invult.
   * ----------------------------------------------------------
   */

  const firstSaturday = createDate(2026, 8, 22);

  for (
    let date = new Date(firstSaturday);
    date <= end;
    date.setDate(date.getDate() + 7)
  ) {
    items.push({
      type: "MATCH",
      date: formatDate(date),
      startTime: MATCH_START_TIME,
      endTime: MATCH_END_TIME,
      teamId: team.id,
      opponent: null,
      home: null,
    });
  }

  /*
   * ----------------------------------------------------------
   * BESTAANDE ACTIVITEITEN OPHALEN
   *
   * We verwijderen niets.
   *
   * Als de generator opnieuw wordt uitgevoerd, worden bestaande
   * activiteiten niet gedupliceerd.
   * ----------------------------------------------------------
   */

  const existingActivities = await prisma.activity.findMany({
    where: {
      teamId: team.id,
      date: {
        gte: START_DATE,
        lte: END_DATE,
      },
    },
    select: {
      type: true,
      date: true,
      startTime: true,
      endTime: true,
      teamId: true,
    },
  });

  const existingKeys = new Set(
    existingActivities.map(
      (activity) =>
        `${activity.teamId}|${activity.type}|${activity.date}|${activity.startTime}|${activity.endTime}`
    )
  );

  const missingItems = items.filter((item) => {
    const key = `${item.teamId}|${item.type}|${item.date}|${item.startTime}|${item.endTime}`;

    return !existingKeys.has(key);
  });

  /*
   * ----------------------------------------------------------
   * NIEUWE ACTIVITEITEN AANMAKEN
   * ----------------------------------------------------------
   */

  if (missingItems.length > 0) {
    await prisma.activity.createMany({
      data: missingItems.map((item) => ({
        type: item.type,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        teamId: item.teamId,
        opponent: item.opponent ?? null,
        home: item.home ?? null,
        locked: false,
        lockedAt: null,
      })),
    });
  }

  return missingItems;
}