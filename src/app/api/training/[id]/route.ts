import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Bepaalt of een activiteit automatisch gesloten moet worden.
 *
 * Een training/wedstrijd wordt 2 dagen na de activiteit
 * definitief vergrendeld.
 *
 * Voorbeeld:
 * activiteit = dinsdag 18 augustus
 * vanaf donderdag 20 augustus = gesloten
 */
function shouldLockActivity(dateString: string): boolean {
  const activityDate = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(activityDate.getTime())) {
    return false;
  }

  const lockDate = new Date(activityDate);
  lockDate.setDate(lockDate.getDate() + 2);
  lockDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today >= lockDate;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig training-ID.",
        },
        {
          status: 400,
        }
      );
    }

    let training = await prisma.activity.findFirst({
      where: {
        id,
        type: "TRAINING",
      },
      include: {
        team: {
          include: {
            players: {
              orderBy: {
                name: "asc",
              },
            },
          },
        },

        attendance: {
          include: {
            player: true,
          },
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },
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
     * AUTOMATISCHE LOCK
     *
     * Zodra de activiteit 2 dagen oud is, wordt deze definitief
     * vergrendeld.
     */
    if (!training.locked && shouldLockActivity(training.date)) {
      training = await prisma.activity.update({
        where: {
          id: training.id,
        },
        data: {
          locked: true,
          lockedAt: new Date(),
        },
        include: {
          team: {
            include: {
              players: {
                orderBy: {
                  name: "asc",
                },
              },
            },
          },

          attendance: {
            include: {
              player: true,
            },
            orderBy: {
              player: {
                name: "asc",
              },
            },
          },
        },
      });
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error(
      "GET /api/training/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Training kon niet worden opgehaald.",
      },
      {
        status: 500,
      }
    );
  }
}