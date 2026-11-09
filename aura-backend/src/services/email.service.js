const nodemailer = require("nodemailer");

function getTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured.");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be an integer between 1 and 65535.");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

async function sendPasswordResetEmail(email, name, resetLink) {
  const from = process.env.MAIL_FROM;

  if (!from) {
    throw new Error("MAIL_FROM must be configured.");
  }

  await getTransporter().sendMail({
    from,
    to: email,
    subject: "Reset your AURA password",
    text: `Hello ${name},\n\nUse the link below to reset your AURA password. It expires shortly and can only be used once.\n\n${resetLink}\n\nIf you did not request a reset, you can ignore this email.`
  });
}

module.exports = { sendPasswordResetEmail };
