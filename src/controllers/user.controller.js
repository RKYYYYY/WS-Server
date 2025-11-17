import dotenv from "dotenv";
import {
  sendConfirmationEmail,
  sendPasswordResetEmail,
} from "../email/email.js";
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
    const existingTempUserMail = await TempUser.findOne({ email });
    const existingTempUserPseudo = await TempUser.findOne({ username });

    if (existingUserMail || existingUserPseudo) {
      return res.status(400).json({ message: "Already registered" });
    } else if (existingTempUserMail || existingTempUserPseudo) {
      return res.status(400).json({ message: "Check your emails" });
    }

    const token = createTokenEmail(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    const tempUser = new TempUser({
      username,
      email,
      password: hashedPassword,
      token,
    });
    await tempUser.save();
    console.log("TempUser register in DB:", tempUser);

    try {
      await sendConfirmationEmail(email, token);
      console.log("Email send to:", email);
    } catch (mailError) {
      console.error(
        "Error sending email:",
        mailError.response?.body || mailError
      );
    }

    res.status(200).json({
      message: "Please check your emails to confirm your registration",
    });
  } catch (error) {
    console.log("Error register:", error);
    res.status(500).json({ message: "Server error" });
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
    return res.status(400).json({ message: "Wrong e-mail and/or password" });
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
    secure: process.env.MODE === "development" ? false : true, // false en local, true quand déployé
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7j de 24h de 60min de 60sec (*1000 pour mettre en millisecondes)
    sameSite: process.env.MODE === "development" ? "Lax" : "None",
  });

  res.status(200).json({ user, message: "Connected" });
};

export const verifyMail = async (req, res) => {
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
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // vérifie en décode le token avec la clé secrète
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
    sameSite: process.env.MODE === "development" ? "Lax" : "None",
  });
  res.status(200).json({ message: "Disconnected" });
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, avatar, username, email } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Changement de mot de passe
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is not matching" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Changement d'avatar
    if (avatar) {
      user.avatar = avatar;
    }

    // Changement de pseudo
    if (username && username !== user.username) {
      // Vérifier si le nouveau pseudo est déjà pris
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    // Changement d'email
    if (email && email !== user.email) {
      // Vérifier si le nouvel email est déjà pris
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already taken" });
      }
      user.email = email;
    }

    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    // Supprimer le cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.MODE === "development" ? false : true,
      sameSite: process.env.MODE === "development" ? "Lax" : "None",
    });

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error deleting account:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    // créer un token de réinitialisation
    const resetToken = createTokenEmail(email);

    // sauvegarder le token temporairement dans l'utilisateur
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // envoyer l'email
    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log("Password reset email sent to:", email);
    } catch (mailError) {
      console.error(
        "Error sending email:",
        mailError.response?.body || mailError
      );
    }

    res.status(200).json({
      message: "Password reset email sent. Please check your inbox.",
    });
  } catch (error) {
    console.log("Error forgot password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // vérifier le token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({
      email: decoded.email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error reset password:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        message: "Token expired",
      });
    }
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateGameSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const gameSettings = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.gameSettings = {
      ...user.gameSettings.toObject(),
      ...gameSettings,
    };

    await user.save(); // validation automatique lors du sav

    return res.status(200).json({
      message: "Game settings updated successfully",
      gameSettings: user.gameSettings,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors: errors,
      });
    }

    console.log("Error updating game settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getGameSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    return res.status(200).json({
      gameSettings: user.gameSettings || {},
    });
  } catch (error) {
    console.log("Error getting game settings", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserGameSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "username avatar gameSettings"
    );

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    return res.status(200).json({
      username: user.username,
      avatar: user.avatar,
      gameSettings: user.gameSettings || {},
    });
  } catch (error) {
    console.log("Error gettings user game settings", error);
    res.status(500).json({ message: "Server error" });
  }
};

// recup tous les utilisateurs avec filtres de recherche / tri
export const getAllUsers = async (req, res) => {
  try {
    const { search, sort } = req.query;

    // construction de la requête de recherche
    let query = {};

    if (search) {
      query.username = { $regex: search, $options: "i" }; // recherche insensible à la casse
    }

    // options de tri
    let sortOption = {};
    if (sort === "recent") {
      sortOption = { createdAt: -1 }; // plus récents en premier
    } else if (sort === "alphabetical") {
      sortOption = { username: 1 }; // ordre alphabétique a à z
      //tri par date de mise à jour
      sortOption = { updatedAt: -1 };
    } else {
      sortOption = { createdAt: -1 }; // par défaut : plus récents
    }

    // recup des utilisateurs
    const users = await User.find(query)
      .sort(sortOption)
      .select("username avatar createdAt updatedAt"); // ne renvoie que ces champs

    return res.status(200).json({ users });
  } catch (error) {
    console.log("Error getting all users:", error);
    res.status(500).json({ users: [], message: "Server error" });
  }
};
