import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * ==========================================================
 * GET
 * ==========================================================
 *
 * Wedstrijd ophalen.
 *
 * GET wijzigt NOOIT de wedstrijd.
 * De actuele locked-status komt rechtstreeks uit de database.
 */
export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig wedstrijd-ID.",
        },
        {
          status: 400,
        }
      );
    }

    const match = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
    });

    if (!match || match.type !== "MATCH") {
      return NextResponse.json(
        {
          error: "Wedstrijd niet gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("GET /api/match/[id] error:", error);

    return NextResponse.json(
      {
        error: "Wedstrijd kon niet worden opgehaald.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ==========================================================
 * PATCH
 * ==========================================================
 *
 * Deze route kent bewust drie afzonderlijke acties:
 *
 * 1. { locked: true }
 *    → wedstrijd sluiten
 *
 * 2. { locked: false }
 *    → wedstrijd expliciet heropenen
 *
 * 3. wedstrijdgegevens
 *    → alleen opponent, startTime, endTime en home wijzigen
 *
 * BELANGRIJK:
 * Een normale gegevenswijziging raakt de velden locked en
 * lockedAt NOOIT.
 */
export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig wedstrijd-ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const match = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
    });

    if (!match || match.type !== "MATCH") {
      return NextResponse.json(
        {
          error: "Wedstrijd niet gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ========================================================
     * EXPLICIET SLUITEN
     * ========================================================
     */

    if (body.locked === true) {
      const lockedMatch = await prisma.activity.update({
        where: {
          id: activityId,
        },
        data: {
          locked: true,
          lockedAt: new Date(),
        },
      });

      return NextResponse.json(lockedMatch);
    }

    /*
     * ========================================================
     * EXPLICIET HEROPENEN
     * ========================================================
     *
     * Dit is de ENIGE manier waarop locked weer false wordt.
     */

    if (body.locked === false) {
      const reopenedMatch = await prisma.activity.update({
        where: {
          id: activityId,
        },
        data: {
          locked: false,
          lockedAt: null,
        },
      });

      return NextResponse.json(reopenedMatch);
    }

    /*
     * ========================================================
     * NORMALE WEDSTRIJDGEGEVENS
     * ========================================================
     *
     * Een gesloten wedstrijd mag hier niet worden aangepast.
     */

    if (match.locked) {
      return NextResponse.json(
        {
          error:
            "Deze wedstrijd is gesloten en kan niet meer worden gewijzigd. Heropen de wedstrijd eerst.",
        },
        {
          status: 409,
        }
      );
    }

    const opponent =
      typeof body.opponent === "string"
        ? body.opponent.trim() || null
        : match.opponent;

    const startTime =
      typeof body.startTime === "string" &&
      body.startTime.trim()
        ? body.startTime.trim()
        : match.startTime;

    const endTime =
      typeof body.endTime === "string" &&
      body.endTime.trim()
        ? body.endTime.trim()
        : match.endTime;

    const home =
      typeof body.home === "boolean"
        ? body.home
        : match.home;

    if (!startTime || !endTime) {
      return NextResponse.json(
        {
          error: "Begintijd en eindtijd zijn verplicht.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * LET OP:
     *
     * locked en lockedAt staan hier bewust NIET in.
     *
     * Daardoor blijft de bestaande lockstatus intact.
     */

    const updatedMatch = await prisma.activity.update({
      where: {
        id: activityId,
      },
      data: {
        opponent,
        startTime,
        endTime,
        home,
      },
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("PATCH /api/match/[id] error:", error);

    return NextResponse.json(
      {
        error: "Wedstrijd kon niet worden opgeslagen.",
      },
      {
        status: 500,
      }
    );
  }
}