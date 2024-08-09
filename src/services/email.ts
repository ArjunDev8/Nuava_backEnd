import * as https from "https";
import path from "path";
import fs from "fs";
import { Job, Queue, Worker } from "bullmq";
import { redisConnection } from "./queue";
import {
  COMPANY_NAME,
  MSG91_DOMAIN,
  MSG91_EMAIL_TEMPLATE_ID,
  MSG91_SENDER_EMAIL,
} from "../constants";

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

    console.log("Sending email to", payload.userEmail);

    await sendOtpEmail({
      userName: payload.userName,
      userEmail: payload.userEmail,
      otp: payload.otp,
    });
  },
  { connection: redisConnection }
);

emailWorker.on("completed", (job: Job, returnvalue: any) => {
  // Do something with the return value.
  console.log(">>>>>>sent email", job.data);
});

async function sendOtpEmail({
  userName,
  userEmail,
  otp,
}: {
  userName: string;
  userEmail: string;
  otp: string;
}): Promise<void> {
  try {
    const options = {
      method: "POST",
      hostname: "control.msg91.com",
      port: null,
      path: "/api/v5/email/send",
      headers: {
        accept: "application/json",
        authkey: process.env.MSG91_API_KEY,
        "content-type": "application/json",
      },
    };

    const data = JSON.stringify({
      recipients: [
        {
          to: [
            {
              name: userName,
              email: userEmail,
            },
          ],
          variables: {
            company_name: COMPANY_NAME,
            otp,
          },
        },
      ],
      from: {
        name: COMPANY_NAME,
        email: MSG91_SENDER_EMAIL,
      },
      domain: MSG91_DOMAIN,
      template_id: MSG91_EMAIL_TEMPLATE_ID,
    });

    await new Promise<void>((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks: Uint8Array[] = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const body = Buffer.concat(chunks).toString();
          console.log(body);
          resolve();
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
