import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getDateTwoDaysAgo(): string {
  const date = new Date();

  date.setDate(date.getDate() - 2);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    const cutoffDate = getDateTwoDaysAgo();

    const result = await prisma.activity.updateMany({
      where: {
        locked: false,
        date: {
          lte: cutoffDate,
        },
      },
      data: {
        locked: true,
        lockedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      locked: result.count,
      cutoffDate,
    });
  } catch (error) {
    console.error("GET /api/activities/lock error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Activiteiten konden niet worden vergrendeld.",
      },
      {
        status: 500,
      }
    );
  }
}