import prisma from "../src/lib/prisma";

type ImportTeam = {
  id: number;
  name: string;
  season?: string | null;
};

type ImportPlayer = {
  id: number;
  name: string;
  teamId: number;
};

type ImportActivity = {
  id: number;
  date: string;
  type: string;
  startTime: string;
  endTime: string;
  opponent?: string | null;
  home?: boolean | null;
  teamId: number;
};

type ImportAttendance = {
  id?: number;
  playerId: number;
  activityId: number;
  present: boolean;
};

type ImportMatchStat = {
  id?: number;
  playerId: number;
  activityId: number;
  goals: number;
  assists: number;
};

/*
 * Pas deze arrays aan wanneer je daadwerkelijk PostgreSQL-data
 * importeert. De structuur sluit bewust exact aan op schema.prisma.
 */

const teams: ImportTeam[] = [];

const players: ImportPlayer[] = [];

const activities: ImportActivity[] = [];

const attendances: ImportAttendance[] = [];

const matchStats: ImportMatchStat[] = [];

async function main() {
  console.log("Start import...");

  for (const team of teams) {
    await prisma.team.upsert({
      where: {
        id: team.id,
      },
      update: {
        name: team.name,
        season: team.season ?? null,
      },
      create: {
        id: team.id,
        name: team.name,
        season: team.season ?? null,
      },
    });
  }

  for (const player of players) {
    await prisma.player.upsert({
      where: {
        id: player.id,
      },
      update: {
        name: player.name,
        teamId: player.teamId,
      },
      create: {
        id: player.id,
        name: player.name,
        teamId: player.teamId,
      },
    });
  }

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: {
        id: activity.id,
      },
      update: {
        date: activity.date,
        type: activity.type,
        startTime: activity.startTime,
        endTime: activity.endTime,
        opponent: activity.opponent ?? null,
        home: activity.home ?? null,
        teamId: activity.teamId,
      },
      create: {
        id: activity.id,
        date: activity.date,
        type: activity.type,
        startTime: activity.startTime,
        endTime: activity.endTime,
        opponent: activity.opponent ?? null,
        home: activity.home ?? null,
        teamId: activity.teamId,
      },
    });
  }

  for (const attendance of attendances) {
    if (attendance.id) {
      await prisma.attendance.upsert({
        where: {
          id: attendance.id,
        },
        update: {
          playerId: attendance.playerId,
          activityId: attendance.activityId,
          present: attendance.present,
        },
        create: {
          id: attendance.id,
          playerId: attendance.playerId,
          activityId: attendance.activityId,
          present: attendance.present,
        },
      });
    } else {
      const existing = await prisma.attendance.findFirst({
        where: {
          playerId: attendance.playerId,
          activityId: attendance.activityId,
        },
      });

      if (existing) {
        await prisma.attendance.update({
          where: {
            id: existing.id,
          },
          data: {
            present: attendance.present,
          },
        });
      } else {
        await prisma.attendance.create({
          data: {
            playerId: attendance.playerId,
            activityId: attendance.activityId,
            present: attendance.present,
          },
        });
      }
    }
  }

  for (const stat of matchStats) {
    await prisma.matchStat.upsert({
      where: {
        playerId_activityId: {
          playerId: stat.playerId,
          activityId: stat.activityId,
        },
      },
      update: {
        goals: stat.goals,
        assists: stat.assists,
      },
      create: {
        playerId: stat.playerId,
        activityId: stat.activityId,
        goals: stat.goals,
        assists: stat.assists,
      },
    });
  }

  console.log("Import afgerond.");
}

main()
  .catch((error) => {
    console.error("Import mislukt:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });