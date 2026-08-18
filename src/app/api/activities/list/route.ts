import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const teamIdParam = searchParams.get("teamId");
    const typeParam = searchParams.get("type");

    const teamId = teamIdParam ? Number(teamIdParam) : null;

    if (
      teamIdParam &&
      (!Number.isInteger(teamId) || (teamId as number) <= 0)
    ) {
      return NextResponse.json(
        { error: "Ongeldig teamId." },
        { status: 400 }
      );
    }

    let type: string | undefined;

    if (typeParam) {
      type = typeParam.toUpperCase();

      if (type !== "TRAINING" && type !== "MATCH") {
        return NextResponse.json(
          { error: "Type moet TRAINING of MATCH zijn." },
          { status: 400 }
        );
      }
    }

    const activities = await prisma.activity.findMany({
      where: {
        ...(teamId ? { teamId } : {}),
        ...(type ? { type } : {}),
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

    return NextResponse.json(activities);
  } catch (error) {
    console.error("GET /api/activities/list error:", error);

    return NextResponse.json(
      { error: "Activiteiten konden niet worden opgehaald." },
      { status: 500 }
    );
  }
}