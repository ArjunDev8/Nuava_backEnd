import { Coach, Student } from "@prisma/client";
import jsonwebtoken from "jsonwebtoken";
import {
  COACH_ROLE,
  OTP_PURPOSE_FORGOT_PASSWORD,
  OTP_PURPOSE_REGISTER,
  OTP_SENT_STATUS,
  OTP_USED_STATUS,
  STUDENT_ROLE,
} from "../constants";
import { prisma } from "../db";
import { hashedPassword, isEmail } from "../helper/utils";
import bcrypt from "bcrypt";

export const signJWTToken = (
  email: string,
  id: number,
  name: string,
  secret: string
) => {
  const token = jsonwebtoken.sign(
    {
      id,
      email,
      name,
    },
    secret
  );

  return token;
};

export const verifyJWTToken = (auth: any, secret: string) => {
  if (!auth) {
    throw new Error("Authentication information not specified.");
  }

  const decoded = jsonwebtoken.verify(auth, secret);

  const { id, email } = <any>decoded || {};

  if (!id && !email) {
    throw new Error("Authentication information not specified.");
  }

  // const timestamp = timestampInMins();

  // redisConnection.sadd(timestamp, id).then(async (result: any) => {
  //   const expireUnixTimeSeconds =
  //     Math.floor(Date.now() / 1000) + 60 * ONLINE_ACTIVITY_TIMEOUT;
  //   await redisConnection.expireat(timestamp, expireUnixTimeSeconds);
  // });

  return decoded as any;
};

export const findStudent = async (email: string): Promise<Student | null> => {
  try {
    const students = await prisma.student.findFirst({
      where: {
        email,
      },
    });

    return students;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export const createOTP = async (input: string, purpose: string) => {
  const otp = await prisma.otp.create({
    data: {
      userLogin: input,
      otp: "123456",
      purpose,
      status: OTP_SENT_STATUS,
    },
  });

  return otp;
};

export const findOTPRecord = async (
  userLogin: string,
  otp: string
): Promise<string> => {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      userLogin,
      otp,
      status: OTP_SENT_STATUS,
      createdAt: {
        gt: new Date(new Date().getTime() - 5 * 60 * 1000),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otpRecord) {
    throw Error("Wrong OTP or OTP has expired");
  }

  return otpRecord.purpose;
};

export const invalidateOTPs = async (input: string) => {
  const oldOtps = await prisma.otp.updateMany({
    where: {
      userLogin: input,
      status: OTP_SENT_STATUS,
    },
    data: {
      status: OTP_USED_STATUS,
    },
  });
};

export const sendStudentOtp = async (email: string, purpose: string) => {
  try {
    if (purpose === OTP_PURPOSE_REGISTER) {
      const student = await findStudent(email);
      if (student) {
        throw new Error("Email already exists");
      } else {
        await invalidateOTPs(email);
        const otp = await createOTP(email, purpose);
        console.log("OTP sent to email");
      }
    } else if (purpose === OTP_PURPOSE_FORGOT_PASSWORD) {
      const student = await findStudent(email);
      if (!student) {
        throw new Error("Student not found");
      } else {
        await invalidateOTPs(email);
        const otp = await createOTP(email, purpose);

        console.log("OTP sent to email");
      }
    }

    return true;
  } catch (e: any) {
    throw e;
  }
};

export const createStudent = async (input: {
  email: string;
  password: string;
  grade: string;
  age: number;
  schoolID: number;
  name: string;
}): Promise<Student> => {
  try {
    const { email, password, grade, age, schoolID, name } = input;

    const lcEmail = email.toLowerCase();

    const isEmailValid = isEmail(lcEmail);

    // TODO: VALIDATE THE EMAIL WITH THE REGISTERED SCHOOL DOMAINS
    if (!isEmailValid) {
      throw new Error("Invalid email");
    }

    const hashPassKey = hashedPassword(password);

    //TODO: VALIDATE THE SCHOOLID IN OUR DB
    const student = await prisma.student.create({
      data: {
        email: lcEmail,
        password: hashPassKey,
        grade,
        age,
        schoolID,
        moderatorAccess: false,
        name: name,
      },
    });

    return student;
  } catch (e: any) {
    throw new Error(e.message);
  }
};

export const checkStudentExists = async (email: string): Promise<Student> => {
  const studentRecord = await prisma.student.findFirst({
    where: {
      email,
    },
  });

  if (!studentRecord) {
    throw new Error("Invalid username or password");
  }

  return studentRecord;
};

export const checkPassword = async (
  userRecord: Student | Coach,
  password: string
): Promise<string> => {
  const dbPassword = userRecord.password;

  const isValid = await bcrypt.compare(password, dbPassword);
  const role = "phone" in userRecord ? COACH_ROLE : STUDENT_ROLE;
  console.log("role", role);

  if (isValid) {
    const id = userRecord.id;
    const email = userRecord.email;
    const token: string = jsonwebtoken.sign(
      {
        email: email,
        id: id,
        role: role,
      },
      process.env.JWT_SECRET_KEY as string
    );
    return token;
  }

  throw new Error("Invalid username or password");
};

export const findStudentByID = async (id: number): Promise<Student | null> => {
  try {
    const student = await prisma.student.findFirst({
      where: {
        id,
      },
    });

    return student;
  } catch (e: any) {
    throw new Error(e.message);
  }
};
