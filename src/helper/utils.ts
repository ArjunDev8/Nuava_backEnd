import { IST_TZ } from "../constants";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
// const moment = require("moment");

// export const generateOTP = (size: number) => {
//   var digits = "0123456789";
//   let OTP = "";
//   for (let i = 0; i < size; i++) {
//     OTP += digits[Math.floor(Math.random() * 10)];
//   }
//   return OTP;
// };

// export const randomInteger = (min: number, max: number): number => {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// };

// export const validateParam = (field: string, value: string) => {
//   if (value === null || value.trim() === "") {
//     throw new Error(`Please enter ${field} `);
//   }
// };

// export const removePrefix = (key: string) => {
//   let path = "";
//   if (key) {
//     path = key.replace(`${process.env.S3_UPLOADS_FOLDER_PREFIX}`, "");
//   }

//   return path;
// };

// export const isJSON = (text: string) => {
//   if (
//     /^[\],:{}\s]*$/.test(
//       text
//         .replace(/\\["\\\/bfnrtu]/g, "@")
//         .replace(
//           /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
//           "]"
//         )
//         .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
//     )
//   ) {
//     return true;
//   } else {
//     return false;
//   }
// };

// export const xValues = (filter: string): string[] => {
//   const x: any = {
//     "1d": ["8:00am", "9:00am", "10:00am", "11:00am", "12:00pm"],
//     "5d": ["1/7", "2/7", "3/7", "4/7", "5/7"],
//     "1m": ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"],
//     "6m": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     ytd: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//   };

//   return x[filter];
// };

// export const timestampInMins = (): number => {
//   return Math.floor(Math.floor(new Date().getTime() / 1000) / 60);
// };

// export const userTimestampInMins = (ts: number) => {
//   return Math.floor(Math.floor(ts / 1000) / 60);
// };

// const yyyymmdd = (date: any): string => {
//   let dd = date.date();
//   let mm = date.month() + 1;
//   let yyyy = date.year();
//   if (dd < 10) {
//     dd = "0" + dd;
//   }
//   if (mm < 10) {
//     mm = "0" + mm;
//   }

//   return `${yyyy}${mm}${dd}`;
// };

// export const todayYyyymmdd = (): string => {
//   const now = moment.utc();
//   return convertToTz(now, IST_TZ);
// };

// /**
//  * Returns the date string representing n months back from the current date.
//  * @param n - The number of months to go back.
//  * @returns The date string in the format 'YYYYMMDD'.
//  */
// export const nMonthsBack = (n: number): string => {
//   const now = moment.utc();
//   const indiaNow = convertToTzRaw(now, IST_TZ);
//   return indiaNow.subtract(n, "months").format("YYYYMMDD");
// };

// export const nWeeksBack = (n: number): string => {
//   const now = moment.utc();
//   const indiaNow = convertToTzRaw(now, IST_TZ);
//   return indiaNow.subtract(n * 7, "days").format("YYYYMMDD");
// };

// export const nYearsBack = (n: number): string => {
//   const now = moment.utc();
//   const indiaNow = convertToTzRaw(now, IST_TZ);
//   return indiaNow.subtract(n, "years").format("YYYYMMDD");
// };

// // outut of nDays if the n is 5

// export const nDaysDates = (n: number): string[] => {
//   let result = [];
//   const now = moment.utc();
//   for (let i = 1; i <= n; i++) {
//     const indiaNow = convertToTzRaw(now, IST_TZ);
//     result.push(indiaNow.subtract(i, "d").format("YYYYMMDD"));
//   }

//   return result;
// };

// export const getMinutesToMidnight = (): number => {
//   const now = moment.utc();
//   const indiaNow = convertToTzRaw(now, IST_TZ);

//   let minutes = indiaNow.minutes();
//   let hours = indiaNow.hours();

//   let result = 60 * hours + minutes;

//   return 60 * 24 - result;
// };

// export const convertToTz = (date: any, tz: string) => {
//   return moment.tz(date, tz).format("YYYYMMDD");
// };

// export const convertToTzRaw = (date: any, tz: string) => {
//   return moment.tz(date, tz);
// };

// /**
//  * Returns a random index based on the given probabilities.
//  * @param probabilities - An array of numbers representing the probabilities.
//  * @returns The index of the randomly selected probability.
//  */

// export const getRandomIndex = (probabilities: number[]): number => {
//   let random = Math.random(),
//     i;

//   for (i = 0; i < probabilities.length; i++) {
//     if (random < probabilities[i]) return i;
//     random -= probabilities[i];
//   }
//   return probabilities.length - 1;
// };

// export const coloredLog = (metaText: string, message: any) => {
//   console.log("\x1b[36m%s\x1b[0m", metaText, message);
// };

// export const generateRandomCode = (length: number): string => {
//   let result = "";
//   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   const charactersLength = characters.length;
//   let counter = 0;
//   while (counter < length) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     counter += 1;
//   }
//   return result;
// };

export const isEmail = (input: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

export const hashedPassword = (password: string): string => {
  return bcrypt.hashSync(password, 12);
};

export const validatePassword = (
  password: string,
  hashedPassword: string
): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
};

export const generateJWTToken = ({
  email,
  id,
  role,
}: {
  email: string;
  id: number;
  role: string;
}) => {
  const token = jsonwebtoken.sign(
    {
      email,
      id,
      role,
    },
    process.env.JWT_SECRET_KEY as string
  );

  return token;
};

export function areTournamentDaysValid(tournament: any): boolean {
  const { startDate, endDate, tournamentDays } = tournament;

  if (!startDate || !endDate) {
    return false; // Start and end dates must be specified
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (const day of tournamentDays) {
    if (!day.date) {
      return false; // Each tournament day must have a date
    }

    const dayDate = new Date(day.date);

    // Check if the tournament day falls within the start and end dates
    if (dayDate < start || dayDate > end) {
      return false;
    }
  }

  return true;
}
