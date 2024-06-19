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
  participatingSchools: number[];
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
        participatingSchools,
        tournamentDays,
        intervalBetweenMatches,
        matchDuration,
      } = input;

      const startFormatedDate = new Date(startDate);
      const endFormatedDate = new Date(endDate);

      if (startFormatedDate > endFormatedDate) {
        throw new ApolloError("Start date cannot be greater than end date");
      }

      if (participatingSchools.length < 2) {
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
        const isSchoolAvailable = await prisma.school.findUnique({
          where: {
            id: schoolId,
          },
        });
        if (isSchoolAvailable) {
          await prisma.participatingSchool.create({
            data: {
              schoolId: schoolId,
              tournamentId: tournament.id,
            },
          });
        }

        let allTeamsFromParticipatingSchool = await prisma.team.findMany({
          where: {
            schoolID: schoolId,
          },
        });

        if (allTeamsFromParticipatingSchool.length === 0) {
          allTeamsFromParticipatingSchool = [
            {
              id: schoolId + 999,
              name: `DummyTeam${schoolId}`,
              schoolID: schoolId,
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

      // for (let i = 0; i < participatingTeams.length; i += 2) {
      //   if (i + 1 < participatingTeams.length) {
      //     await prisma.fixture.create({
      //       data: {
      //         teamID1: participatingTeams[i].id,
      //         teamID2: participatingTeams[i + 1].id,
      //         tournamentID: tournament.id,
      //         startDate: new Date(),
      //         endDate: new Date(),
      //         location: "TBD",
      //       },
      //     });
      //   }
      // }

      // if (byeTeam) {
      //   await prisma.fixture.create({
      //     data: {
      //       teamID1: byeTeam.id,
      //       teamID2: BYESOPPONENT,
      //       tournamentID: tournament.id,
      //       startDate: new Date(),
      //       endDate: new Date(),
      //       location: "TBD",
      //     },
      //   });
      // }
      // Assuming matchDuration is the duration of a match in minutes
      // and intervalBetweenMatches is the interval between matches in minutes

      // Calculate the total duration of the tournament
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
