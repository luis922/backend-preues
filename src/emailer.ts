import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "preuesapp@gmail.com",
    pass: "cvhu rqmw tnhm daev",
  },
});

export default transporter;
