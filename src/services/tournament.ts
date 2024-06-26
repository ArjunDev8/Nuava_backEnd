import { ApolloError } from "apollo-server-errors";
import { prisma } from "../db";
import { Coach, TournamentDay } from "@prisma/client";
import { typesOfSport } from "./team";
import { BYESOPPONENT } from "../constants";
import { areTournamentDaysValid } from "../helper/utils";

interface CreateTournamentInput {
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  typeOfSport: typesOfSport;
  participatingSchoolNames: string[];
  intervalBetweenMatches: number;
  tournamentDays: {
    date: Date;
    startTime: Date;
    endTime: Date;
  }[];
  matchDuration: number;
}

export const createTournament = async (
  input: CreateTournamentInput,
  coach: Coach
) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const {
        startDate,
        endDate,
        name,
        location,
        typeOfSport,
        participatingSchoolNames,
        tournamentDays,
        intervalBetweenMatches,
        matchDuration,
      } = input;

      const startFormatedDate = new Date(startDate);
      const endFormatedDate = new Date(endDate);

      if (startFormatedDate > endFormatedDate) {
        throw new ApolloError("Start date cannot be greater than end date");
      }

      if (participatingSchoolNames.length < 2) {
        throw new ApolloError(
          "At least two schools are required to create a tournament"
        );
      }

      if (tournamentDays.length === 0) {
        throw new ApolloError("At least one tournament day is required");
      }

      if (!areTournamentDaysValid({ startDate, endDate, tournamentDays })) {
        throw new ApolloError("Invalid tournament days");
      }

      // Create or find the participating schools
      const participatingSchools = await Promise.all(
        participatingSchoolNames.map(async (schoolName) => {
          const school = await prisma.school.upsert({
            where: {
              name: schoolName,
            },
            update: {},
            create: {
              name: schoolName,
              address: "TBD", // Use 'TBD' or similar for fields you don't have yet
              contactDetails: "TBD", // Use 'TBD' or similar for fields you don't have yet
              // For optional fields, you can choose to omit them or provide a default value
              passkey: "TBD", // Optional
              domain: "TBD", // Optional
            },
          });

          return school;
        })
      );

      for (const schoolID of participatingSchools) {
        const isSchoolAvailable = await prisma.school.findUnique({
          where: {
            id: schoolID.id,
          },
        });

        if (!isSchoolAvailable) {
          throw new ApolloError(
            `School:${schoolID}is not available for the tournament`
          );
        }
      }

      const tournament = await prisma.tournament.create({
        data: {
          name,
          typeOfSport,
          location,
          startDate: startFormatedDate,
          endDate: endFormatedDate,
          organizingSchoolId: coach.schoolID,
          tournamentDays: {
            create: tournamentDays,
          },
        },
      });

      let participatingTeams = [];
      for (const schoolId of participatingSchools) {
        await prisma.participatingSchool.create({
          data: {
            schoolId: schoolId.id,
            tournamentId: tournament.id,
          },
        });

        let allTeamsFromParticipatingSchool = await prisma.team.findMany({
          where: {
            schoolID: schoolId.id,
          },
        });

        if (allTeamsFromParticipatingSchool.length === 0) {
          allTeamsFromParticipatingSchool = [
            {
              id: Math.random() * 1000 * schoolId.id,
              name: `DummyTeam${schoolId}`,
              schoolID: schoolId.id,
              typeOfSport: "FOOTBALL",
              coachID: coach.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
        }

        participatingTeams.push(...allTeamsFromParticipatingSchool);
      }

      console.log("PARTICIPATING", participatingTeams);

      for (let i = participatingTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [participatingTeams[i], participatingTeams[j]] = [
          participatingTeams[j],
          participatingTeams[i],
        ];
      }

      let byeTeam = null;
      if (participatingTeams.length % 2 !== 0) {
        byeTeam = participatingTeams.pop();
        // participatingTeams.push(byeTeam);
      }

      const totalMatches = participatingTeams.length / 2;

      const totalDuration =
        totalMatches * (matchDuration + intervalBetweenMatches);

      const totalAllotedTimeBasedOnDays = tournamentDays.reduce((acc, day) => {
        const dayDuration =
          (new Date(day.endTime).getTime() -
            new Date(day.startTime).getTime()) /
          60000;
        return acc + dayDuration;
      }, 0);

      if (totalDuration > totalAllotedTimeBasedOnDays) {
        throw new ApolloError(
          "Total duration of the tournament exceeds the total alloted time based on days"
        );
      }

      // Calculate the duration of each day
      const dayDuration = totalDuration / tournamentDays.length;

      // Initialize the current day and time
      let currentDay = 0;
      let currentTime = new Date(tournamentDays[currentDay].startTime);

      for (let i = 0; i < participatingTeams.length; i += 2) {
        if (i + 1 < participatingTeams.length) {
          // Calculate the end time of the match
          const endTime = new Date(
            currentTime.getTime() + matchDuration * 60000
          );

          await prisma.fixture.create({
            data: {
              teamID1: participatingTeams[i].id,
              teamID2: participatingTeams[i + 1].id,
              tournamentID: tournament.id,
              startDate: currentTime,
              endDate: endTime,
              location: "TBD",
            },
          });

          // Update the current time for the next match
          currentTime = new Date(
            endTime.getTime() + intervalBetweenMatches * 60000
          );

          // If the current time is past the end of the current day, move to the next day
          if (currentTime > new Date(tournamentDays[currentDay].endTime)) {
            currentDay++;
            currentTime = new Date(tournamentDays[currentDay].startTime);
          }
        }
      }

      if (byeTeam) {
        // Calculate the end time of the match
        const endTime = new Date(currentTime.getTime() + matchDuration * 60000);

        await prisma.fixture.create({
          data: {
            teamID1: byeTeam.id,
            teamID2: BYESOPPONENT,
            tournamentID: tournament.id,
            startDate: currentTime,
            endDate: endTime,
            location: "TBD",
            isBye: true,
            winnerID: byeTeam.id,
            round: 2,
          },
        });
      }
    });

    return result;
  } catch (err: any) {
    throw err;
  }
};

//GET TOURNAMENT

//GET ALL FIXTURES OF TOURNAMENT

//EDIT FIXTURE

//SWAP TEAMS IN FIXTURE
export const swapTeamsInFixture = async (
  fixtureId1: number,
  fixtureId2: number,
  team1Id: number,
  team2Id: number
) => {
  try {
    const fixture1 = await prisma.fixture.findFirst({
      where: {
        id: fixtureId1,
      },
    });

    const fixture2 = await prisma.fixture.findFirst({
      where: {
        id: fixtureId2,
      },
    });

    if (!fixture1 || !fixture2) {
      throw new ApolloError("Fixtures not found in the tournament");
    }

    const updatedFixture1 = await prisma.fixture.update({
      where: {
        id: fixtureId1,
      },
      data: {
        teamID1: team2Id,
        teamID2: team1Id,
      },
    });

    const updatedFixture2 = await prisma.fixture.update({
      where: {
        id: fixtureId2,
      },
      data: {
        teamID1: team1Id,
        teamID2: team2Id,
      },
    });

    return { updatedFixture1, updatedFixture2 };
  } catch (err: any) {
    throw err;
  }
};

//DELETE FIXTURE
export const deleteFixture = async (fixtureId: number) => {
  try {
    const fixture = await prisma.fixture.findFirst({
      where: {
        id: fixtureId,
      },
    });

    if (!fixture) {
      throw new ApolloError("Fixture not found");
    }

    await prisma.fixture.delete({
      where: {
        id: fixtureId,
      },
    });

    return fixture;
  } catch (err: any) {
    throw err;
  }
};

//EDIT TOURNAMENT

//DELETE TOURNAMENT
export const deleteTournament = async (tournamentId: number) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
      },
    });

    if (!tournament) {
      throw new ApolloError("Tournament not found");
    }

    await prisma.tournament.delete({
      where: {
        id: tournamentId,
      },
    });

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
