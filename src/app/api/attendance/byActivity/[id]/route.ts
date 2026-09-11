import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json({ error: "Ongeldig activiteit-ID." }, { status: 400 });
    }

    const rows = await prisma.attendance.findMany({
      where: { activityId },
      orderBy: { player: { name: "asc" } },
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/attendance/byActivity/[id] error:", error);
    return NextResponse.json({ error: "Aanwezigheid kon niet worden opgehaald." }, { status: 500 });
  }
}
