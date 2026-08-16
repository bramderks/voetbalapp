import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = Number(searchParams.get("teamId"));

  const trainings = await prisma.activity.findMany({
    where: { type: "TRAINING" },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(trainings);
}

export async function POST(req: Request) {
  const body = await req.json();

  const training = await prisma.activity.create({
    data: {
      type: "TRAINING",
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      status: "registered",
    },
  });

  return NextResponse.json(training);
}
