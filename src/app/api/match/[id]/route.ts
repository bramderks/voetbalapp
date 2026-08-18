import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const match = await prisma.activity.findUnique({
    where: { id: Number(context.params.id) },
  });

  return NextResponse.json(match);
}
