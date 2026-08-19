import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const teamId = Number(params.teamId);

    if (!Number.isInteger(teamId) || teamId <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig team-ID.",
        },
        {
          status: 400,
        }
      );
    }

    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      return NextResponse.json(
        {
          error: "Team niet gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Alleen GESLOTEN trainingen tellen mee.
     */
    const lockedTrainings =
      await prisma.activity.findMany({
        where: {
          teamId,
          type: "TRAINING",
          locked: true,
        },
        select: {
          id: true,
        },
      });

    const lockedTrainingIds = lockedTrainings.map(
      (training) => training.id
    );

    /*
     * Alle spelers van het team.
     */
    const players = await prisma.player.findMany({
      where: {
        teamId,
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
     * Alleen attendance van gelockte trainingen.
     */
    const attendance =
      lockedTrainingIds.length === 0
        ? []
        : await prisma.attendance.findMany({
            where: {
              activityId: {
                in: lockedTrainingIds,
              },
            },
            select: {
              playerId: true,
              activityId: true,
              present: true,
            },
          });

    const stats = players.map((player) => {
      const playerAttendance = attendance.filter(
        (record) =>
          record.playerId === player.id
      );

      const trainingTotal =
        lockedTrainingIds.length;

      const trainingPresent =
        playerAttendance.filter(
          (record) => record.present
        ).length;

      const trainingPercentage =
        trainingTotal === 0
          ? 0
          : Math.round(
              (trainingPresent / trainingTotal) *
                100
            );

      return {
        playerId: player.id,
        name: player.name,
        trainingTotal,
        trainingPresent,
        trainingPercentage,
      };
    });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
      },
      lockedTrainingTotal:
        lockedTrainingIds.length,
      players: stats,
    });
  } catch (error) {
    console.error(
      "Fout bij ophalen trainingsstatistieken:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Trainingsstatistieken konden niet worden opgehaald.",
      },
      {
        status: 500,
      }
    );
  }
}