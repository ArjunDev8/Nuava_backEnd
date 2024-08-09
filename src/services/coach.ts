import { Coach, Student } from "@prisma/client";
import * as crypto from "crypto";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import {
  FORGOT_PASSWORD_TOKEN_TIMEOUT,
  OTP_PURPOSE_FORGOT_PASSWORD,
  OTP_PURPOSE_REGISTER,
} from "../constants";
import { prisma } from "../db";
import { createOTP, invalidateOTPs, verifyJWTToken } from "./student";
import { hashedPassword, isEmail } from "../helper/utils";
import { typesOfSport } from "./team";
import { emailQueue } from "./email";

export const sendCoachOtp = async (email: string, purpose: string) => {
  try {
    const coach = await findCoach(email);
    if (coach) {
      throw new Error("Email already exists");
    } else {
      await invalidateOTPs(email);
      const otp = await createOTP(email, purpose);

      emailQueue.add("sendOtpEmail", {
        userName: email,
        userEmail: email,
        otp: otp.otp,
      });
      console.log("OTP sent to email");
    }

    return true;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const findCoach = async (email: string): Promise<Coach | null> => {
  try {
    const Coach = await prisma.coach.findFirst({
      where: {
        email,
      },
    });

    return Coach;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const validatePasskey = async (
  passkey: string,
  schoolDomain: string
): Promise<boolean> => {
  try {
    const passkeyRecord = await prisma.school.findFirst({
      where: {
        domain: schoolDomain,
      },
    });

    console.log(passkey, passkeyRecord);

    if (!passkeyRecord) {
      throw new Error("School not found");
    }

    const isValid = await bcrypt.compare(passkey, passkeyRecord.passkey || "");

    if (!isValid) {
      throw new Error("Invalid passkey");
    }

    return true;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

export const createCoach = async (input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<Coach> => {
  try {
    const { email, password, name, phone } = input;
    const lcEmail = email.toLowerCase();

    const schoolID = await prisma.school.findFirst({
      where: {
        domain: email.split("@")[1],
      },
      select: {
        id: true,
      },
    });

    const isEmailValid = isEmail(lcEmail);

    // TODO: VALIDATE THE EMAIL WITH THE REGISTERED SCHOOL DOMAINS
    if (!isEmailValid) {
      throw new Error("Invalid email");
    }

    const hashPassKey = hashedPassword(password);

    const coach = await prisma.coach.create({
      data: {
        email,
        password: hashPassKey,
        name,
        phone,
        schoolID: schoolID?.id || 0,
      },
    });

    return coach;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

export const checkCoachExists = async (email: string): Promise<Coach> => {
  const coachRecord = await prisma.coach.findFirst({
    where: {
      email,
    },
  });

  if (!coachRecord) {
    throw new Error("Invalid username or password");
  }

  return coachRecord;
};

export const findCoachByID = async (id: number): Promise<Coach | null> => {
  try {
    const coach = await prisma.coach.findFirst({
      where: {
        id,
      },
    });

    return coach;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

export const generateForgotPasswordToken = async (
  user: Coach | Student,
  userType: UserType
): Promise<string> => {
  const token = crypto.randomBytes(32).toString("hex");
  const email = user.email;

  if (userType === UserEnum.STUDENT) {
    await prisma.student.update({
      where: {
        id: user.id,
      },
      data: {
        token,
      },
    });
  } else {
    await prisma.coach.update({
      where: {
        id: user.id,
      },
      data: {
        token,
      },
    });
  }

  const jwtToken = jsonwebtoken.sign(
    {
      id: email,
      token,
    },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: FORGOT_PASSWORD_TOKEN_TIMEOUT,
    }
  );
  return jwtToken;
};

export enum UserEnum {
  COACH = "COACH",
  STUDENT = "STUDENT",
}

export type UserType = UserEnum.COACH | UserEnum.STUDENT;

interface IResetPassword {
  token: string;
  password: string;
  typeOfUser: UserEnum;
}

export const checkAndSetPassword = async (
  input: IResetPassword
): Promise<void> => {
  const { token, password } = input;
  if (token && password) {
    const { token: resetToken } = verifyJWTToken(
      token,
      process.env.JWT_SECRET_KEY as string
    );

    if (resetToken) {
      let user: Coach | Student | null = null;

      if (input.typeOfUser === UserEnum.STUDENT) {
        console.log("Inside reset", resetToken, input.typeOfUser);
        user = await prisma.student.findFirst({
          where: {
            token: resetToken,
          },
        });
      } else if (input.typeOfUser === UserEnum.COACH) {
        user = await prisma.coach.findFirst({
          where: {
            token: resetToken,
          },
        });
      }

      console.log("Outside reset", resetToken, user);

      if (user) {
        const hashPassKey = hashedPassword(password);

        console.log("Inside User", user);

        if (input.typeOfUser === UserEnum.STUDENT) {
          await prisma.student.update({
            where: {
              id: user.id,
            },
            data: {
              password: hashPassKey,
            },
          });
        } else if (input.typeOfUser === UserEnum.COACH) {
          await prisma.coach.update({
            where: {
              id: user.id,
            },
            data: {
              password: hashPassKey,
            },
          });
        }

        return;
      }
    }
  }

  throw new Error("Invalid or expired link to reset password");
};

export const getUserType = async (email: string): Promise<UserEnum> => {
  const lcEmail = email.toLowerCase();

  const coach = await findCoach(lcEmail);

  if (coach) {
    return UserEnum.COACH;
  }

  return UserEnum.STUDENT;
};

export const getAllStudents = async ({
  schoolID,
}: {
  schoolID: number;
}): Promise<Array<Student>> => {
  try {
    const students = await prisma.student.findMany({
      where: {
        schoolID,
      },
    });

    return students;
  } catch (err: any) {
    throw err;
  }
};

export const getAllCoaches = async ({
  schoolID,
}: {
  schoolID: number;
}): Promise<Array<Coach>> => {
  try {
    const coaches = await prisma.coach.findMany({
      where: {
        schoolID,
      },
    });

    console.log(coaches);

    return coaches;
  } catch (err: any) {
    throw err;
  }
};
