import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("GET /api/teams error:", error);

    return NextResponse.json(
      { error: "Teams konden niet worden opgehaald." },
      { status: 500 }
    );
  }
}
