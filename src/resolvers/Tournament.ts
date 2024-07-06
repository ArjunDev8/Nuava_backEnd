import { IResolvers } from "@graphql-tools/utils";
import jsonwebtoken from "jsonwebtoken";
import {
  checkPassword,
  checkStudentExists,
  findOTPRecord,
  findStudent,
  findStudentByID,
  invalidateOTPs,
  verifyJWTToken,
} from "../services/student";
import { ApolloError } from "apollo-server-express";
import {
  checkAndSetPassword,
  checkCoachExists,
  createCoach,
  findCoach,
  findCoachByID,
  generateForgotPasswordToken,
  getUserType,
  sendCoachOtp,
  UserEnum,
  validatePasskey,
} from "../services/coach";
import { COACH_ROLE, OTP_PURPOSE_REGISTER } from "../constants";
import { generateJWTToken, hashedPassword } from "../helper/utils";
import { emailQueue, getEmailTemplate } from "../services/email";
import {
  createEvent,
  createTournament,
  deleteEvent,
  deleteFixture,
  deleteTournament,
  editEvent,
  editTournament,
  getAllEvents,
  getAllTournaments,
  getBracket,
  swapTeamsInFixture,
} from "../services/tournament";

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

        const { tournamentID } = input;

        const tournament = await getBracket(tournamentID);

        console.log(tournament, "tournament");

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

        if (role !== UserEnum.COACH) {
          throw new Error("Unauthorized to swap teams");
        }

        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
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
  },
};

export default TournamentResolvers;
