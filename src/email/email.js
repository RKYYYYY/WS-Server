import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendConfirmationEmail = async (token, email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Registration confirmation",
    html: `<p>Welcome to WrongSettings, you will start to be better right after you confirm your account registration ! Just click the link below and let's go ! </p><br><a href=${process.env.API_URL}/user/verifyMail/${token}>Confirm my registration</a>`,
  };

  await transporter.sendMail(mailOptions);
};
