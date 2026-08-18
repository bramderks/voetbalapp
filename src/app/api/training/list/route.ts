import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const trainings = await prisma.activity.findMany({
    where: { type: "training" },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(trainings);
}
