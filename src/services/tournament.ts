import { Coach, Fixture, School, Tournament } from "@prisma/client";
import { ApolloError } from "apollo-server-errors";
import { Job, Queue, Worker } from "bullmq";
import {
  FIXTURE_STATUS_LIVE,
  FIXTURE_STATUS_NOT_STARTED,
  FIXTURE_STATUS_STARTED,
  FIXURE_EVENT,
  INTER_HOUSE_EVENT,
  MATCH_RESULT_CONFIRMATION_STATUS,
  NORMAL_EVENT,
} from "../constants";
import { prisma } from "../db";
import { areTournamentDaysValid } from "../helper/utils";
import { redisConnection } from "./queue";
import { typesOfSport } from "./team";

interface CreateTournamentInput {
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  typeOfSport: typesOfSport;
  participatingSchoolNames: string[];
  intervalBetweenMatches: number;
  gender: string;
  tournamentDays: {
    date: Date;
    startTime: Date;
    endTime: Date;
  }[];
  matchDuration: number;
}

interface EditTournamentInput {
  name?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  typeOfSport?: typesOfSport;
  participatingSchoolNames?: string[];
  intervalBetweenMatches?: number;
  tournamentDays?: {
    date: Date;
    startTime: Date;
    endTime: Date;
  }[];
  matchDuration?: number;
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
        gender,
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
          gender,
          intervalBetweenMatches,
          matchDuration,
          organizerCoachId: coach.id,
        },
      });

      console.log("TOURNAMENT", tournament);

      await createFixtures({
        participatingSchools: participatingSchools,
        tournament: tournament,
        coach,
        tournamentDays: tournamentDays,
        intervalBetweenMatches: intervalBetweenMatches,
        matchDuration: matchDuration,
        transaction: prisma,
      });
    });

    return result;
  } catch (err: any) {
    throw err;
  }
};

export const editTournament = async (
  input: EditTournamentInput,
  coach: Coach,
  tournamentID: number
) => {
  try {
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

    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentID,
        status: {
          not: "DELETED",
        },
      },
    });

    if (!tournament) {
      throw new ApolloError("Tournament not found");
    }

    if (tournament.startDate < new Date()) {
      throw new ApolloError("Tournament has already started");
    }

    if (tournament.organizerCoachId !== coach.id) {
      throw new ApolloError("You are not authorized to edit this tournament");
    }
    let updateData: any = {};

    if (name) updateData.name = name;
    if (typeOfSport) updateData.typeOfSport = typeOfSport;
    if (location) updateData.location = location;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (intervalBetweenMatches)
      updateData.intervalBetweenMatches = intervalBetweenMatches;
    if (matchDuration) updateData.matchDuration = matchDuration;

    if (tournamentDays) {
      updateData.tournamentDays = {
        deleteMany: {},
        create: tournamentDays,
      };
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentID },
      data: updateData,
      include: {
        tournamentDays: true,
      },
    });

    const isFixtureAffectingChange =
      startDate ||
      endDate ||
      tournamentDays ||
      intervalBetweenMatches ||
      matchDuration ||
      participatingSchoolNames;

    if (isFixtureAffectingChange) {
      const fixtures = await prisma.fixture.deleteMany({
        where: {
          tournamentID: tournamentID,
        },
      });

      if (!fixtures) {
        throw new ApolloError("No fixtures found in the tournament");
      }

      let participatingSchools;

      if (participatingSchoolNames) {
        participatingSchools = await Promise.all(
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
      } else {
        participatingSchools = await getAllParticipatingSchools(tournamentID);
      }

      await createFixtures({
        participatingSchools: participatingSchools,
        tournament: updatedTournament,
        coach,
        tournamentDays: updatedTournament.tournamentDays,
        intervalBetweenMatches: input.intervalBetweenMatches || 0,
        matchDuration: input.matchDuration || 0,
        isRestructuring: true,
        transaction: prisma,
      });
    }
  } catch (err: any) {
    throw err;
  }
};

export const getAllParticipatingSchools = async (tournamentId: number) => {
  try {
    const participatingSchools = await prisma.participatingSchool.findMany({
      where: {
        tournamentId: tournamentId,
      },
      include: {
        school: true,
      },
    });

    if (!participatingSchools) {
      throw new ApolloError("No participating schools found in the tournament");
    }

    return participatingSchools.map((participatingSchool) => {
      return participatingSchool.school;
    });
  } catch (err: any) {
    throw err;
  }
};
export const createFixtures = async ({
  participatingSchools,
  tournament,
  coach,
  tournamentDays,
  intervalBetweenMatches,
  matchDuration,
  isRestructuring,
  transaction,
}: {
  transaction: any;
  participatingSchools: School[];
  tournament: Tournament;
  coach: Coach;
  tournamentDays: {
    date: Date;
    startTime: Date;
    endTime: Date;
  }[];
  intervalBetweenMatches: number;
  matchDuration: number;
  isRestructuring?: boolean;
}) => {
  let participatingTeams = [];

  if (!isRestructuring) {
    await transaction.participatingSchool.deleteMany({
      where: {
        tournamentId: tournament.id,
      },
    });
  }

  // for (const schoolId of participatingSchools) {
  //   const existingRecord = await transaction.participatingSchool.findUnique({
  //     where: {
  //       schoolId_tournamentId: {
  //         schoolId: schoolId.id,
  //         tournamentId: tournament.id,
  //       },
  //     },
  //   });

  //   if (!existingRecord) {
  //     await transaction.participatingSchool.create({
  //       data: {
  //         schoolId: schoolId.id,
  //         tournamentId: tournament.id,
  //       },
  //     });
  //   }

  //   let allTeamsFromParticipatingSchool = await transaction.team.findMany({
  //     where: {
  //       schoolID: schoolId.id,
  //     },
  //   });

  //   if (allTeamsFromParticipatingSchool.length === 0) {
  //     // allTeamsFromParticipatingSchool = [
  //     //   {
  //     //     id: Math.random() * 1000 * schoolId.id,
  //     //     name: `DummyTeam${schoolId}`,
  //     //     schoolID: schoolId.id,
  //     //     typeOfSport: "FOOTBALL",
  //     //     coachID: coach.id,
  //     //     createdAt: new Date(),
  //     //     updatedAt: new Date(),
  //     //   },
  //     // ];

  //     allTeamsFromParticipatingSchool = await transaction.team.create({
  //       data: {
  //         name: `DummyTeam${schoolId.id}`,
  //         schoolID: schoolId.id,
  //         typeOfSport: "FOOTBALL",
  //         coachID: coach.id,
  //       },
  //     });
  //     allTeamsFromParticipatingSchool = [allTeamsFromParticipatingSchool];
  //   }

  //   participatingTeams.push(...allTeamsFromParticipatingSchool);
  // }
  for (const schoolId of participatingSchools) {
    const existingRecord = await transaction.participatingSchool.findUnique({
      where: {
        schoolId_tournamentId: {
          schoolId: schoolId.id,
          tournamentId: tournament.id,
        },
      },
    });

    if (!existingRecord) {
      await transaction.participatingSchool.create({
        data: {
          schoolId: schoolId.id,
          tournamentId: tournament.id,
        },
      });
    }

    let allTeamsFromParticipatingSchool = await transaction.team.findMany({
      where: {
        schoolID: schoolId.id,
      },
    });

    for (const team of allTeamsFromParticipatingSchool) {
      // Get the latest version of the team
      const latestTeamVersion = await transaction.teamVersion.findFirst({
        where: { teamId: team.id },
        orderBy: { createdAt: "desc" },
      });

      if (!latestTeamVersion) {
        throw new Error(`latest Team has no versions, ${schoolId.id}`);
      }

      console.log(latestTeamVersion, "latestTeamVersion");

      // Create a teamParticipation record linked to the latest team version

      const teamParticipationRecord =
        await transaction.teamParticipation.create({
          data: {
            teamId: latestTeamVersion.teamId, // Replace this with the actual team ID
            tournamentId: tournament.id, // Replace this with the actual tournament ID
          },
        });

      if (teamParticipationRecord) {
        participatingTeams.push(teamParticipationRecord);
      }
    }

    if (allTeamsFromParticipatingSchool.length === 0) {
      const dummyTeam = await transaction.team.create({
        data: {
          name: `DummyTeam${schoolId.id}`,
          schoolID: schoolId.id,
          typeOfSport: "FOOTBALL",
          coachID: coach.id,
        },
      });

      const dummyTeamVersion = await transaction.teamVersion.create({
        data: {
          teamId: dummyTeam.id,
          version: 1,
          players: [],
        },
      });

      if (dummyTeam) {
        // Get the latest version of the dummy team
        const latestDummyTeamVersion = await transaction.teamVersion.findFirst({
          where: { teamId: dummyTeam.id },
          orderBy: { createdAt: "desc" },
        });

        if (!latestDummyTeamVersion) {
          throw new Error("Dummy team has no versions");
        }

        // Create a teamParticipation record linked to the latest dummy team version
        const dummyParticipation = await transaction.teamParticipation.create({
          data: {
            teamId: latestDummyTeamVersion.teamId, // Replace this with the actual team ID
            tournamentId: tournament.id, // Replace this with the actual tournament ID
          },
        });

        participatingTeams.push(dummyParticipation);
      }
    }
  }

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

  const totalDuration = totalMatches * (matchDuration + intervalBetweenMatches);

  const totalAllotedTimeBasedOnDays = tournamentDays.reduce((acc, day) => {
    const dayDuration =
      (new Date(day.endTime).getTime() - new Date(day.startTime).getTime()) /
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

  console.log("CURRENT TIME", participatingTeams);

  for (let i = 0; i < participatingTeams.length; i += 2) {
    if (i + 1 < participatingTeams.length) {
      // Calculate the end time of the match
      const endTime = new Date(currentTime.getTime() + matchDuration * 60000);

      console.log(
        participatingTeams[i].id,
        participatingTeams[i + 1].id,

        "FIXTURE DATA"
      );

      const fixture = await transaction.fixture.create({
        data: {
          teamParticipationId1: participatingTeams[i].id,
          teamParticipationId2: participatingTeams[i + 1].id,
          fixtureStartStatus: FIXTURE_STATUS_STARTED,
          tournamentID: tournament.id,
          startDate: currentTime,

          endDate: endTime,
          location: "TBD",
        },
      });

      const teamData = await transaction.team.findMany({
        where: {
          id: {
            in: [
              participatingTeams[i].teamId,
              participatingTeams[i + 1].teamId,
            ],
          },
        },
      });

      //CREATE A ENTRY IN THE EVENTS TABLE
      const event = await transaction.events.create({
        data: {
          title: `Match between ${teamData[0].name} and ${teamData[1].name}`,
          start: currentTime,
          end: endTime,
          allDay: false,
          schoolID: coach.schoolID,
          typeOfEvent: FIXURE_EVENT,
          details: {
            description: `Match between ${teamData[0].name} and ${teamData[1].name}`,
            fixtureID: fixture.id,
          },
          isInterHouseEvent: false,
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
    console.log("BYE TEAM", byeTeam);
    // Calculate the end time of the match
    const endTime = new Date(currentTime.getTime() + matchDuration * 60000);

    const getDummyTeam = await transaction.team.findFirst({
      where: {
        name: `DummyTeam`,
      },
    });

    console.log(getDummyTeam, "DUMMY TEAM DATA");

    const dummyTeamParticipation = await transaction.teamParticipation.create({
      data: {
        teamId: getDummyTeam.id,
        tournamentId: tournament.id,
      },
    });

    console.log(byeTeam.id, getDummyTeam.id, "BYE TEAM DATA");

    const fixture = await transaction.fixture.create({
      data: {
        teamParticipationId1: byeTeam.id,
        teamParticipationId2: dummyTeamParticipation.id,
        fixtureStartStatus: FIXTURE_STATUS_STARTED,
        tournamentID: tournament.id,
        startDate: currentTime,
        endDate: endTime,
        winnerID: byeTeam.id,
        location: "TBD",
        isBye: true,
      },
    });
  }
};

//GET TOURNAMENT
export const getTournament = async (tournamentId: number) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        status: {
          not: "DELETED",
        },
      },
    });

    if (!tournament) {
      throw new ApolloError("Tournament not found");
    }

    return tournament;
  } catch (err: any) {
    throw err;
  }
};

//GET ALL FIXTURES OF TOURNAMENT
export const getAllFixturesOfTournament = async (tournamentId: number) => {
  try {
    const fixtures = await prisma.fixture.findMany({
      where: {
        tournamentID: tournamentId,
      },
    });

    if (!fixtures) {
      throw new ApolloError("No fixtures found in the tournament");
    }

    return fixtures;
  } catch (err: any) {
    throw err;
  }
};

export const getAllFixtureForSchool = async (schoolId: number) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        organizingSchoolId: schoolId,
        status: {
          not: "DELETED",
        },
      },
    });

    if (!tournaments) {
      throw new ApolloError("No tournaments found for the school");
    }

    const allFixturesFortheTournaments = await Promise.all(
      tournaments.map(async (tournament) => {
        const fixtures = await prisma.fixture.findMany({
          where: {
            tournamentID: tournament.id,
            fixtureStartStatus: FIXTURE_STATUS_STARTED,
          },
          include: {
            teamParticipation1: {
              include: {
                team: true,
              },
            },
            teamParticipation2: {
              include: {
                team: true,
              },
            },
          },
        });

        // Map fixtures to include team names instead of teamParticipation objects
        const fixturesWithTeamNames = fixtures.map((fixture) => ({
          ...fixture,
          team1: fixture.teamParticipation1?.team.name,
          team2: fixture.teamParticipation2?.team.name,
        }));

        return {
          id: tournament.id,
          tournamentName: tournament.name,
          fixtures: fixturesWithTeamNames,
        };
      })
    );

    return allFixturesFortheTournaments;
  } catch (err: any) {
    throw err;
  }
};

export const getAllLiveMatches = async (schoolId: number) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        organizingSchoolId: schoolId,
        status: {
          not: "DELETED",
        },
      },
    });

    if (!tournaments) {
      throw new ApolloError("No tournaments found for the school");
    }

    const allFixturesFortheTournaments = await Promise.all(
      tournaments.map(async (tournament) => {
        const fixtures = await prisma.fixture.findMany({
          where: {
            tournamentID: tournament.id,
            status: FIXTURE_STATUS_LIVE,
          },
          include: {
            teamParticipation1: {
              include: {
                team: true,
              },
            },
            teamParticipation2: {
              include: {
                team: true,
              },
            },
          },
        });

        // Map fixtures to include team names instead of teamParticipation objects
        const fixturesWithTeamNames = fixtures.map((fixture) => ({
          ...fixture,
          team1: fixture.teamParticipation1?.team.name,
          team2: fixture.teamParticipation2?.team.name,
        }));

        return {
          tournamentName: tournament.name,
          fixtures: fixturesWithTeamNames,
        };
      })
    );

    return allFixturesFortheTournaments;
  } catch (err: any) {
    throw err;
  }
};

// export const getBracket = async (tournamentId: number) => {
//   try {
//     const tournament = await prisma.tournament.findFirst({
//       where: {
//         id: tournamentId,
//         status: {
//           not: "DELETED",
//         },
//       },
//       include: {
//         fixtures: {
//           include: {
//             teamParticipation1: {
//               include: {
//                 team: true,
//               },
//             },
//             teamParticipation2: {
//               include: {
//                 team: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!tournament) {
//       throw new ApolloError("Tournament not found");
//     }

//     const brackets = tournament.fixtures.map((fixture, index) => {
//       const team1IsWinner = fixture.isBye
//         ? true
//         : fixture.winnerID === fixture.teamParticipation1.teamId;
//       const team2IsWinner = fixture.isBye
//         ? false
//         : fixture.winnerID === fixture.teamParticipation2.teamId;

//       return {
//         id: fixture.id,
//         name: `${fixture.teamParticipation1.team.name} vs ${fixture.teamParticipation2.team.name}`,
//         nextMatchId: tournament.fixtures[index + 1]
//           ? tournament.fixtures[index + 1].id
//           : null,
//         tournamentRoundText: fixture.round.toString(), // Using the round field to determine the round text
//         startTime: fixture.startDate.toISOString(),
//         state: fixture.isBye ? "DONE" : fixture.winnerID ? "DONE" : "PENDING", // If it's a bye or a winner is set, the state is "DONE". Otherwise, it's "PENDING".
//         participants: [
//           {
//             id: fixture.teamParticipation1.teamId.toString(),
//             name: fixture.teamParticipation1.team.name,
//             resultText: team1IsWinner ? "WON" : null, // If team 1 is the winner, set the result text to "WON".
//             isWinner: team1IsWinner,
//             status: fixture.isBye ? "WALK_OVER" : null, // If it's a bye, set the status to "WALK_OVER". Otherwise, you need to determine how to set this.
//           },
//           {
//             id: fixture.teamParticipation2.teamId.toString(),
//             name: fixture.teamParticipation2.team.name,
//             resultText: team2IsWinner ? "WON" : null, // If team 2 is the winner, set the result text to "WON".
//             isWinner: team2IsWinner,
//             status: fixture.isBye ? "NO_PARTY" : null, // If it's a bye, set the status to "NO_PARTY"
//           },
//         ],
//       };
//     });

//     return brackets;
//   } catch (err: any) {
//     throw err;
//   }
// };

export const getBracket = async (tournamentId: number) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        status: {
          not: "DELETED",
        },
      },
      include: {
        fixtures: {
          include: {
            teamParticipation1: {
              include: {
                team: true,
              },
            },
            teamParticipation2: {
              include: {
                team: true,
              },
            },
          },
          orderBy: {
            round: "asc",
          },
        },
      },
    });

    if (!tournament) {
      throw new ApolloError("Tournament not found");
    }

    const brackets = tournament.fixtures.map((fixture, index) => {
      const team1 = fixture.teamParticipation1?.team;
      const team2 = fixture.teamParticipation2?.team;

      console.log(fixture.winnerID, fixture.teamParticipation1, "FIXTURE DATA");
      const team1IsWinner = fixture.isBye
        ? true
        : fixture.winnerID === fixture.teamParticipationId1;
      const team2IsWinner = fixture.isBye
        ? false
        : fixture.winnerID === fixture.teamParticipationId2;

      return {
        id: fixture.id,
        name: `${team1 ? team1.name : "TBD"} vs ${team2 ? team2.name : "TBD"}`,
        nextMatchId: tournament.fixtures[index + 1]
          ? tournament.fixtures[index + 1].id
          : null,
        tournamentRoundText: `Round ${fixture.round}`, // Using the round field to determine the round text
        startTime: fixture.startDate.toISOString(),
        state: fixture.isBye ? "DONE" : fixture.winnerID ? "DONE" : "PENDING", // If it's a bye or a winner is set, the state is "DONE". Otherwise, it's "PENDING".
        participants: [
          {
            id: team1 ? fixture.teamParticipationId1?.toString() : null,
            name: team1 ? team1.name : null,
            resultText: team1IsWinner ? "WON" : "LOST", // If team 1 is the winner, set the result text to "WON".
            isWinner: team1IsWinner,
            status: fixture.isBye ? "WALK_OVER" : "NORMAL", // If it's a bye, set the status to "WALK_OVER". Otherwise, you need to determine how to set this.
          },
          {
            id: team2 ? fixture.teamParticipationId2?.toString() : null,
            name: team2 ? team2.name : null,
            resultText: team2IsWinner ? "WON" : "LOST", // If team 2 is the winner, set the result text to "WON".
            isWinner: team2IsWinner,
            status: fixture.isBye ? "NO_PARTY" : "NORMAL", // If it's a bye, set the status to "NO_PARTY"
          },
        ],
      };
    });

    return brackets;
  } catch (err: any) {
    throw err;
  }
};

//SWAP TEAMS IN FIXTURE
export const swapTeamsInFixture = async ({
  fixtureId1,
  fixtureId2,
  team1Id,
  team2Id,
}: {
  fixtureId1: number;
  fixtureId2: number;
  team1Id: number;
  team2Id: number;
}) => {
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

    const fixture1Teams = [
      fixture1?.teamParticipationId1,
      fixture1?.teamParticipationId2,
    ];
    const fixture2Teams = [
      fixture2?.teamParticipationId1,
      fixture2?.teamParticipationId2,
    ];

    const swapFixture1Data = fixture1Teams.map((teamId) => {
      if (teamId === team1Id) {
        return team2Id;
      } else if (teamId === team2Id) {
        return team1Id;
      } else {
        return teamId;
      }
    });

    const swapFixture2Data = fixture2Teams.map((teamId) => {
      if (teamId === team1Id) {
        return team2Id;
      } else if (teamId === team2Id) {
        return team1Id;
      } else {
        return teamId;
      }
    });

    const updatedFixture1 = await prisma.fixture.update({
      where: {
        id: fixtureId1,
      },
      // data: {
      //   teamID1: team2Id,
      //   teamID2: team1Id,
      // },

      data: {
        teamParticipationId1: swapFixture1Data[0],
        teamParticipationId2: swapFixture1Data[1],
      },
    });

    const updatedFixture2 = await prisma.fixture.update({
      where: {
        id: fixtureId2,
      },
      data: {
        teamParticipationId1: swapFixture2Data[0],
        teamParticipationId2: swapFixture2Data[1],
      },
    });

    return { updatedFixture1, updatedFixture2 };
  } catch (err: any) {
    throw err;
  }
};

//DELETE FIXTURE
export const deleteFixture = async (fixtureId: number, coach: Coach) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        fixtures: {
          some: {
            id: fixtureId,
          },
        },
        status: {
          not: "DELETED",
        },
      },
    });

    if (!tournament) {
      throw new ApolloError("This Fixture does not belong to any tournament");
    }

    if (coach.id !== tournament.organizerCoachId) {
      throw new ApolloError("You are not authorized to delete this fixture");
    }
    const fixture = await prisma.fixture.findFirst({
      where: {
        id: fixtureId,
      },
    });

    if (!fixture) {
      throw new ApolloError("Fixture not found");
    }

    const events = await prisma.events.findMany();

    const eventsToDelete = events.filter(
      (event: any) => event.details.fixtureID === fixtureId
    );

    const deleteEvents = eventsToDelete.map((event) =>
      prisma.events.delete({
        where: {
          id: event.id,
        },
      })
    );

    await prisma.$transaction([
      prisma.fixture.delete({
        where: {
          id: fixtureId,
        },
      }),
      ...deleteEvents,
    ]);

    return fixture;
  } catch (err: any) {
    throw err;
  }
};
// fixtureId: Int!
// fixtureStartTime: String!
// fixtureEndTime: String!
// fixtureLocation: String!
export const editFixture = async ({
  fixtureId,
  fixtureStartTime,
  fixtureEndTime,
  fixtureLocation,
}: {
  fixtureId?: number;
  fixtureStartTime?: Date;
  fixtureEndTime?: Date;
  fixtureLocation?: string;
}) => {
  try {
    const fixture = await prisma.fixture.findFirst({
      where: {
        id: fixtureId,
      },
    });

    if (!fixture) {
      throw new ApolloError("Fixture not found");
    }

    const updatedFixture = await prisma.fixture.update({
      where: {
        id: fixtureId,
      },
      data: {
        startDate: fixtureStartTime,
        endDate: fixtureEndTime,
        location: fixtureLocation,
      },
    });

    return updatedFixture;
  } catch (err: any) {
    throw err;
  }
};

//DELETE TOURNAMENT
// export const deleteTournament = async (tournamentId: number, coach: Coach) => {
//   try {
//     const tournament = await prisma.tournament.findFirst({
//       where: {
//         id: tournamentId,
//       },
//       include: {
//         fixtures: true,
//       },
//     });

//     if (!tournament) {
//       throw new ApolloError("Tournament not found");
//     }
//     console.log(coach.id, tournament.organizerCoachId, tournamentId);

//     if (coach.id !== tournament.organizerCoachId) {
//       throw new ApolloError("You are not authorized to delete this tournament");
//     }

//     const fixtureIDs = tournament.fixtures.map((fixture) => fixture.id);

//     const events = await prisma.events.findMany();

//     const eventsToDelete = events.filter((event: any) =>
//       fixtureIDs.includes(event.details.fixtureID)
//     );

//     const deleteEvents = eventsToDelete.map((event) =>
//       prisma.events.delete({
//         where: {
//           id: event.id,
//         },
//       })
//     );

//     await prisma.$transaction([
//       prisma.tournament.delete({
//         where: {
//           id: tournamentId,
//         },
//       }),

//       ...deleteEvents,
//     ]);

//     return tournament;
//   } catch (err: any) {
//     throw err;
//   }
// };

export const deleteTournament = async (tournamentId: number, coach: Coach) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
      },
      include: {
        fixtures: true,
      },
    });

    if (!tournament) {
      throw new ApolloError("Tournament not found");
    }

    if (coach.id !== tournament.organizerCoachId) {
      throw new ApolloError("You are not authorized to delete this tournament");
    }

    // Update the status of the tournament to 'DELETED'
    const updatedTournament = await prisma.tournament.update({
      where: {
        id: tournamentId,
      },
      data: {
        status: "DELETED",
      },
    });

    return updatedTournament;
  } catch (err: any) {
    throw err;
  }
};
// input CreateEventInput {
//   title: String!
//   startDate: String!
//   endDate: String!
//   isAllDay: Boolean!
// }

//CREATE EVENT
export const createEvent = async ({
  title,
  startDate,
  endDate,
  isAllDay,
  schoolID,
  description,
  isInterHouseEvent,
  house1Name,
  house2Name,
  typeOfSport,
}: {
  title: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  schoolID: number;
  description: string;
  isInterHouseEvent: boolean;
  house1Name?: string;
  house2Name?: string;
  typeOfSport?: string;
}) => {
  try {
    let additionalData = {};
    if (isInterHouseEvent && (!house1Name || !house2Name)) {
      throw new ApolloError("House names are required for Inter House Event");
    }

    if (isInterHouseEvent) {
      additionalData = {
        house1Name: house1Name,
        house2Name: house2Name,
        typeOfSport: typeOfSport,
      };
    }

    const event = await prisma.events.create({
      data: {
        title,
        start: startDate,
        end: endDate,
        allDay: isAllDay,
        schoolID,
        typeOfEvent: isInterHouseEvent ? INTER_HOUSE_EVENT : NORMAL_EVENT,
        // details: {
        //   description: description,
        // } as any,
        details: {
          description: description,
          ...additionalData,
        },
        isInterHouseEvent: isInterHouseEvent,
      },
    });

    return event;
  } catch (err: any) {
    throw err;
  }
};
export const editEvent = async ({
  eventId,
  title,
  startDate,
  endDate,
  isAllDay,
  schoolID,
  description,
  house1Name,
  house2Name,
  typeOfSport,
  isInterHouseEvent,
}: {
  eventId: number;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  isAllDay?: boolean;
  schoolID?: number;
  description?: string;
  house1Name?: string;
  house2Name?: string;
  typeOfSport?: string;
  isInterHouseEvent: boolean;
}) => {
  try {
    const existingEvent = await prisma.events.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!existingEvent) {
      throw new Error("Event not found");
    }

    if (existingEvent.typeOfEvent === FIXURE_EVENT) {
      throw new Error("Cannot edit fixture events");
    }

    const data: any = {};

    if (title !== undefined) data.title = title;
    if (startDate !== undefined) data.start = startDate;
    if (endDate !== undefined) data.end = endDate;
    if (isAllDay !== undefined) data.allDay = isAllDay;
    if (schoolID !== undefined) data.schoolID = schoolID;
    if (description !== undefined) data.details = { description };

    if (isInterHouseEvent) {
      if (house1Name !== undefined) data.details = { house1Name };
      if (house2Name !== undefined) data.details = { house2Name };
      if (typeOfSport !== undefined) data.details = { typeOfSport };
    }

    const event = await prisma.events.update({
      where: {
        id: eventId,
      },
      data,
    });

    return event;
  } catch (err: any) {
    throw err;
  }
};
export const deleteEvent = async (eventId: number) => {
  try {
    const event = await prisma.events.findFirst({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new ApolloError("Event not found");
    }

    if (event.typeOfEvent === FIXURE_EVENT) {
      throw new ApolloError(
        "Cannot delete fixture events,try deleting fixture from the fixtures tab"
      );
    }

    await prisma.events.delete({
      where: {
        id: eventId,
      },
    });

    return true;
  } catch (err: any) {
    throw err;
  }
};

export const getAllEvents = async (schoolId: number) => {
  try {
    const events = await prisma.events.findMany({
      where: {
        schoolID: schoolId,
      },
    });

    // title: String!
    // startDate: String!
    // endDate: String!
    // isAllDay: Boolean!

    const result = events.map((event) => {
      return {
        id: event.id,
        title: event.title,
        startDate: event.start,
        endDate: event.end,
        isAllDay: event.allDay,
        details: JSON.stringify(event.details),
        typeOfEvent: event.typeOfEvent,
      };
    });

    return result;
  } catch (err: any) {
    throw err;
  }
};

export const getAllInterHouseEvents = async (schoolId: number) => {
  try {
    const events = await prisma.events.findMany({
      where: {
        schoolID: schoolId,
        typeOfEvent: INTER_HOUSE_EVENT,
      },
    });
    const result = events.map((event) => {
      return {
        id: event.id,
        title: event.title,
        startDate: event.start,
        endDate: event.end,
        isAllDay: event.allDay,
        details: JSON.stringify(event.details),
        typeOfEvent: event.typeOfEvent,
      };
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

    console.log(tournaments, "Tou");

    if (!tournaments) {
      throw new Error("No tournaments found");
    }

    return tournaments.map((tournament) => tournament.tournament);
  } catch (err: any) {
    throw err;
  }
};

export const getFixtureById = async (fixtureId: number) => {
  try {
    const fixture = await prisma.fixture.findFirst({
      where: {
        id: fixtureId,
      },
    });

    if (!fixture) {
      throw new ApolloError("Fixture not found");
    }

    return fixture;
  } catch (err: any) {
    throw err;
  }
};

export const startFixture = async (fixtureId: number) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const fixture = await prisma.fixture.findFirst({
        where: {
          id: fixtureId,
        },
      });

      if (!fixture) {
        throw new ApolloError("Fixture not found");
      }

      if (!fixture.teamParticipationId1 || !fixture.teamParticipationId2) {
        throw new ApolloError("Fixture is not ready to start");
      }

      const updatedFixture = await prisma.fixture.update({
        where: {
          id: fixtureId,
        },
        data: {
          status: FIXTURE_STATUS_LIVE,
        },
      });
      await prisma.matchResult.create({
        data: {
          fixtureID: fixtureId,
          homeTeamScore: "0",
          awayTeamScore: "0",
          finalScore: "0-0",
          confirmationStatus: MATCH_RESULT_CONFIRMATION_STATUS,
          homeTeam: {
            connect: {
              id: fixture.teamParticipationId1,
            },
          },
          awayTeam: {
            connect: {
              id: fixture.teamParticipationId2,
            },
          },
        },
      });

      return updatedFixture;
    });
    return result;
  } catch (err: any) {
    throw err;
  }
};

// const blitzBotQueue = new Queue("blitzBotQueue", {
//   connection: redisConnection,
// });

export const endFixture = async (fixtureId: number, winnerId: number) => {
  try {
    // Find the fixture
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: { tournament: { include: { fixtures: true } } },
    });

    if (!fixture) {
      throw new ApolloError("Fixture not found");
    }

    console.log(fixture, "FIXTURE");

    // Update the fixture with the winner
    await prisma.fixture.update({
      where: { id: fixtureId },
      data: { winnerID: winnerId, isBye: false },
    });

    // Check if there are any remaining fixtures
    const remainingFixtures = await prisma.fixture.count({
      where: {
        tournamentID: fixture.tournamentID,
        winnerID: null,
      },
    });

    console.log(remainingFixtures, "REMAINING FIXTURES");

    if (remainingFixtures === 0) {
      // If there are no remaining fixtures, update the tournament status to 'completed'
      await prisma.tournament.update({
        where: { id: fixture.tournamentID },
        data: { status: "completed" },
      });
      return true;
    }

    const allFixtures = await prisma.fixture.findMany({
      where: {
        tournamentID: fixture.tournamentID,
        round: fixture.round,
      },
      orderBy: {
        id: "asc", // or some other property that determines the order of the fixtures
      },
    });

    // Group the fixtures by 2
    const groupedFixtures = [];
    for (let i = 0; i < allFixtures.length; i += 2) {
      groupedFixtures.push(allFixtures.slice(i, i + 2));
    }

    console.log(groupedFixtures, "GROUPED FIXTURES");
    // For each group, if the winner of the current fixture is in the group, create a new fixture with the winner and the other team in the group
    for (const group of groupedFixtures) {
      // Check if there is an existing fixture with a null value for teamParticipationId2
      const existingFixture = await prisma.fixture.findFirst({
        where: {
          tournamentID: fixture.tournamentID,
          round: fixture.round + 1,
          teamParticipationId2: null,
          NOT: {
            isBye: true,
          },
        },
      });

      if (group.length < 2) {
        if (existingFixture) {
          await prisma.fixture.update({
            where: { id: existingFixture.id },
            data: {
              teamParticipationId2: group[0].winnerID,
              fixtureStartStatus: FIXTURE_STATUS_STARTED,
            },
          });
          return existingFixture;
        } else {
          await prisma.fixture.create({
            data: {
              tournamentID: fixture.tournamentID,
              teamParticipationId1: group[0].winnerID,
              teamParticipationId2: null,
              isBye: true,
              winnerID: group[0].winnerID,
              round: fixture.round + 1,
              fixtureStartStatus: FIXTURE_STATUS_NOT_STARTED,
              startDate: new Date(), // Set this to the appropriate date
              endDate: new Date(), // Set this to the appropriate date
              location: fixture.location, // Set this to the appropriate location
            },
          });

          await prisma.fixture.create({
            data: {
              tournamentID: fixture.tournamentID,
              teamParticipationId1: group[0].winnerID,
              teamParticipationId2: null,
              winnerID: null,
              round: fixture.round + 2,
              fixtureStartStatus: FIXTURE_STATUS_NOT_STARTED,
              startDate: new Date(), // Set this to the appropriate date
              endDate: new Date(), // Set this to the appropriate date
              location: fixture.location, // Set this to the appropriate location
            },
          });

          return true;
        }
      }

      const fixture1 = group[0];
      const fixture2 = group[1];

      if (fixture1.isBye) {
        continue;
      }

      // console.log("GROUP", group, fixtureId);

      if (fixture1.id === fixtureId || fixture2.id === fixtureId) {
        let otherTeamId =
          fixture1.id === fixtureId ? fixture2.winnerID : fixture1.winnerID;

        // If the other fixture is not over yet, set the other team ID to null
        if (!otherTeamId) {
          otherTeamId = null;
        }

        if (existingFixture) {
          console.log("EXISTING FIXTURE HERE");
          // If such a fixture exists, update it with the ID of the winning team
          await prisma.fixture.update({
            where: { id: existingFixture.id },
            data: {
              teamParticipationId2: winnerId,
              fixtureStartStatus: FIXTURE_STATUS_STARTED,
            },
          });

          return existingFixture;
        } else {
          console.log("NO EXISTING FIXTURE");
          // Otherwise, create a new fixture with the winner and the other team
          const newFixture = await prisma.fixture.create({
            data: {
              tournamentID: fixture.tournamentID,
              teamParticipationId1: winnerId,
              teamParticipationId2: otherTeamId,
              round: fixture.round + 1,
              fixtureStartStatus: otherTeamId
                ? FIXTURE_STATUS_STARTED
                : FIXTURE_STATUS_NOT_STARTED,
              startDate: new Date(), // Set this to the appropriate date
              endDate: new Date(), // Set this to the appropriate date
              location: fixture.location, // Set this to the appropriate location
            },
          });

          return newFixture;
        }
      }
    }

    return true;
  } catch (err: any) {
    throw err;
  }
};
// export const endFixture = async (fixtureId: number) => {
//   try {
//     const result = await prisma.$transaction(async (prisma) => {
//       const fixture = await prisma.fixture.findFirst({
//         where: {
//           id: fixtureId,
//         },
//       });

//       if (!fixture) {
//         throw new ApolloError("Fixture not found");
//       }

//       const updatedFixture = await prisma.fixture.update({
//         where: {
//           id: fixtureId,
//         },
//         data: {
//           status: FIXTURE_STATUS_COMPLETED,
//         },
//       });

//       await prisma.matchResult.updateMany({
//         where: {
//           fixtureID: fixtureId,
//         },
//         data: {
//           confirmationStatus: MATCH_RESULT_CONFIRMATION_STATUS,
//         },
//       });

//       return updatedFixture;
//     });

//     return result;
//   } catch (err: any) {
//     throw err;
//   }
// };

export const logFixtureUpdate = async ({
  fixtureId,
  eventType,
  teamId,
  playerId,
  fixture,
  pubsub,
  isATeamWithoutPlayers,
}: {
  fixtureId: number;
  eventType: "Goal" | "YellowCard" | "RedCard";
  teamId: number;
  playerId: number;
  fixture: Fixture;
  pubsub: any;
  isATeamWithoutPlayers: boolean;
}) => {
  try {
    if (playerId === undefined) {
      throw new Error("playerID is undefined");
    }
    const result = await prisma.$transaction(async (prisma) => {
      let scoreLog;
      if (!isATeamWithoutPlayers) {
        await prisma.scoreLog.create({
          data: {
            fixtureID: fixtureId,
            eventType: eventType,
            teamID: teamId,
            playerID: playerId,
          },
        });
      }

      if (
        teamId !== fixture.teamParticipationId1 &&
        teamId !== fixture.teamParticipationId2
      ) {
        throw new ApolloError("Team not found in the fixture");
      }

      // If the event type is a goal, update the match result
      if (eventType === "Goal") {
        const matchResult = await prisma.matchResult.findFirst({
          where: {
            fixtureID: fixtureId,
          },
        });

        console.log(
          fixture.teamParticipationId1,
          fixture.teamParticipationId2,
          teamId
        );

        if (!matchResult) {
          throw new ApolloError("Match result not found");
        }

        const team1Score = fixture.teamParticipationId1 === teamId;
        const team2Score = fixture.teamParticipationId2 === teamId;

        const homeTeamScore = team1Score
          ? parseInt(matchResult.homeTeamScore) + 1
          : parseInt(matchResult.homeTeamScore);

        const awayTeamScore = team2Score
          ? parseInt(matchResult.awayTeamScore) + 1
          : parseInt(matchResult.awayTeamScore);

        const finalScore = `${homeTeamScore}-${awayTeamScore}`;

        const matchID = await prisma.matchResult.findFirst({
          where: {
            fixtureID: fixtureId,
          },
        });

        await prisma.matchResult.update({
          where: {
            id: matchID?.id,
          },
          data: {
            homeTeamScore: homeTeamScore.toString(),
            awayTeamScore: awayTeamScore.toString(),
            finalScore: finalScore,
          },
        });
      }

      pubsub.publish(`SCORE_UPDATE_${fixtureId}`, {
        scoreUpdates: {
          fixtureId: fixtureId,
          eventType: eventType,
          teamId: teamId,
          playerId: playerId || 0,
        },
      });

      return scoreLog;
    });

    return result;
  } catch (err: any) {
    throw err;
  }
};

export const getWholeFixtureDetails = async (fixtureId: number) => {
  try {
    const fixture = await prisma.fixture.findFirst({
      where: {
        id: fixtureId,
      },
      include: {
        teamParticipation1: {
          include: {
            team: true,
          },
        },
        teamParticipation2: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!fixture) {
      throw new ApolloError("Fixture not found");
    }

    const matchResults = await prisma.matchResult.findFirst({
      where: {
        fixtureID: fixtureId,
      },
    });

    console.log(fixture, matchResults, "FIXTURE DATA");

    return {
      fixture,
      matchResults,
    };
  } catch (err: any) {
    throw err;
  }
};

export const getLineUps = async (fixtureId: number) => {
  try {
    console.log(fixtureId, "FIXTURE ID");
    // GETTING THE DATA OF BOTH THE TEAMS PARTICIPATING IN THE FIXTURE
    const fixture = await prisma.fixture.findFirst({
      where: {
        id: Number(fixtureId),
      },
      include: {
        teamParticipation1: {
          include: {
            team: true,
          },
        },
        teamParticipation2: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!fixture) {
      throw new Error(`Fixture not found for the specified id ${fixtureId}`);
    }

    if (!fixture.teamParticipation1 || !fixture.teamParticipation2) {
      throw new Error("One or both teams are not participating in the fixture");
    }

    // GETTING THE STUDENT DATA OF THE TEAM

    const team1 = await prisma.studentOnTeam.findMany({
      where: {
        teamId: fixture.teamParticipation1.teamId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            age: true,
          },
        },
      },
    });

    const team2 = await prisma.studentOnTeam.findMany({
      where: {
        teamId: fixture.teamParticipation2.teamId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            age: true,
          },
        },
      },
    });

    const resultData = new Map();

    resultData.set(fixture.teamParticipation1.teamId, {
      name: fixture.teamParticipation1.team.name,
      students: team1,
    });

    resultData.set(fixture.teamParticipation2.teamId, {
      name: fixture.teamParticipation2.team.name,
      students: team2,
    });

    return resultData;
  } catch (err: any) {
    throw err;
  }
};

export const makeStudentModerator = async (studentId: number) => {
  try {
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      throw new ApolloError("Student not found");
    }

    const updatedStudent = await prisma.student.update({
      where: {
        id: studentId,
      },
      data: {
        moderatorAccess: true,
      },
    });

    return updatedStudent;
  } catch (err: any) {
    throw err;
  }
};

// type CardsGivenTo {
//   playerId: Int!
//   playerName: String!
//   cardType: String!
// }

// type MatchDetailsAndScoreForTeam {
//   teamID: Int!
//   teamName: String!
//   score: String!
//   cardsGivenTo: [CardsGivenTo!]!
// }

// type MatchDetailsAndScore {
//   fixtureId: Int!
//   teamDetails: [MatchDetailsAndScoreForTeam]!
//   score: String!
// }

export const getMatchDetails = async (fixtureId: number) => {
  try {
    const fixture = await prisma.fixture.findFirst({
      where: {
        id: fixtureId,
      },
      include: {
        teamParticipation1: {
          include: {
            team: true,
          },
        },
        teamParticipation2: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!fixture) {
      throw new ApolloError("Fixture not found");
    }

    if (!fixture.teamParticipation1 || !fixture.teamParticipation2) {
      throw new ApolloError(
        "One or both teams are not participating in the fixture"
      );
    }

    const matchResults = await prisma.matchResult.findFirst({
      where: {
        fixtureID: fixtureId,
      },
    });

    if (!matchResults) {
      throw new ApolloError("Match result not found");
    }

    const matchEvents = await prisma.scoreLog.findMany({
      where: {
        fixtureID: fixtureId,
        eventType: {
          in: ["YellowCard", "RedCard", "Goal"],
        },
      },
      include: {
        student: true,
      },
    });

    console.log(matchEvents, "MATCH EVENTS");

    const team1Cards = matchEvents.filter(
      (card) => card.teamID === fixture.teamParticipationId1
    );
    const team2Cards = matchEvents.filter(
      (card) => card.teamID === fixture.teamParticipationId2
    );

    const team1Score =
      fixture.teamParticipationId1 === matchResults.homeTeamID
        ? matchResults.homeTeamScore
        : matchResults.awayTeamScore;
    const team2Score =
      fixture.teamParticipationId2 === matchResults.awayTeamID
        ? matchResults.awayTeamScore
        : matchResults.homeTeamScore;
    const team1 = {
      teamID: fixture.teamParticipationId1,
      teamName: fixture.teamParticipation1.team.name,
      score: team1Score,
      matchEvents: team1Cards.map((card) => {
        return {
          playerId: card.student.id,
          playerName: card.student.name,
          eventType: card.eventType,
        };
      }),
    };

    const team2 = {
      teamID: fixture.teamParticipationId2,
      teamName: fixture.teamParticipation2.team.name,
      score: team2Score,
      matchEvents: team2Cards.map((card) => {
        return {
          playerId: card.student.id,
          playerName: card.student.name,
          eventType: card.eventType,
        };
      }),
    };

    console.log(team1, team2, "TEAM DATA");

    return {
      fixtureId: fixtureId,
      teamDetails: [team1, team2],
      score: matchResults.finalScore,
    };
  } catch (err: any) {
    throw err;
  }
};
