import nodemailer, { Transporter } from "nodemailer";

/**
 * Interface for email options
 */
interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

/**
 * Utility to send emails using nodemailer with Resend SMTP
 */
const sendEmail = async (options: EmailOptions): Promise<void> => {
  // 1) Create transporter
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: `E-Commerce App <onboarding@resend.dev>`, // Resend requires a verified domain or their default onboarding email
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
