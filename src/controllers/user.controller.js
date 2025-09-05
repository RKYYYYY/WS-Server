import dotenv from "dotenv";
import { sendConfirmationEmail } from "../email/email.js";
import TempUser from "../models/tempuser.schema.js";
import User from "../models/user.schema.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const createTokenEmail = (email) => {
  return jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: "600s" });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUserMail = await User.findOne({ email });
    const existingUserPseudo = await User.findOne({ username });
    const existingTempUserMail = await User.findOne({ email });
    const existingTempUserPseudo = await User.findOne({ username });

    if (existingUserMail || existingUserPseudo) {
      return res.status(400).json({ message: "Already registered" });
    } else if (existingTempUserMail || existingTempUserPseudo) {
      return res.status(400).json({ message: "Check your emails" });
    }

    const token = createTokenEmail(email);
    await sendConfirmationEmail(token, email);

    const hashedPassword = await bcrypt.hash(password, 10);

    const tempUser = new TempUser({
      username,
      email,
      password: hashedPassword,
      token,
    });
    await tempUser.save();
    res.status(200).json({
      message: "Please check your emails to confirm your registration",
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  const { data, password } = req.body;
  let user;

  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (emailRegex.test(data)) {
    user = await User.findOne({ email: data });
  } else {
    user = await User.findOne({ username: data });
  }

  if (!user) {
    res.status(400).json({ message: "Wrong e-mail and/or password" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign({}, process.env.SECRET_KEY, {
    subject: user._id.toString(),
    expiresIn: "7d",
    algorithm: "HS256",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.MODE === "development" ? false : true, // false en local, true quand dépolyé
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7j de 24h de 60min de 60sec (*1000 pour mettre en millisecondes)
    sameSite: "None",
  });

  res.status(200).json({ user, message: "Connected" });
};

export const verifyMail = async (req, res) => {
  // console.log("TEST EMAIL");
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const tempUser = await TempUser.findOne({ email: decoded.email, token });
    if (!tempUser) {
      // gestion du feedback
      return res.redirect(
        `${
          process.env.MODE === "development"
            ? process.env.CLIENT_URL
            : process.env.DEPLOY_FRONT_URL
        }/register?message=error`
      );
    }
    const newUser = new User({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
    });
    await newUser.save();
    await TempUser.deleteOne({ email: tempUser.email });
    return res.redirect(
      `${
        process.env.MODE === "development"
          ? process.env.CLIENT_URL
          : process.env.DEPLOY_FRONT_URL
      }/login?message=success`
    );
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.redirect(
        `${
          process.env.MODE === "development"
            ? process.env.CLIENT_URL
            : process.env.DEPLOY_FRONT_URL
        }/register?message=error`
      );
    }
  }
};

export const currentUser = async (req, res) => {
  const { token } = req.cookies;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // vérifie en décoande le token avec la clé secrète
      const currentUser = await User.findById(decodedToken.sub); // récupère l'user en se servant de l'id du token

      if (currentUser) {
        res.status(200).json(currentUser);
      } else {
        res.status(400).json(null);
      }
    } catch (error) {
      res.status(400).json(null);
    }
  } else {
    res.status(400).json(null);
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.MODE === "development" ? false : true,
    sameSite: "None",
  });
  res.status(200).json({ message: "Disconnected" });
};
