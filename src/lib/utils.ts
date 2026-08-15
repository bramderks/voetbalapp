import { prisma } from '@/lib/prisma';

export async function getDefaultTeam() {
  return prisma.team.findFirst({ include: { players: true } });
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getStatusText(status: string | null) {
  switch (status) {
    case 'registered':
      return 'Geregistreerd';
    case 'not_registered':
      return 'Niet geregistreerd';
    default:
      return 'Geregistreerd';
  }
}

export async function getNextActivity() {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const upcoming = await prisma.activity.findFirst({
    where: {
      date: { gte: todayIso },
    },
    orderBy: { date: 'asc' },
  });

  return upcoming;
}

export async function generateActivities() {
  const startDate = new Date('2026-08-24T00:00:00');
  const trainingDays = [] as string[];
  const matchDays = [] as string[];

  for (let i = 0; i < 24; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i * 7);
    const day = date.getDay();

    if (day === 3) {
      trainingDays.push(date.toISOString().slice(0, 10));
    }

    if (day === 6) {
      matchDays.push(date.toISOString().slice(0, 10));
    }
  }

  for (const date of trainingDays) {
    const exists = await prisma.activity.findFirst({
      where: { date, type: 'TRAINING' },
    });

    if (!exists) {
      await prisma.activity.create({
        data: {
          date,
          type: 'TRAINING',
          startTime: '15:00',
          endTime: '16:00',
          location: 'Sportpark de Burcht',
          status: 'not_registered',
        },
      });
    }
  }

  for (const date of matchDays) {
    const exists = await prisma.activity.findFirst({
      where: { date, type: 'MATCH' },
    });

    if (!exists) {
      await prisma.activity.create({
        data: {
          date,
          type: 'MATCH',
          startTime: '18:30',
          endTime: '19:45',
          opponent: 'Tegenstander TBD',
          location: 'Locatie TBD',
          status: 'not_registered',
        },
      });
    }
  }
}

export async function buildStats() {
  const team = await prisma.team.findFirst({
    include: {
      players: true,
    },
  });

  const activities = await prisma.activity.findMany({
    include: {
      attendances: true,
      matchStats: true,
    },
  });

  const playerRecords = await prisma.player.findMany({
    include: {
      attendances: true,
      matchStats: true,
    },
    where: { teamId: team?.id ?? 1 },
  });

  const goals = activities.reduce((sum, activity) => sum + activity.matchStats.reduce((n, a) => n + a.goals, 0), 0);
  const assists = activities.reduce((sum, activity) => sum + activity.matchStats.reduce((n, a) => n + a.assists, 0), 0);
  const attendanceCount = activities.reduce((sum, activity) => sum + activity.attendances.filter((a) => a.present).length, 0);
  const totalAttendanceSlots = activities.reduce((sum, activity) => sum + activity.attendances.length, 0);
  const attendanceRate = totalAttendanceSlots ? Math.round((attendanceCount / totalAttendanceSlots) * 100) : 0;

  const wins = activities.filter((activity) => activity.type === 'MATCH' && (activity.status ?? '').toLowerCase().includes('win')).length;
  const draws = activities.filter((activity) => activity.type === 'MATCH' && (activity.status ?? '').toLowerCase().includes('draw')).length;
  const losses = activities.filter((activity) => activity.type === 'MATCH' && (activity.status ?? '').toLowerCase().includes('loss')).length;

  return {
    team: {
      attendanceRate,
      goals,
      assists,
      wins,
      draws,
      losses,
    },
    players: playerRecords.map((player) => ({
      id: player.id,
      name: player.name,
      trainingCount: activities.filter((activity) => activity.type === 'TRAINING').length,
      attendanceRate: player.attendances.length ? Math.round((player.attendances.filter((a) => a.present).length / player.attendances.length) * 100) : 0,
      goals: player.matchStats.reduce((sum, stat) => sum + stat.goals, 0),
      assists: player.matchStats.reduce((sum, stat) => sum + stat.assists, 0),
    })),
  };
}
