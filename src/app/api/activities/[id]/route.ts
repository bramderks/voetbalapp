import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";


export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const activity = await prisma.activity.findUnique({
    where: { id },
  });

  return NextResponse.json(activity);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.activity.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
