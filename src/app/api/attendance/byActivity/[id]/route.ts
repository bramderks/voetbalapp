import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const rows = await prisma.attendance.findMany({
    where: { activityId: Number(context.params.id) },
  });

  return NextResponse.json(rows);
}
