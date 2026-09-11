import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json({ error: "Ongeldig wedstrijd-ID." }, { status: 400 });
    }

    const match = await prisma.activity.findUnique({ where: { id: activityId } });

    if (!match || match.type !== "MATCH") {
      return NextResponse.json({ error: "Wedstrijd niet gevonden." }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("GET /api/match/[id] error:", error);
    return NextResponse.json({ error: "Wedstrijd kon niet worden opgehaald." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json({ error: "Ongeldig wedstrijd-ID." }, { status: 400 });
    }

    const body = await request.json();
    const match = await prisma.activity.findUnique({ where: { id: activityId } });

    if (!match || match.type !== "MATCH") {
      return NextResponse.json({ error: "Wedstrijd niet gevonden." }, { status: 404 });
    }

    if (body.locked === true) {
      const currentScoreFor = match.scoreFor;
      const currentScoreAgainst = match.scoreAgainst;

      if (
        currentScoreFor === null ||
        currentScoreAgainst === null ||
        !Number.isInteger(currentScoreFor) ||
        currentScoreFor < 0 ||
        !Number.isInteger(currentScoreAgainst) ||
        currentScoreAgainst < 0
      ) {
        return NextResponse.json(
          { error: "Vul eerst de volledige uitslag in voordat je de wedstrijd sluit." },
          { status: 400 }
        );
      }

      const lockedMatch = await prisma.activity.update({
        where: { id: activityId },
        data: { locked: true, lockedAt: new Date() },
      });

      return NextResponse.json(lockedMatch);
    }

    if (body.locked === false) {
      const reopenedMatch = await prisma.activity.update({
        where: { id: activityId },
        data: { locked: false, lockedAt: null },
      });

      return NextResponse.json(reopenedMatch);
    }

    if (match.locked) {
      return NextResponse.json(
        { error: "Deze wedstrijd is gesloten en kan niet meer worden gewijzigd. Heropen de wedstrijd eerst." },
        { status: 409 }
      );
    }

    const opponent =
      typeof body.opponent === "string" ? body.opponent.trim() || null : match.opponent;
    const startTime =
      typeof body.startTime === "string" && body.startTime.trim() ? body.startTime.trim() : match.startTime;
    const endTime =
      typeof body.endTime === "string" && body.endTime.trim() ? body.endTime.trim() : match.endTime;
    const home = typeof body.home === "boolean" ? body.home : match.home;

    const scoreFor =
      body.scoreFor === null || body.scoreFor === undefined
        ? match.scoreFor
        : Number(body.scoreFor);
    const scoreAgainst =
      body.scoreAgainst === null || body.scoreAgainst === undefined
        ? match.scoreAgainst
        : Number(body.scoreAgainst);

    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Begintijd en eindtijd zijn verplicht." }, { status: 400 });
    }

    if (endTime <= startTime) {
      return NextResponse.json({ error: "De eindtijd moet na de begintijd liggen." }, { status: 400 });
    }

    if (scoreFor !== null && (!Number.isInteger(scoreFor) || scoreFor < 0)) {
      return NextResponse.json({ error: "De score van SCE moet een geheel getal van 0 of hoger zijn." }, { status: 400 });
    }

    if (scoreAgainst !== null && (!Number.isInteger(scoreAgainst) || scoreAgainst < 0)) {
      return NextResponse.json({ error: "De score van de tegenstander moet een geheel getal van 0 of hoger zijn." }, { status: 400 });
    }

    const updatedMatch = await prisma.activity.update({
      where: { id: activityId },
      data: { opponent, startTime, endTime, home, scoreFor, scoreAgainst },
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("PATCH /api/match/[id] error:", error);
    return NextResponse.json({ error: "Wedstrijd kon niet worden opgeslagen." }, { status: 500 });
  }
}
