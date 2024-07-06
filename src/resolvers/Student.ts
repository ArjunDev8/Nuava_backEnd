import { IResolvers } from "@graphql-tools/utils";
import * as dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
import { ApolloError } from "apollo-server-express";
import {
  checkPassword,
  checkStudentExists,
  createStudent,
  findOTPRecord,
  findStudent,
  findStudentByID,
  invalidateOTPs,
  sendStudentOtp,
  verifyJWTToken,
} from "../services/student";
import { OTP_PURPOSE_REGISTER, STUDENT_ROLE } from "../constants";
import { generateJWTToken, validatePassword } from "../helper/utils";
dotenv.config();

const StudentResolvers: IResolvers = {
  Query: {
    student: async (_, __, { auth }) => {
      try {
        const { id, role } = verifyJWTToken(
          auth,
          process.env.JWT_SECRET_KEY as string
        );

        if (role !== STUDENT_ROLE) {
          throw new Error("Unauthorized to get student details");
        }

        const student = await findStudentByID(id);

        if (!student) {
          throw new Error("Student not found");
        }

        return student;
      } catch (err: any) {
        console.log("Error in student resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },
  },
  Mutation: {
    sendStudentEmailOTP: async (_, { input }) => {
      try {
        const { email, purpose } = input;

        const lowerCaseEmail = email.toLowerCase();
        // TODO: VALIDATE EMAIL based on schools in the db
        await sendStudentOtp(lowerCaseEmail, purpose);

        return {
          status: true,
          message: "Email sent successfully",
        };
      } catch (err: any) {
        console.log("Error in sendEmailOTP resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    verifyEmailOTP: async (_, { input }) => {
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
        console.log("Error in verifyEmailOTP resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    registerStudent: async (_, { input }, { auth }) => {
      try {
        console.log(auth);
        verifyJWTToken(auth, process.env.JWT_SECRET_KEY as string);
        const lcEmail = input.email.toLowerCase();

        const student = await findStudent(lcEmail);

        if (student) {
          throw new Error("Email already exists");
        }

        const registeredStudent = await createStudent(input);

        let token = generateJWTToken({
          email: registeredStudent.email,
          id: registeredStudent.id,
          role: STUDENT_ROLE,
        });

        return {
          status: true,
          message: "Student registered successfully",
          token,
        };
      } catch (err: any) {
        console.log("Error in registerStudent resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },

    loginStudent: async (_, { input }) => {
      try {
        const email = input.email.toLowerCase();
        const student = await checkStudentExists(email);
        const token = await checkPassword(student, input.password);
        return {
          status: true,
          message: "Student logged in successfully",
          token,
        };
      } catch (err: any) {
        console.log("Error in loginStudent resolver: ", err.message);
        throw new ApolloError(err.message);
      }
    },
  },
};

export default StudentResolvers;
