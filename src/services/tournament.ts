import { ApolloError } from "apollo-server-errors";
import { prisma } from "../db";
import { Coach } from "@prisma/client";

interface CreateTournamentInput {
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  typeOfSport: string;
  participatingSchools: number[];
}

export const createTournament = async (
  input: CreateTournamentInput,
  coach: Coach
) => {
  try {
    const {
      startDate,
      endDate,
      name,
      location,
      typeOfSport,
      participatingSchools,
    } = input;

    console.log("input", input.participatingSchools);

    const startFormatedDate = new Date(startDate);
    const endFormatedDate = new Date(endDate);
    // console.log("input", startFormatedDate, endFormatedDate);
    const tournament = await prisma.tournament.create({
      data: {
        name,
        typeOfSport,
        location,
        startDate: startFormatedDate,
        endDate: endFormatedDate,
        organizingSchoolId: coach.schoolID,
      },
    });

    for (const schoolId of participatingSchools) {
      await prisma.participatingSchool.create({
        data: {
          schoolId: schoolId,
          tournamentId: tournament.id,
        },
      });
    }

    console.log("tournament", tournament);

    return tournament;
  } catch (err: any) {
    throw err;
  }
};

export const getAllTournaments = async (schoolId: number) => {
  try {
    const tournaments = await prisma.participatingSchool.findMany({
      where: {
        schoolId: schoolId,
      },
      include: {
        tournament: true,
      },
    });

    console.log(tournaments);

    if (!tournaments) {
      throw new Error("No tournaments found");
    }

    return tournaments.map((tournament) => tournament.tournament);
  } catch (err: any) {
    throw err;
  }
};
