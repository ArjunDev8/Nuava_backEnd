import { IResolvers } from "@graphql-tools/utils";
import { ApolloError } from "apollo-server-express";
import { findCoachByID, UserEnum } from "../services/coach";
import { findStudentByID, verifyJWTToken } from "../services/student";
import {
  createEvent,
  createTournament,
  deleteEvent,
  deleteFixture,
  deleteTournament,
  editEvent,
  editFixture,
  editTournament,
  endFixture,
  getAllEvents,
  getAllFixtureForSchool,
  getAllInterHouseEvents,
  getAllLiveMatches,
  getAllTournaments,
  getBracket,
  getFixtureById,
  getMatchDetails,
  getMatchDetailsForCompletedGamesOfTournament,
  logFixtureUpdate,
  startFixture,
  swapTeamsInFixture,
} from "../services/tournament";
import { pubsub } from "../services/queue";
import { log } from "console";
import { Coach, Student } from "@prisma/client";

const TournamentResolvers: IResolvers = {
  Query: {
    getAllTournaments: async (_, __, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        console.log("id", id, role);

        let user = null;

        if (role === UserEnum.COACH) {
          user = await findCoachByID(id);
        } else {
          user = await findStudentByID(id);
        }

        if (!user) {
          throw new Error("User not found");
        }

        const tournaments = await getAllTournaments(user.schoolID);

        return tournaments;
      } catch (err: any) {
        console.log("Error in getAllTournaments resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },
    getBrackets: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        console.log("id", id, role);

        let user = null;

        if (role === UserEnum.COACH) {
          user = await findCoachByID(id);
        } else {
          user = await findStudentByID(id);
        }

        if (!user) {
          throw new Error("User not found");
        }

        const { tournamentId } = input;
        console.log(tournamentId, "tournament");

        const tournament = await getBracket(tournamentId);

        return tournament;
      } catch (err: any) {
        console.log("Error in getBracket resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    getBracketsWithoutAuth: async (_, { input }) => {
      try {
        const { tournamentId } = input;
        console.log(tournamentId, "tournament");

        const tournament = await getBracket(tournamentId);

        return tournament;
      } catch (err: any) {
        console.log("Error in getBracket resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },
    getAllEvents: async (_, __, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        console.log("id", id, role);

        let user = null;

        if (role === UserEnum.COACH) {
          user = await findCoachByID(id);
        } else {
          user = await findStudentByID(id);
        }

        if (!user) {
          throw new Error("User not found");
        }

        const events = await getAllEvents(user.schoolID);

        return events;
      } catch (err: any) {
        console.log("Error in getAllEvents resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    getAllLiveMatches: async (_, __, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        console.log("id", id, role);

        let user = null;

        if (role === UserEnum.COACH) {
          user = await findCoachByID(id);
        } else {
          user = await findStudentByID(id);
        }

        if (!user) {
          throw new Error("User not found");
        }

        const fixtures = await getAllLiveMatches(user.schoolID);

        return fixtures;
      } catch (err: any) {
        console.log("Error in getAllLiveMatches resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },
    getAllInterHouseEvents: async (_, __, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        console.log("id", id, role);

        let user = null;

        if (role === UserEnum.COACH) {
          user = await findCoachByID(id);
        } else {
          user = await findStudentByID(id);
        }

        if (!user) {
          throw new Error("User not found");
        }

        const events = await getAllInterHouseEvents(user.schoolID);

        return events;
      } catch (err: any) {
        console.log("Error in getAllInterHouseEvents resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    getMatchDetailsAndScore: async (_, { fixtureId }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        let user = null;

        if (role === UserEnum.COACH) {
          user = await findCoachByID(id);
        } else {
          user = await findStudentByID(id);
        }

        if (!user) {
          throw new Error("User not found");
        }

        const matchDetails = await getMatchDetails(Number(fixtureId));

        return matchDetails;
      } catch (err: any) {
        console.log("Error in getMatchDetailsAndScore resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    getAllFixturesForSchool: async (_, { schoolId }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        let user = null;

        if (role === UserEnum.COACH) {
          user = await findCoachByID(id);
        } else {
          user = await findStudentByID(id);
        }

        if (!user) {
          throw new Error("User not found");
        }

        console.log("user", user.schoolID);

        const fixtures = await getAllFixtureForSchool(user.schoolID);

        return fixtures;
      } catch (err: any) {
        console.log("Error in getAllFixturesForSchool resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    getFixtureResults: async (_, __, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        let user = null;

        if (role === UserEnum.COACH) {
          user = await findCoachByID(id);
        } else {
          user = await findStudentByID(id);
        }

        if (!user) {
          throw new Error("User not found");
        }

        console.log(user.schoolID, "SCHOOL ID");
        const results = await getMatchDetailsForCompletedGamesOfTournament(
          user.schoolID
        );

        return results;
      } catch (err: any) {
        console.log("Error in getFixtureResults resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },
  },

  Mutation: {
    // Create Tournament
    createTournament: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to create tournament");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const tournament = await createTournament(input, coach);

        return {
          status: true,
          message: "Tournament created successfully",
          tournament,
        };
      } catch (err: any) {
        console.log("Error in createTournament resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    editTournament: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to edit tournament");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const tournament = await editTournament(
          input,
          coach,
          input.tournamentID
        );

        return {
          status: true,
          message: "Tournament updated successfully",
          tournament,
        };
      } catch (err: any) {
        console.log("Error in editTournament resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    deleteTournament: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to delete tournament");
        }
        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const { id: tournamentID } = input;

        await deleteTournament(tournamentID, coach);

        return {
          status: true,
          message: "Tournament deleted successfully",
        };
      } catch (err: any) {
        console.log("Error in deleteTournament resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    swapTeams: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        console.log("id", id, role);

        let user: Coach | Student | null = null;

        if (role === UserEnum.COACH) {
          user = (await findCoachByID(id)) as Coach;
        } else {
          user = (await findStudentByID(id)) as Student;
        }

        if (!user) {
          throw new Error("User not found");
        }

        if ("moderatorAccess" in user) {
          if (role === UserEnum.STUDENT && !user.moderatorAccess) {
            throw new Error("Unauthorized to end fixture");
          }
        }

        const { fixtureId1, fixtureId2, team1Id, team2Id } = input;

        // Swap teams
        await swapTeamsInFixture({
          fixtureId1,
          fixtureId2,
          team1Id,
          team2Id,
        });

        return {
          status: true,
          message: "Teams swapped successfully",
        };
      } catch (err: any) {
        console.log("Error in swapTeams resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    deleteFixture: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to delete fixture");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const { fixtureId } = input;

        // Delete fixture
        await deleteFixture(fixtureId, coach);

        return {
          status: true,
          message: "Fixture deleted successfully",
        };
      } catch (err: any) {
        console.log("Error in deleteFixture resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    editFixture: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to delete fixture");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const { fixtureId, fixtureStartTime, fixtureEndTime, fixtureLocation } =
          input;
        // Delete fixture
        await editFixture({
          fixtureId,
          fixtureStartTime,
          fixtureEndTime,
          fixtureLocation,
        });

        return {
          status: true,
          message: "Fixture edited successfully",
        };
      } catch (err: any) {
        console.log("Error in edited resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    createEvent: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to create event");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const event = await createEvent({
          ...input,
          schoolID: coach.schoolID,
          isInterHouseEvent: false,
        });

        return {
          status: true,
          message: "Event created successfully",
        };
      } catch (err: any) {
        console.log("Error in createTournament resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    createInterHouseEvent: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to create event");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const event = await createEvent({
          ...input,
          schoolID: coach.schoolID,
          isInterHouseEvent: true,
        });

        return {
          status: true,
          message: "Event created successfully",
        };
      } catch (err: any) {
        console.log("Error in createTournament resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    editEvent: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to edit event");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const event = await editEvent({
          ...input,
          schoolID: coach.schoolID,
          isInterHouseEvent: false,
        });

        return {
          status: true,
          message: "Event updated successfully",
        };
      } catch (err: any) {
        console.log("Error in editEvent resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    editInterHouseEvent: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to edit event");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const event = await editEvent({
          ...input,
          schoolID: coach.schoolID,
          isInterHouseEvent: true,
        });

        return {
          status: true,
          message: "Event updated successfully",
        };
      } catch (err: any) {
        console.log("Error in editEvent resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    deleteAnyEvent: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to delete event");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        const { eventId } = input;

        await deleteEvent(eventId);

        return {
          status: true,
          message: "Event deleted successfully",
        };
      } catch (err: any) {
        console.log("Error in deleteEvent resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    startFixture: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );
        const { fixtureId } = input;

        console.log("id", id, role);

        let user: Coach | Student | null = null;

        if (role === UserEnum.COACH) {
          user = (await findCoachByID(id)) as Coach;
        } else {
          user = (await findStudentByID(id)) as Student;
        }

        if (!user) {
          throw new Error("User not found");
        }

        if ("moderatorAccess" in user) {
          if (role === UserEnum.STUDENT && !user.moderatorAccess) {
            throw new Error("Unauthorized to end fixture");
          }
        }

        await startFixture(fixtureId);

        return {
          status: true,
          message: "Fixture started successfully",
        };
      } catch (err: any) {
        console.log("Error in startFixture resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    endFixture: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );
        const { fixtureId, winnerID } = input;

        console.log("id", id, role);

        let user: Coach | Student | null = null;

        if (role === UserEnum.COACH) {
          user = (await findCoachByID(id)) as Coach;
        } else {
          user = (await findStudentByID(id)) as Student;
        }

        if (!user) {
          throw new Error("User not found");
        }

        if ("moderatorAccess" in user) {
          if (role === UserEnum.STUDENT && !user.moderatorAccess) {
            throw new Error("Unauthorized to end fixture");
          }
        }

        await endFixture(fixtureId, winnerID);

        return {
          status: true,
          message: "Fixture ended successfully",
        };
      } catch (err: any) {
        console.log("Error in endFixture resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    fixtureUpdates: async (_, { input }, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        console.log("id", id, role);

        let user: Coach | Student | null = null;

        if (role === UserEnum.COACH) {
          user = (await findCoachByID(id)) as Coach;
        } else {
          user = (await findStudentByID(id)) as Student;
        }

        if (!user) {
          throw new Error("User not found");
        }

        if ("moderatorAccess" in user) {
          if (role === UserEnum.STUDENT && !user.moderatorAccess) {
            throw new Error("Unauthorized to end fixture");
          }
        }

        const {
          fixtureId,
          eventType,
          teamId,
          playerId,
          isATeamWithoutPlayers,
        } = input;

        const fixture = await getFixtureById(fixtureId);

        await logFixtureUpdate({
          fixtureId,
          eventType,
          teamId,
          playerId,
          fixture,
          pubsub,
          isATeamWithoutPlayers,
        });

        return {
          status: true,
          message: "Score updated successfully",
        };
      } catch (err: any) {
        console.log("Error in scoreUpdate resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },
  },
  Subscription: {
    scoreUpdates: {
      subscribe: (_, { input }) => {
        const { fixtureId } = input;
        return pubsub.asyncIterator(`SCORE_UPDATE_${fixtureId}`);
      },
    },
  },
};

export default TournamentResolvers;
