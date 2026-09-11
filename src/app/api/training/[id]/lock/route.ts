import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json({ error: "Ongeldig training-ID." }, { status: 400 });
    }

    const training = await prisma.activity.findFirst({
      where: { id: activityId, type: "TRAINING" },
    });

    if (!training) return NextResponse.json({ error: "Training niet gevonden." }, { status: 404 });
    if (training.locked) return NextResponse.json({ error: "Deze training is al gesloten." }, { status: 409 });

    const players = await prisma.player.findMany({
      where: { teamId: training.teamId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const attendance = await prisma.attendance.findMany({
      where: { activityId: training.id },
      select: { playerId: true, present: true },
    });

    const attendanceMap = new Map(attendance.map((record) => [record.playerId, record.present]));
    const missingPlayers = players.filter((player) => !attendanceMap.has(player.id));

    if (missingPlayers.length > 0) {
      return NextResponse.json(
        {
          error: "Niet alle spelers hebben een aanwezigheid.",
          missingPlayers: missingPlayers.map((player) => ({ id: player.id, name: player.name })),
        },
        { status: 400 }
      );
    }

    const updatedTraining = await prisma.activity.update({
      where: { id: training.id },
      data: { locked: true, lockedAt: new Date() },
    });

    return NextResponse.json({ success: true, training: updatedTraining });
  } catch (error) {
    console.error("Fout bij sluiten training:", error);
    return NextResponse.json({ error: "Training kon niet worden gesloten." }, { status: 500 });
  }
}
