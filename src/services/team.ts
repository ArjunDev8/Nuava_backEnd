import { Student, Team } from "@prisma/client";
import { ApolloError } from "apollo-server-errors";
import { playerLimits, typesOfSport } from "../constants";
import { prisma } from "../db";

export type typesOfSport = keyof typeof typesOfSport;

interface createTeamInput {
  name: string;
  typeOfSport: typesOfSport;
  players: number[];
}

export const getAllTeams = async ({
  filter,
  coachID,
  schoolID,
}: {
  filter?: {
    typeOfSport?: typesOfSport;
  };
  coachID: number;
  schoolID: number;
}): Promise<Array<Team>> => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        typeOfSport: filter?.typeOfSport,
        schoolID: schoolID,
        coachID: coachID,
      },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    const teamsWithPlayers = teams.map((team) => {
      return {
        ...team,
        players: team.students.map((student) => student.student),
      };
    });

    return teamsWithPlayers;
  } catch (err: any) {
    throw err;
  }
};

export const getAllAvailablePlayers = async ({
  schoolID,
  typeOfSport,
}: {
  schoolID: number;
  typeOfSport: string;
}): Promise<Array<Student>> => {
  try {
    const allTeamsOfSchool = await prisma.team.findMany({
      where: {
        schoolID,
        typeOfSport,
      },
    });

    if (!allTeamsOfSchool.length) {
      return [];
    }

    const teamIds = allTeamsOfSchool.map((team) => team.id);

    const allFreePlayers = await prisma.student.findMany({
      where: {
        schoolID,

        NOT: {
          teams: {
            some: {
              teamId: {
                in: teamIds,
              },
            },
          },
        },
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });

    console.log(allFreePlayers.length, "students");

    return allFreePlayers;
  } catch (err: any) {
    throw err;
  }
};

export const getTeamWithPlayers = async (teamId: number): Promise<Team> => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
      },
      include: {
        students: true,
      },
    });

    if (!team) {
      throw new ApolloError("Team not found");
    }

    return team;
  } catch (err: any) {
    throw err;
  }
};

export const createTeam = async (input: createTeamInput, coachId: number) => {
  try {
    const { players, typeOfSport } = input;
    const hasDuplicatePlayers = new Set(players).size !== players.length;

    if (hasDuplicatePlayers) {
      throw new ApolloError("Duplicate players not allowed");
    }

    //VALIDATE THE MIN AND MAX NUMBER OF PLAYERS IN A TEAM
    if (players.length < playerLimits[typeOfSport].min) {
      throw new ApolloError("Specify more than one player to create a team");
    }

    if (players.length > playerLimits[typeOfSport].max) {
      throw new ApolloError("Specify less than 10 players to create a team");
    }
    const result = await prisma.$transaction(async (prisma) => {
      const coach = await prisma.coach.findFirst({
        where: {
          id: coachId,
        },
      });

      if (!coach) {
        throw new ApolloError("Coach not found");
      }

      const team = await prisma.team.create({
        data: {
          name: input.name,
          typeOfSport: input.typeOfSport,
          coachID: coachId,
          schoolID: coach.schoolID,
        },
      });

      if (!(players.length > 0)) {
        throw new ApolloError("Specify more than one player to create a team");
      }

      // Assuming players is an array of player IDs
      for (const playerId of players) {
        const student = await prisma.student.findFirst({
          where: {
            id: playerId,
          },
        });

        if (!student) {
          throw new ApolloError(`Student with ID ${playerId} not found`);
        }

        await prisma.studentOnTeam.create({
          data: {
            studentId: playerId,
            teamId: team.id,
          },
        });
      }

      return team;
    });

    return result;
  } catch (err: any) {
    throw err;
  }
};

export const deleteTeam = async (teamId: number) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      throw new ApolloError("Team not found");
    }

    await prisma.team.delete({
      where: {
        id: teamId,
      },
    });

    return team;
  } catch (err: any) {
    throw err;
  }
};

export const editTeam = async (teamId: number, input: createTeamInput) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      throw new ApolloError("Team not found");
    }

    const result = await prisma.$transaction(async (prisma) => {
      const { players, typeOfSport } = input;
      const hasDuplicatePlayers = new Set(players).size !== players.length;

      //VALIDATE THE MIN AND MAX NUMBER OF PLAYERS IN A TEAM
      if (players.length < playerLimits[typeOfSport].min) {
        throw new ApolloError("Specify more than one player to create a team");
      }

      if (players.length > playerLimits[typeOfSport].max) {
        throw new ApolloError("Specify less than 10 players to create a team");
      }

      if (hasDuplicatePlayers) {
        throw new ApolloError("Duplicate players not allowed");
      }

      if (!(players.length > 0)) {
        throw new ApolloError("Specify more than one player to create a team");
      }

      await prisma.studentOnTeam.deleteMany({
        where: {
          teamId: teamId,
        },
      });

      // Assuming players is an array of player IDs
      for (const playerId of players) {
        const student = await prisma.student.findFirst({
          where: {
            id: playerId,
          },
        });

        if (!student) {
          throw new ApolloError(`Student with ID ${playerId} not found`);
        }

        await prisma.studentOnTeam.create({
          data: {
            studentId: playerId,
            teamId: teamId,
          },
        });
      }

      return team;
    });

    return result;
  } catch (err: any) {
    throw err;
  }
};