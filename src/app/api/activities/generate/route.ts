import { NextResponse } from "next/server";
import { generateActivities } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const created = await generateActivities();

    return NextResponse.json({
      ok: true,
      created: created.length,
      activities: created,
    });
  } catch (error) {
    console.error(
      "GET /api/activities/generate error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Activiteiten konden niet worden gegenereerd.",
      },
      {
        status: 500,
      }
    );
  }
}