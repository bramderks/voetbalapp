import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getActivityId(params: { id: string }) {
  const activityId = Number(params.id);

  if (!Number.isInteger(activityId) || activityId <= 0) {
    return null;
  }

  return activityId;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const activityId = getActivityId(params);

  if (!activityId) {
    return NextResponse.json(
      { error: "Ongeldig training-ID." },
      { status: 400 }
    );
  }

  const training = await prisma.activity.findFirst({
    where: {
      id: activityId,
      type: "TRAINING",
    },
    include: {
      team: true,
      attendance: {
        include: {
          player: true,
        },
      },
    },
  });

  if (!training) {
    return NextResponse.json(
      { error: "Training niet gevonden." },
      { status: 404 }
    );
  }

  const players = await prisma.player.findMany({
    where: {
      teamId: training.teamId,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      teamId: true,
    },
  });

  return NextResponse.json({
    id: training.id,
    type: training.type,
    date: training.date,
    startTime: training.startTime,
    endTime: training.endTime,
    teamId: training.teamId,
    locked: training.locked,
    lockedAt: training.lockedAt,
    team: {
      id: training.team.id,
      name: training.team.name,
    },
    players,
    attendance: training.attendance,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = getActivityId(params);

    if (!activityId) {
      return NextResponse.json(
        { error: "Ongeldig training-ID." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const locked = body?.locked;

    if (typeof locked !== "boolean") {
      return NextResponse.json(
        { error: "Geef een geldige lockstatus op." },
        { status: 400 }
      );
    }

    const training = await prisma.activity.findFirst({
      where: {
        id: activityId,
        type: "TRAINING",
      },
      select: {
        id: true,
        locked: true,
      },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Training niet gevonden." },
        { status: 404 }
      );
    }

    const updatedTraining = await prisma.activity.update({
      where: {
        id: training.id,
      },
      data: {
        locked,
        lockedAt: locked ? new Date() : null,
      },
      select: {
        id: true,
        locked: true,
        lockedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      ...updatedTraining,
    });
  } catch (error) {
    console.error("Fout bij wijzigen trainingstatus:", error);

    return NextResponse.json(
      { error: "Trainingstatus kon niet worden gewijzigd." },
      { status: 500 }
    );
  }
}
