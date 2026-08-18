import prisma from "@/lib/prisma";

export async function buildStats() {
  const team = await prisma.team.findFirst({
    include: {
      players: true,
    },
  });

  if (!team) {
    return {
      team: {
        totalTrainings: 0,
        trainingsWithAttendance: 0,
        trainingAttendanceRate: 0,
        totalMatches: 0,
        matchesWithAttendance: 0,
        matchAttendanceRate: 0,
        totalGoals: 0,
        totalAssists: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      },
      players: [],
    };
  }

  const activities = await prisma.activity.findMany({
    where: {
      teamId: team.id,
    },
    include: {
      attendance: true,
      matchStats: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const trainings = activities.filter(
    (activity) => activity.type === "TRAINING"
  );

  const matches = activities.filter(
    (activity) => activity.type === "MATCH"
  );

  const playerRecords = await prisma.player.findMany({
    where: {
      teamId: team.id,
    },
    include: {
      attendance: true,
      matchStats: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const totalGoals = matches.reduce(
    (sum, activity) =>
      sum +
      activity.matchStats.reduce(
        (matchSum, stat) => matchSum + stat.goals,
        0
      ),
    0
  );

  const totalAssists = matches.reduce(
    (sum, activity) =>
      sum +
      activity.matchStats.reduce(
        (matchSum, stat) => matchSum + stat.assists,
        0
      ),
    0
  );

  const totalTrainings = trainings.length;

  const trainingsWithAttendance = trainings.filter(
    (training) => training.attendance.length > 0
  ).length;

  const trainingAttendanceCount = trainings.reduce(
    (sum, training) =>
      sum +
      training.attendance.filter(
        (attendance) => attendance.present
      ).length,
    0
  );

  const totalTrainingSlots = trainings.reduce(
    (sum, training) => sum + training.attendance.length,
    0
  );

  const trainingAttendanceRate = totalTrainingSlots
    ? Math.round(
        (trainingAttendanceCount / totalTrainingSlots) * 100
      )
    : 0;

  const totalMatches = matches.length;

  const matchesWithAttendance = matches.filter(
    (match) => match.attendance.length > 0
  ).length;

  const matchAttendanceCount = matches.reduce(
    (sum, match) =>
      sum +
      match.attendance.filter(
        (attendance) => attendance.present
      ).length,
    0
  );

  const totalMatchSlots = matches.reduce(
    (sum, match) => sum + match.attendance.length,
    0
  );

  const matchAttendanceRate = totalMatchSlots
    ? Math.round(
        (matchAttendanceCount / totalMatchSlots) * 100
      )
    : 0;

  /*
   * Wedstrijdresultaten worden op dit moment niet meer uit
   * Activity.status gehaald, omdat status geen onderdeel meer
   * is van het nieuwe datamodel.
   *
   * Deze blijven voorlopig op 0 totdat we de nieuwe
   * wedstrijdresultaat-structuur toevoegen.
   */
  const wins = 0;
  const draws = 0;
  const losses = 0;

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
      const playerTrainingAttendances =
        player.attendance.filter((attendance) => {
          const activity = activities.find(
            (item) => item.id === attendance.activityId
          );

          return activity?.type === "TRAINING";
        });

      const playerMatchAttendances =
        player.attendance.filter((attendance) => {
          const activity = activities.find(
            (item) => item.id === attendance.activityId
          );

          return activity?.type === "MATCH";
        });

      const trainingPresent =
        playerTrainingAttendances.filter(
          (attendance) => attendance.present
        ).length;

      const matchPresent =
        playerMatchAttendances.filter(
          (attendance) => attendance.present
        ).length;

      return {
        id: player.id,
        name: player.name,

        trainingCount: playerTrainingAttendances.length,
        trainingAttendance: trainingPresent,

        trainingAttendanceRate:
          playerTrainingAttendances.length > 0
            ? Math.round(
                (trainingPresent /
                  playerTrainingAttendances.length) *
                  100
              )
            : 0,

        matchCount: playerMatchAttendances.length,
        matchAttendance: matchPresent,

        matchAttendanceRate:
          playerMatchAttendances.length > 0
            ? Math.round(
                (matchPresent /
                  playerMatchAttendances.length) *
                  100
              )
            : 0,

        goals: player.matchStats.reduce(
          (sum, stat) => sum + stat.goals,
          0
        ),

        assists: player.matchStats.reduce(
          (sum, stat) => sum + stat.assists,
          0
        ),
      };
    }),
  };
}