import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const matches = await prisma.activity.findMany({
      where: { type: "MATCH" },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("GET /api/match/list error:", error);

    return NextResponse.json(
      { error: "Wedstrijden konden niet worden opgehaald." },
      { status: 500 }
    );
  }
}
