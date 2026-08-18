import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get("teamId");

    let teamId: number | undefined;

    if (teamIdParam) {
      const parsedTeamId = Number(teamIdParam);

      if (!Number.isInteger(parsedTeamId) || parsedTeamId <= 0) {
        return NextResponse.json(
          { error: "Ongeldig teamId." },
          { status: 400 }
        );
      }

      teamId = parsedTeamId;
    }

    const trainings = await prisma.activity.findMany({
      where: {
        type: "TRAINING",
        ...(teamId !== undefined ? { teamId } : {}),
      },
      orderBy: [
        {
          date: "asc",
        },
        {
          startTime: "asc",
        },
      ],
      include: {
        team: true,
      },
    });

    return NextResponse.json(trainings);
  } catch (error) {
    console.error("GET /api/training/list error:", error);

    return NextResponse.json(
      { error: "Trainingen konden niet worden opgehaald." },
      { status: 500 }
    );
  }
}