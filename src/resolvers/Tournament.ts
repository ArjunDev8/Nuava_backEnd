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
import { createTournament, getAllTournaments } from "../services/tournament";

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
  },

  Mutation: {
    // Create Tournament
    createTournament: async (_, { input }, { auth }) => {
      try {
        const { id } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );
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
  },
};

export default TournamentResolvers;