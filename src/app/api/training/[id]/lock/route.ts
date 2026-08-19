import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    /*
     * Training ophalen.
     */
    const training = await prisma.activity.findFirst({
      where: {
        id: activityId,
        type: "TRAINING",
      },
      include: {
        team: true,
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
     * Al gesloten?
     */
    if (training.locked) {
      return NextResponse.json(
        {
          error: "Deze training is al gesloten.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Alle spelers van het team ophalen.
     */
    const players = await prisma.player.findMany({
      where: {
        teamId: training.teamId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    /*
     * Bestaande attendance-records ophalen.
     */
    const attendance = await prisma.attendance.findMany({
      where: {
        activityId: training.id,
      },
      select: {
        playerId: true,
        present: true,
      },
    });

    /*
     * Iedere speler moet vóór het sluiten een
     * aanwezigheid hebben.
     *
     * Geen record = niet ingevuld.
     */
    const attendanceMap = new Map(
      attendance.map((record) => [
        record.playerId,
        record.present,
      ])
    );

    const missingPlayers = players.filter(
      (player) => !attendanceMap.has(player.id)
    );

    if (missingPlayers.length > 0) {
      return NextResponse.json(
        {
          error:
            "Niet alle spelers hebben een aanwezigheid.",
          missingPlayers: missingPlayers.map(
            (player) => ({
              id: player.id,
              name: player.name,
            })
          ),
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Training definitief sluiten.
     *
     * lockedAt wordt op het daadwerkelijke sluitmoment
     * gezet.
     */
    const lockedAt = new Date();

    const updatedTraining = await prisma.activity.update({
      where: {
        id: training.id,
      },
      data: {
        locked: true,
        lockedAt,
      },
    });

    return NextResponse.json({
      success: true,
      training: updatedTraining,
    });
  } catch (error) {
    console.error("Fout bij sluiten training:", error);

    return NextResponse.json(
      {
        error: "Training kon niet worden gesloten.",
      },
      {
        status: 500,
      }
    );
  }
}