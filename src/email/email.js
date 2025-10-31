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
    console.log("Mail envoyé à" + email);
  } catch (error) {
    console.error("Erreur de l'envoi du mail", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};
