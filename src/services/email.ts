import path from "path";
import fs from "fs";
import { Job, Queue, Worker } from "bullmq";
import { redisConnection } from "./queue";

export const getEmailTemplate = (email_template: string) => {
  const tempDir = path.join(process.env.EMAIL_TEMPLATES_DIR + email_template);
  const template = fs.readFileSync(tempDir, { encoding: "utf-8" });

  return template;
};

export const emailQueue = new Queue("emails", { connection: redisConnection });

const emailWorker = new Worker(
  "emails",
  async (job: Job) => {
    const payload = job.data;
    // await sendEmail(
    //     payload["toEmails"],
    //     payload["subject"],
    //     payload["body"],
    //     payload["templateParams"]
    //   );
  },
  { connection: redisConnection }
);

emailWorker.on("completed", (job: Job, returnvalue: any) => {
  // Do something with the return value.
  console.log(">>>>>>sent email", job.data);
});
