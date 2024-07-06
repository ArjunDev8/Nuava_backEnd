import { ApolloError } from "apollo-server-errors";
import { prisma } from "../db";
import { Coach, School, Tournament, TournamentDay } from "@prisma/client";
import { typesOfSport } from "./team";
import {
  BYESOPPONENT,
  FIXURE_EVENT,
  INTER_HOUSE_EVENT,
  NORMAL_EVENT,
} from "../constants";
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
          tournamentID: tournament.id,
          startDate: currentTime,
          endDate: endTime,
          location: "TBD",
        },
      });

      //CREATE A ENTRY IN THE EVENTS TABLE
      const event = await transaction.events.create({
        data: {
          title: `${participatingTeams[i].name} vs ${
            participatingTeams[i + 1].name
          }`,
          start: currentTime,
          end: endTime,
          allDay: false,
          schoolID: coach.schoolID,
          typeOfEvent: FIXURE_EVENT,
          details: {
            description: `Match between ${participatingTeams[i].name} and ${
              participatingTeams[i + 1].name
            }`,
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
        tournamentID: tournament.id,
        startDate: currentTime,
        endDate: endTime,
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

export const getBracket = async (tournamentId: number) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
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
        },
      },
    });

    if (!tournament) {
      throw new ApolloError("Tournament not found");
    }

    const brackets = tournament.fixtures.map((fixture, index) => {
      const team1IsWinner = fixture.isBye
        ? true
        : fixture.winnerID === fixture.teamParticipation1.teamId;
      const team2IsWinner = fixture.isBye
        ? false
        : fixture.winnerID === fixture.teamParticipation2.teamId;

      return {
        id: fixture.id,
        name: `${fixture.teamParticipation1.team.name} vs ${fixture.teamParticipation2.team.name}`,
        nextMatchId: tournament.fixtures[index + 1]
          ? tournament.fixtures[index + 1].id
          : null,
        tournamentRoundText: fixture.round.toString(), // Using the round field to determine the round text
        startTime: fixture.startDate.toISOString(),
        state: fixture.isBye ? "DONE" : fixture.winnerID ? "DONE" : "PENDING", // If it's a bye or a winner is set, the state is "DONE". Otherwise, it's "PENDING".
        participants: [
          {
            id: fixture.teamParticipation1.teamId.toString(),
            name: fixture.teamParticipation1.team.name,
            resultText: team1IsWinner ? "WON" : null, // If team 1 is the winner, set the result text to "WON". Otherwise, set it to null.
            isWinner: team1IsWinner,
            status: fixture.isBye ? "WALK_OVER" : null, // If it's a bye, set the status to "WALK_OVER". Otherwise, you need to determine how to set this.
          },
          {
            id: fixture.teamParticipation2.teamId.toString(),
            name: fixture.teamParticipation2.team.name,
            resultText: team2IsWinner ? "WON" : null, // If team 2 is the winner, set the result text to "WON". Otherwise, set it to null.
            isWinner: team2IsWinner,
            status: fixture.isBye ? "NO_PARTY" : null, // If it's a bye, set the status to "NO_PARTY". Otherwise, you need to determine how to set this.
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

//DELETE TOURNAMENT
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
    console.log(coach.id, tournament.organizerCoachId, tournamentId);

    if (coach.id !== tournament.organizerCoachId) {
      throw new ApolloError("You are not authorized to delete this tournament");
    }

    const fixtureIDs = tournament.fixtures.map((fixture) => fixture.id);

    const events = await prisma.events.findMany();

    const eventsToDelete = events.filter((event: any) =>
      fixtureIDs.includes(event.details.fixtureID)
    );

    const deleteEvents = eventsToDelete.map((event) =>
      prisma.events.delete({
        where: {
          id: event.id,
        },
      })
    );

    await prisma.$transaction([
      prisma.tournament.delete({
        where: {
          id: tournamentId,
        },
      }),

      ...deleteEvents,
    ]);

    return tournament;
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
