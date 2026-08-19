import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const activityId = Number(body.activityId);
    const playerId = Number(body.playerId);
    const present = body.present;

    if (
      !Number.isInteger(activityId) ||
      activityId <= 0 ||
      !Number.isInteger(playerId) ||
      playerId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Ongeldige training of speler.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof present !== "boolean") {
      return NextResponse.json(
        {
          error: "Aanwezigheid moet aanwezig of afwezig zijn.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Training controleren.
     */
    const training = await prisma.activity.findFirst({
      where: {
        id: activityId,
        type: "TRAINING",
      },
    });

    if (!training) {
      return NextResponse.json(
        {
          error: "Training niet gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Gesloten trainingen mogen niet meer worden gewijzigd.
     */
    if (training.locked) {
      return NextResponse.json(
        {
          error:
            "Deze training is gesloten. De aanwezigheid kan niet meer worden gewijzigd.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Speler controleren.
     *
     * Een speler mag alleen aanwezigheid krijgen voor een
     * training van zijn eigen team.
     */
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        teamId: training.teamId,
      },
    });

    if (!player) {
      return NextResponse.json(
        {
          error:
            "Deze speler hoort niet bij het team van deze training.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Omdat activityId + playerId momenteel geen samengestelde
     * unique key in Prisma is, zoeken we het bestaande record
     * op en werken we het daarna bij.
     */
    const existing = await prisma.attendance.findFirst({
      where: {
        activityId,
        playerId,
      },
    });

    if (existing) {
      const updated = await prisma.attendance.update({
        where: {
          id: existing.id,
        },
        data: {
          present,
        },
        include: {
          player: true,
        },
      });

      return NextResponse.json(updated);
    }

    const created = await prisma.attendance.create({
      data: {
        activityId,
        playerId,
        present,
      },
      include: {
        player: true,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Fout bij opslaan aanwezigheid:", error);

    return NextResponse.json(
      {
        error: "Aanwezigheid kon niet worden opgeslagen.",
      },
      {
        status: 500,
      }
    );
  }
}