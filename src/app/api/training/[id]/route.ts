import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const activityId = Number(params.id);

  if (!Number.isInteger(activityId) || activityId <= 0) {
    return NextResponse.json(
      {
        error: "Ongeldig training-ID.",
      },
      {
        status: 400,
      }
    );
  }

  const training = await prisma.activity.findFirst({
    where: {
      id: activityId,
      type: "TRAINING",
    },
    include: {
      team: true,
      attendance: {
        include: {
          player: true,
        },
      },
    },
  });

  if (!training) {
    return NextResponse.json(
      {
        error: "Training niet gevonden.",
      },
      {
        status: 404,
      }
    );
  }

  /*
   * Alle spelers van het team ophalen.
   *
   * Attendance-records bestaan mogelijk nog niet voor iedere
   * speler. Daarom geven we spelers en attendance afzonderlijk
   * terug.
   */
  const players = await prisma.player.findMany({
    where: {
      teamId: training.teamId,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      teamId: true,
    },
  });

  return NextResponse.json({
    id: training.id,
    type: training.type,
    date: training.date,
    startTime: training.startTime,
    endTime: training.endTime,
    teamId: training.teamId,
    locked: training.locked,
    lockedAt: training.lockedAt,
    team: {
      id: training.team.id,
      name: training.team.name,
    },
    players,
    attendance: training.attendance,
  });
}