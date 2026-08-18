import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
  const matches = await prisma.activity.findMany({
    where: { type: "MATCH" },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(matches);
}

export async function POST(request: Request) {
  const body = await request.json();

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
