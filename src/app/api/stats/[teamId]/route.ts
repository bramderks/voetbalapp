import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


interface Params {
  params: { teamId: string };
}

export async function GET(_req: Request, { params }: Params) {
  const teamId = Number(params.teamId);

  const players = await prisma.player.findMany({
    where: { teamId },
    include: {
      attendance: {
        include: { activity: true },
      },
      matchStats: true,
    },
  });

  const result = players.map((player) => {
    const trainingAttendances = player.attendance.filter(
      (a) => a.activity.type === "TRAINING" && a.present
    ).length;

    const matchAttendances = player.attendance.filter(
      (a) => a.activity.type === "MATCH" && a.present
    ).length;

    const goals = player.matchStats.reduce((sum, m) => sum + m.goals, 0);
    const assists = player.matchStats.reduce((sum, m) => sum + m.assists, 0);

    return {
      id: player.id,
      name: player.name,
      trainingAttendances,
      matchAttendances,
      goals,
      assists,
    };
  });

  return NextResponse.json(result);
}
