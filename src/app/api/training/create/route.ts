import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function POST(req: Request) {
  const { date, startTime, endTime } = await req.json();

  const t = await prisma.activity.create({
    data: {
      date,
      startTime,
      endTime,
      type: "TRAINING",
    },
  });

  return NextResponse.json(t);
}
