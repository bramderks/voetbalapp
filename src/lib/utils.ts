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

  const trainings = activities.filter((a) => a.type === 'TRAINING');
  const matches = activities.filter((a) => a.type === 'MATCH');

  const playerRecords = await prisma.player.findMany({
    include: {
      attendances: true,
      matchStats: true,
    },
    where: { teamId: team?.id ?? 1 },
  });

  // Team-wide statistics
  const totalGoals = activities.reduce((sum, activity) => sum + activity.matchStats.reduce((n, a) => n + a.goals, 0), 0);
  const totalAssists = activities.reduce((sum, activity) => sum + activity.matchStats.reduce((n, a) => n + a.assists, 0), 0);

  // Training statistics
  const totalTrainings = trainings.length;
  const trainingsWithAttendance = trainings.filter((t) => t.attendances.length > 0).length;
  const trainingAttendanceCount = trainings.reduce((sum, t) => sum + t.attendances.filter((a) => a.present).length, 0);
  const totalTrainingSlots = trainings.reduce((sum, t) => sum + t.attendances.length, 0);
  const trainingAttendanceRate = totalTrainingSlots ? Math.round((trainingAttendanceCount / totalTrainingSlots) * 100) : 0;

  // Match statistics
  const totalMatches = matches.length;
  const matchesWithAttendance = matches.filter((m) => m.attendances.length > 0).length;
  const matchAttendanceCount = matches.reduce((sum, m) => sum + m.attendances.filter((a) => a.present).length, 0);
  const totalMatchSlots = matches.reduce((sum, m) => sum + m.attendances.length, 0);
  const matchAttendanceRate = totalMatchSlots ? Math.round((matchAttendanceCount / totalMatchSlots) * 100) : 0;

  // Wins, draws, losses (based on status field)
  const wins = matches.filter((m) => (m.status ?? '').toLowerCase().includes('win')).length;
  const draws = matches.filter((m) => (m.status ?? '').toLowerCase().includes('draw')).length;
  const losses = matches.filter((m) => (m.status ?? '').toLowerCase().includes('loss')).length;

  return {
    team: {
      totalTrainings,
      trainingsWithAttendance,
      trainingAttendanceRate,
      totalMatches,
      matchesWithAttendance,
      matchAttendanceRate,
      totalGoals,
      totalAssists,
      wins,
      draws,
      losses,
    },
    players: playerRecords.map((player) => {
      const playerTrainings = activities.filter((a) => a.type === 'TRAINING' && a.attendances.some((att) => att.playerId === player.id));
      const playerMatches = activities.filter((a) => a.type === 'MATCH' && a.attendances.some((att) => att.playerId === player.id));
      const playerTrainingAttendances = player.attendances.filter((a) => activities.find((ac) => ac.id === a.activityId && ac.type === 'TRAINING'));
      const playerMatchAttendances = player.attendances.filter((a) => activities.find((ac) => ac.id === a.activityId && ac.type === 'MATCH'));

      return {
        id: player.id,
        name: player.name,
        trainingCount: playerTrainings.length,
        trainingAttendance: playerTrainingAttendances.filter((a) => a.present).length,
        trainingAttendanceRate: playerTrainingAttendances.length ? Math.round((playerTrainingAttendances.filter((a) => a.present).length / playerTrainingAttendances.length) * 100) : 0,
        matchCount: playerMatches.length,
        matchAttendance: playerMatchAttendances.filter((a) => a.present).length,
        matchAttendanceRate: playerMatchAttendances.length ? Math.round((playerMatchAttendances.filter((a) => a.present).length / playerMatchAttendances.length) * 100) : 0,
        goals: player.matchStats.reduce((sum, stat) => sum + stat.goals, 0),
        assists: player.matchStats.reduce((sum, stat) => sum + stat.assists, 0),
      };
    }),
  };
}
