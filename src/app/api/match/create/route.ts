import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function POST(req: Request) {
  const { date, startTime, endTime, opponent, location } = await req.json();

  const m = await prisma.activity.create({
    data: {
      date,
      startTime,
      endTime,
      opponent,
      location,
      type: "MATCH",
    },
  });

  return NextResponse.json(m);
}
