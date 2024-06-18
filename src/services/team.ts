import { ApolloError } from "apollo-server-errors";
import { prisma } from "../db";
import { Coach, Team } from "@prisma/client";
import { typesOfSport } from "../constants";

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
    const result = await prisma.$transaction(async (prisma) => {
      const { players } = input;
      const hasDuplicatePlayers = new Set(players).size !== players.length;

      if (hasDuplicatePlayers) {
        throw new ApolloError("Duplicate players not allowed");
      }
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
