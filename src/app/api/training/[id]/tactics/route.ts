import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIN_PLAYERS = 5;
const MAX_PLAYERS = 11;
const MAX_BENCH = 2;
const VALID_ZONES = new Set(["FIELD", "BENCH", "POOL"]);

type PositionInput = {
  playerId: number;
  zone: "FIELD" | "BENCH" | "POOL";
  x: number;
  y: number;
  benchSlot?: number | null;
};

function getActivityId(params: { id: string }) {
  const activityId = Number(params.id);
  return Number.isInteger(activityId) && activityId > 0 ? activityId : null;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

async function getTraining(activityId: number) {
  return prisma.activity.findFirst({
    where: { id: activityId, type: "TRAINING" },
    select: {
      id: true,
      teamId: true,
      tacticPlayerCount: true,
      tactics: {
        select: {
          playerId: true,
          zone: true,
          x: true,
          y: true,
          benchSlot: true,
        },
      },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const activityId = getActivityId(params);

  if (!activityId) {
    return NextResponse.json({ error: "Ongeldig training-ID." }, { status: 400 });
  }

  const training = await getTraining(activityId);
  if (!training) {
    return NextResponse.json({ error: "Training niet gevonden." }, { status: 404 });
  }

  return NextResponse.json({
    playerCount: Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, training.tacticPlayerCount)),
    positions: training.tactics,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = getActivityId(params);
    if (!activityId) {
      return NextResponse.json({ error: "Ongeldig training-ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const playerCount = body?.playerCount;
    const positions = body?.positions;

    if (!Number.isInteger(playerCount) || playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
      return NextResponse.json(
        { error: `Kies een aantal spelers tussen ${MIN_PLAYERS} en ${MAX_PLAYERS}.` },
        { status: 400 }
      );
    }

    if (!Array.isArray(positions)) {
      return NextResponse.json({ error: "Ongeldige tactiekgegevens." }, { status: 400 });
    }

    const training = await getTraining(activityId);
    if (!training) {
      return NextResponse.json({ error: "Training niet gevonden." }, { status: 404 });
    }

    const players = await prisma.player.findMany({
      where: { teamId: training.teamId },
      select: { id: true, name: true },
    });
    const playerMap = new Map(players.map((player) => [player.id, player]));

    const normalized: PositionInput[] = [];
    const seen = new Set<number>();

    for (const raw of positions) {
      if (!Number.isInteger(raw?.playerId) || seen.has(raw.playerId)) continue;
      if (!playerMap.has(raw.playerId)) continue;
      if (!VALID_ZONES.has(raw.zone)) continue;

      const zone = raw.zone as PositionInput["zone"];
      const benchSlot = zone === "BENCH" && Number.isInteger(raw.benchSlot) && raw.benchSlot >= 1 && raw.benchSlot <= MAX_BENCH
        ? raw.benchSlot
        : null;

      normalized.push({
        playerId: raw.playerId,
        zone,
        x: typeof raw.x === "number" && Number.isFinite(raw.x) ? clamp(raw.x) : 50,
        y: typeof raw.y === "number" && Number.isFinite(raw.y) ? clamp(raw.y) : 50,
        benchSlot,
      });
      seen.add(raw.playerId);
    }

    const romy = players.find((player) => player.name.trim().toLowerCase() === "romy");
    if (romy) {
      const romyPosition = normalized.find((position) => position.playerId === romy.id);
      if (!romyPosition || romyPosition.zone !== "FIELD") {
        return NextResponse.json({ error: "Romy moet als keeper op het veld staan." }, { status: 400 });
      }
    }

    const fieldCount = normalized.filter((position) => position.zone === "FIELD").length;
    if (fieldCount > playerCount) {
      return NextResponse.json({ error: `Er mogen maximaal ${playerCount} spelers op het veld staan.` }, { status: 400 });
    }

    const benchPositions = normalized.filter((position) => position.zone === "BENCH");
    if (benchPositions.length > MAX_BENCH) {
      return NextResponse.json({ error: "Er mogen maximaal 2 wissels op de bank staan." }, { status: 400 });
    }

    const usedBenchSlots = new Set<number>();
    for (const position of benchPositions) {
      if (!position.benchSlot || usedBenchSlots.has(position.benchSlot)) {
        return NextResponse.json({ error: "Elke wissel moet een unieke bankplek hebben." }, { status: 400 });
      }
      usedBenchSlots.add(position.benchSlot);
    }

    await prisma.$transaction(async (tx) => {
      await tx.activity.update({
        where: { id: activityId },
        data: { tacticPlayerCount: playerCount },
      });

      await tx.tacticPosition.deleteMany({ where: { activityId } });

      if (normalized.length > 0) {
        await tx.tacticPosition.createMany({
          data: normalized.map((position) => ({
            activityId,
            playerId: position.playerId,
            zone: position.zone,
            x: position.x,
            y: position.y,
            benchSlot: position.benchSlot,
          })),
        });
      }
    });

    return NextResponse.json({
      success: true,
      playerCount,
      positions: normalized,
    });
  } catch (error) {
    console.error("Fout bij opslaan tactiek:", error);
    return NextResponse.json({ error: "Tactiek kon niet worden opgeslagen." }, { status: 500 });
  }
}
