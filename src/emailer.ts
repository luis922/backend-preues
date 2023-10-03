import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAILER_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAILER_USER,
    pass: process.env.EMAILER_PASSWORD,
  },
});

export default transporter;
