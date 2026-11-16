import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};


/**
 * GET
 *
 * Haalt één activiteit volledig op.
 */
export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Ongeldig activiteit-ID." },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        team: true,

        attendance: {
          include: {
            player: true,
          },
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },

        matchStats: {
          include: {
            player: true,
          },
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activiteit niet gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("GET /api/activities/[id] error:", error);

    return NextResponse.json(
      { error: "Activiteit kon niet worden opgehaald." },
      { status: 500 }
    );
  }
}


/**
 * DELETE
 *
 * Verwijdert een activiteit inclusief gekoppelde aanwezigheid,
 * wedstrijdstatistieken en tactiek (cascade via de relaties).
 */
export async function DELETE(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Ongeldig activiteit-ID." },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activiteit niet gevonden." },
        { status: 404 }
      );
    }


    await prisma.$transaction(async (tx) => {
      await tx.attendance.deleteMany({ where: { activityId: id } });
      await tx.matchStat.deleteMany({ where: { activityId: id } });
      await tx.tacticPosition.deleteMany({ where: { activityId: id } });
      await tx.activity.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/activities/[id] error:", error);

    return NextResponse.json(
      { error: "Activiteit kon niet worden verwijderd." },
      { status: 500 }
    );
  }
}