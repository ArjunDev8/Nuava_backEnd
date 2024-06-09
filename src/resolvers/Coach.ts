import { IResolvers } from "@graphql-tools/utils";
import jsonwebtoken from "jsonwebtoken";
import {
  checkPassword,
  checkStudentExists,
  findOTPRecord,
  invalidateOTPs,
  verifyJWTToken,
} from "../services/student";
import { ApolloError } from "apollo-server-express";
import {
  checkCoachExists,
  createCoach,
  findCoach,
  findCoachByID,
  sendCoachOtp,
  validatePasskey,
} from "../services/coach";
import { COACH_ROLE, OTP_PURPOSE_REGISTER } from "../constants";
import { generateJWTToken, hashedPassword } from "../helper/utils";

const CoachResolvers: IResolvers = {
  Query: {
    coach: async (_, __, { auth }) => {
      try {
        const { id } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );
        const coach = await findCoachByID(id);

        if (!coach) {
          throw new Error("Coach not found");
        }

        return coach;
      } catch (err: any) {
        console.log("Error in coach resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },
  },

  Mutation: {
    sendCoachEmailOTP: async (_, { input }) => {
      try {
        const { OTPInputs, passkey } = input;
        const { email, purpose } = OTPInputs;

        const schoolDomain = email.split("@")[1];
        const lowerCaseEmail = email.toLowerCase();

        await validatePasskey(passkey, schoolDomain);
        await sendCoachOtp(lowerCaseEmail, purpose);

        return {
          status: true,
          message: "Email sent successfully",
        };
      } catch (err: any) {
        console.log("Error in sendEmailOTP resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    verifyCoachEmailOTP: async (_, { input }) => {
      try {
        const { email, otp } = input;
        const lcInput = email.toLowerCase();
        const purpose = await findOTPRecord(lcInput, otp);

        if (purpose !== OTP_PURPOSE_REGISTER) {
          throw new Error("Invalid OTP");
        }

        await invalidateOTPs(lcInput);

        const tempToken = jsonwebtoken.sign(
          { email: lcInput },
          process.env.JWT_SECRET_KEY as string,
          {
            expiresIn: "15m",
          }
        );

        return {
          status: true,
          message: "Email verified successfully",
          token: tempToken,
        };
      } catch (err: any) {
        console.log("Error in verifyCoachEmailOTP resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    registerCoach: async (_, { input }, { auth }) => {
      verifyJWTToken(auth, process.env.JWT_SECRET_KEY as string);
      const lcEmail = input.email.toLowerCase();

      const coach = await findCoach(lcEmail);
      if (coach) {
        throw new Error("Coach already exists");
      }

      const registeredCoach = await createCoach(input);

      let token = generateJWTToken({
        email: registeredCoach.email,
        id: registeredCoach.id,
        role: COACH_ROLE,
      });

      return {
        status: true,
        message: "Coach registered successfully",
        token,
      };
    },

    loginCoach: async (_, { input }) => {
      try {
        const email = input.email.toLowerCase();
        const coach = await checkCoachExists(email);
        const token = await checkPassword(coach, input.password);
        return {
          status: true,
          message: "Coach logged in successfull",
          token,
        };
      } catch (err: any) {
        console.log("Error in loginCoach resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },
  },
};

export default CoachResolvers;
