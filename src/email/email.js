import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendConfirmationEmail = async (email, token) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_SENDER,
    subject: "Confirmation d'inscription",
    html: `<p>Welcome to WrongSettings, you will start to be better right after you confirm your account registration ! Just click the link below and let's go ! </p><br><a href=${
      process.env.MODE === "development"
        ? process.env.API_URL
        : process.env.DEPLOY_BACK_URL
    }/user/verifyMail/${token}>Confirm my registration</a>`,
  };

  try {
    await sgMail.send(msg);
    console.log("Mail send to" + email);
  } catch (error) {
    console.error("Erreur sending mail", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_SENDER,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Reset Your Password</h2>
        <p>You requested to reset your password for your WrongSettings account.</p>
        <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.MODE === "development"
              ? process.env.CLIENT_URL
              : process.env.DEPLOY_FRONT_URL
          }/reset-password/${token}" 
             style="background-color: #f59e0b; color: #1a1a1a; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">${
          process.env.MODE === "development"
            ? process.env.CLIENT_URL
            : process.env.DEPLOY_FRONT_URL
        }/reset-password/${token}</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Password reset email sent to " + email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
};
