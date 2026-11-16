import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId: teamIdParam } = await params;
    const teamId = Number(teamIdParam);

    if (!Number.isInteger(teamId) || teamId <= 0) return NextResponse.json({ error: "Ongeldig team-ID." }, { status: 400 });

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return NextResponse.json({ error: "Team niet gevonden." }, { status: 404 });

    const [lockedTrainings, lockedMatches, players] = await Promise.all([
      prisma.activity.findMany({ where: { teamId, type: "TRAINING", locked: true }, select: { id: true } }),
      prisma.activity.findMany({ where: { teamId, type: "MATCH", locked: true }, select: { id: true } }),
      prisma.player.findMany({ where: { teamId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);

    const lockedTrainingIds = lockedTrainings.map((training) => training.id);
    const lockedMatchIds = lockedMatches.map((match) => match.id);\n    const activityDetails = await prisma.activity.findMany({\n      where: { teamId, locked: true },\n      include: {\n        attendance: { include: { player: { select: { id: true, name: true } } } },\n        matchStats: { include: { player: { select: { id: true, name: true } } } },\n      },\n      orderBy: [{ date: "asc" }, { startTime: "asc" }],\n    });

    const [trainingAttendance, matchAttendance, matchStats] = await Promise.all([
      lockedTrainingIds.length === 0
        ? Promise.resolve([])
        : prisma.attendance.findMany({ where: { activityId: { in: lockedTrainingIds } }, select: { playerId: true, present: true } }),
      lockedMatchIds.length === 0
        ? Promise.resolve([])
        : prisma.attendance.findMany({ where: { activityId: { in: lockedMatchIds } }, select: { playerId: true, present: true } }),
      lockedMatchIds.length === 0
        ? Promise.resolve([])
        : prisma.matchStat.findMany({ where: { activityId: { in: lockedMatchIds } }, select: { playerId: true, goals: true, assists: true } }),
    ]);

    const trainingPresent = new Map<number, number>();
    const matchPresent = new Map<number, number>();
    const goals = new Map<number, number>();
    const assists = new Map<number, number>();

    for (const record of trainingAttendance) {
      if (record.present) trainingPresent.set(record.playerId, (trainingPresent.get(record.playerId) ?? 0) + 1);
    }
    for (const record of matchAttendance) {
      if (record.present) matchPresent.set(record.playerId, (matchPresent.get(record.playerId) ?? 0) + 1);
    }
    for (const stat of matchStats) {
      goals.set(stat.playerId, (goals.get(stat.playerId) ?? 0) + stat.goals);
      assists.set(stat.playerId, (assists.get(stat.playerId) ?? 0) + stat.assists);
    }

    const stats = players.map((player) => {
      const trainingTotal = lockedTrainingIds.length;
      const playerTrainingPresent = trainingPresent.get(player.id) ?? 0;
      return {
        playerId: player.id,
        name: player.name,
        trainingTotal,
        trainingPresent: playerTrainingPresent,
        trainingPercentage: trainingTotal === 0 ? 0 : Math.round((playerTrainingPresent / trainingTotal) * 100),
        matchTotal: lockedMatchIds.length,
        matchPresent: matchPresent.get(player.id) ?? 0,
        goals: goals.get(player.id) ?? 0,
        assists: assists.get(player.id) ?? 0,
      };
    });

    return NextResponse.json({
      team: { id: team.id, name: team.name },
      lockedTrainingTotal: lockedTrainingIds.length,
      lockedMatchTotal: lockedMatchIds.length,
      players: stats,
      activities: activityDetails.map((activity) => ({
        id: activity.id, type: activity.type, date: activity.date,
        startTime: activity.startTime, endTime: activity.endTime,
        opponent: activity.opponent, home: activity.home,
        scoreFor: activity.scoreFor, scoreAgainst: activity.scoreAgainst,
        attendance: activity.attendance.map((item) => ({ playerId: item.playerId, playerName: item.player.name, present: item.present })),
        matchStats: activity.matchStats.map((item) => ({ playerId: item.playerId, playerName: item.player.name, goals: item.goals, assists: item.assists })),
      })),
    });
  } catch (error) {
    console.error("Fout bij ophalen teamstatistieken:", error);
    return NextResponse.json({ error: "Teamstatistieken konden niet worden opgehaald." }, { status: 500 });
  }
}
