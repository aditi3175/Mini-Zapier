import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ config, payload }) => {
  await transporter.sendMail({
    from: '"Mini Zapier" <no-reply@example.com>',
    to: payload.user.email,
    subject: config.subject,
    text: config.text.replace("{{user.email}}", payload.user.email),
  });
};
