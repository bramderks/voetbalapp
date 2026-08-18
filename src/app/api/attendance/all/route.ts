import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const activityIdParam = searchParams.get("activityId");
    const playerIdParam = searchParams.get("playerId");

    const activityId = activityIdParam
      ? Number(activityIdParam)
      : undefined;

    const playerId = playerIdParam
      ? Number(playerIdParam)
      : undefined;

    if (
      activityId !== undefined &&
      (!Number.isInteger(activityId) || activityId <= 0)
    ) {
      return NextResponse.json(
        { error: "Ongeldig activityId." },
        { status: 400 }
      );
    }

    if (
      playerId !== undefined &&
      (!Number.isInteger(playerId) || playerId <= 0)
    ) {
      return NextResponse.json(
        { error: "Ongeldig playerId." },
        { status: 400 }
      );
    }

    const rows = await prisma.attendance.findMany({
      where: {
        ...(activityId !== undefined ? { activityId } : {}),
        ...(playerId !== undefined ? { playerId } : {}),
      },
      include: {
        player: true,
        activity: true,
      },
      orderBy: [
        {
          activity: {
            date: "asc",
          },
        },
        {
          player: {
            name: "asc",
          },
        },
      ],
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/attendance/all error:", error);

    return NextResponse.json(
      {
        error: "Aanwezigheid kon niet worden opgehaald.",
      },
      { status: 500 }
    );
  }
}