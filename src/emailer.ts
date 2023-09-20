import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "preuesapp@gmail.com",
    pass: "password here",
  },
});

export default transporter;
