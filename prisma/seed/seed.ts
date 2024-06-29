/**
 * ! Executing this script will delete all data in your database and seed it with 10 school.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";
import { prisma } from "../../src/db";
import bcrypt from "bcrypt";

const main = async () => {
  const seed = await createSeedClient();

  // Truncate all tables in the database
  await seed.$resetDatabase(["!public._prisma_migrations"]);

  // // Seed the database with 10 school
  // await seed.school((x) => x(5));

  // // Type completion not working? You might want to reload your TypeScript Server to pick up the changes

  // console.log("Database seeded successfully!");

  // Seed the database with 5 schools
  const schools = [
    {
      name: "School 1",
      address: "Address 1",
      contactDetails: "Contact 1",
      passkey: "Passkey1",
      domain: "school1.com",
    },
    {
      name: "School 2",
      address: "Address 2",
      contactDetails: "Contact 2",
      passkey: "Passkey2",
      domain: "school2.com",
    },
    {
      name: "School 3",
      address: "Address 3",
      contactDetails: "Contact 3",
      passkey: "Passkey3",
      domain: "school3.com",
    },
    {
      name: "School 4",
      address: "Address 4",
      contactDetails: "Contact 4",
      passkey: "Passkey4",
      domain: "school4.com",
    },
    {
      name: "School 5",
      address: "Address 5",
      contactDetails: "Contact 5",
      passkey: "Passkey5",
      domain: "school5.com",
    },
  ];
  for (let school of schools) {
    const hashedPasskey = await bcrypt.hash(school.passkey, 10);
    await prisma.school.create({
      data: {
        ...school,
        passkey: hashedPasskey,
      },
    });
  }
  // model Student {
  //   id                Int                 @id @default(autoincrement())
  //   name              String
  //   email             String
  //   age               Int
  //   grade             String
  //   schoolID          Int
  //   teamID            Int?
  //   moderatorAccess   Boolean
  //   token             String?
  //   password          String
  //   school            School              @relation(fields: [schoolID], references: [id])
  //   teams             StudentOnTeam[]
  //   tryoutParticipant TryoutParticipant[]
  //   createdAt         DateTime            @default(now())
  //   updatedAt         DateTime?           @updatedAt
  // }

  const students = Array.from({ length: 21 }, (_, i) => ({
    name: `Student ${i + 1}`,
    email: `student${i + 1}@school${(i % 3) + 1}.com`,
    age: 10 + i,
    grade: `Grade ${Math.floor(i / 5) + 1}`,
    schoolID: (i % 5) + 1,
    moderatorAccess: false,
    password: `password${i + 1}`,
  }));

  for (let student of students) {
    const hashedPassword = await bcrypt.hash(student.password, 10);
    await prisma.student.create({
      data: {
        ...student,
        password: hashedPassword,
      },
    });
  }

  process.exit();
};

main();
