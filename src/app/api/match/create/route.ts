import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const match = await prisma.activity.create({
    data: {
      type: "MATCH",
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      opponent: body.opponent,
      location: body.location,
      status: "registered",
    },
  });

  return NextResponse.json(match);
}
