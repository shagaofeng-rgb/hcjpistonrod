import nodemailer from "nodemailer";

type Transporter = ReturnType<typeof nodemailer.createTransport>;

let transporter: Transporter | null = null;

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getEmailTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: requiredEnv("SMTP_HOST"),
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: process.env.SMTP_SECURE !== "false",
      auth: {
        user: requiredEnv("SMTP_USER"),
        pass: requiredEnv("SMTP_PASS"),
      },
    });
  }

  return transporter;
}

export const emailConfig = {
  fromEmail: process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "",
  fromName: process.env.SMTP_FROM_NAME ?? "HCJ Piston Rod Website",
  toEmail: process.env.RFQ_TO_EMAIL ?? process.env.SMTP_USER ?? "",
};
