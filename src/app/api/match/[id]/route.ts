import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  const match = await prisma.activity.findUnique({
    where: { id: Number(params.id) },
    include: { matchStats: true },
  });

  return NextResponse.json(match);
}
