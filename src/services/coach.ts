import { Coach } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  OTP_PURPOSE_FORGOT_PASSWORD,
  OTP_PURPOSE_REGISTER,
} from "../constants";
import { prisma } from "../db";
import { createOTP, invalidateOTPs } from "./student";
import { hashedPassword, isEmail } from "../helper/utils";

// export const sendStudentOtp = async (email: string, purpose: string) => {
//     try {
//       if (purpose === OTP_PURPOSE_REGISTER) {
//         const student = await findStudent(email);
//         if (student) {
//           throw new Error("Email already exists");
//         } else {
//           await invalidateOTPs(email);
//           const otp = await createOTP(email, purpose);
//           console.log("OTP sent to email");
//         }
//       } else if (purpose === OTP_PURPOSE_FORGOT_PASSWORD) {
//         const student = await findStudent(email);
//         if (!student) {
//           throw new Error("Student not found");
//         } else {
//           await invalidateOTPs(email);
//           const otp = await createOTP(email, purpose);

//           console.log("OTP sent to email");
//         }
//       }

//       return true;
//     } catch (e: any) {
//       throw e;
//     }
//   };

export const sendCoachOtp = async (email: string, purpose: string) => {
  try {
    if (purpose === OTP_PURPOSE_REGISTER) {
      const coach = await findCoach(email);
      if (coach) {
        throw new Error("Email already exists");
      } else {
        await invalidateOTPs(email);
        const otp = await createOTP(email, purpose);
        console.log("OTP sent to email");
      }
    } else if (purpose === OTP_PURPOSE_FORGOT_PASSWORD) {
      const coach = await findCoach(email);
      if (!coach) {
        throw new Error("Coach not found");
      } else {
        await invalidateOTPs(email);
        const otp = await createOTP(email, purpose);

        console.log("OTP sent to email");
      }
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
