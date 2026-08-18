import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.attendance.findMany();
  return NextResponse.json(rows);
}
