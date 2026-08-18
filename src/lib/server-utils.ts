import prisma from "@/lib/prisma";


export async function buildStats() {
  const team = await prisma.team.findFirst({
    include: { players: true },
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

  const totalGoals = activities.reduce(
    (sum, activity) =>
      sum + activity.matchStats.reduce((n, a) => n + a.goals, 0),
    0
  );

  const totalAssists = activities.reduce(
    (sum, activity) =>
      sum + activity.matchStats.reduce((n, a) => n + a.assists, 0),
    0
  );

  const totalTrainings = trainings.length;
  const trainingsWithAttendance = trainings.filter((t) => t.attendances.length > 0).length;
  const trainingAttendanceCount = trainings.reduce(
    (sum, t) => sum + t.attendances.filter((a) => a.present).length,
    0
  );
  const totalTrainingSlots = trainings.reduce(
    (sum, t) => sum + t.attendances.length,
    0
  );
  const trainingAttendanceRate = totalTrainingSlots
    ? Math.round((trainingAttendanceCount / totalTrainingSlots) * 100)
    : 0;

  const totalMatches = matches.length;
  const matchesWithAttendance = matches.filter((m) => m.attendances.length > 0).length;
  const matchAttendanceCount = matches.reduce(
    (sum, m) => sum + m.attendances.filter((a) => a.present).length,
    0
  );
  const totalMatchSlots = matches.reduce(
    (sum, m) => sum + m.attendances.length,
    0
  );
  const matchAttendanceRate = totalMatchSlots
    ? Math.round((matchAttendanceCount / totalMatchSlots) * 100)
    : 0;

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
      const playerTrainings = activities.filter(
        (a) =>
          a.type === 'TRAINING' &&
          a.attendances.some((att) => att.playerId === player.id)
      );

      const playerMatches = activities.filter(
        (a) =>
          a.type === 'MATCH' &&
          a.attendances.some((att) => att.playerId === player.id)
      );

      const playerTrainingAttendances = player.attendances.filter((a) =>
        activities.find((ac) => ac.id === a.activityId && ac.type === 'TRAINING')
      );

      const playerMatchAttendances = player.attendances.filter((a) =>
        activities.find((ac) => ac.id === a.activityId && ac.type === 'MATCH')
      );

      return {
        id: player.id,
        name: player.name,
        trainingCount: playerTrainings.length,
        trainingAttendance: playerTrainingAttendances.filter((a) => a.present).length,
        trainingAttendanceRate: playerTrainingAttendances.length
          ? Math.round(
              (playerTrainingAttendances.filter((a) => a.present).length /
                playerTrainingAttendances.length) *
                100
            )
          : 0,
        matchCount: playerMatches.length,
        matchAttendance: playerMatchAttendances.filter((a) => a.present).length,
        matchAttendanceRate: playerMatchAttendances.length
          ? Math.round(
              (playerMatchAttendances.filter((a) => a.present).length /
                playerMatchAttendances.length) *
                100
            )
          : 0,
        goals: player.matchStats.reduce((sum, stat) => sum + stat.goals, 0),
        assists: player.matchStats.reduce((sum, stat) => sum + stat.assists, 0),
      };
    }),
  };
}
