import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  const training = await prisma.activity.findUnique({
    where: { id: Number(params.id) },
    include: { attendances: true },
  });

  return NextResponse.json(training);
}
