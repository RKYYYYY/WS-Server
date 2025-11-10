import express from "express";
import {
  register,
  login,
  verifyMail,
  currentUser,
  logoutUser,
  updateProfile,
  updateGameSettings,
  getGameSettings,
  getUserGameSettings,
  getAllUsers,
  deleteAccount,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimiter.js";

const router = express.Router(); // crée un routeur Express pour grouper les routes liées aux utilisateurs

router.post("/", registerLimiter, register); // appelle la function register() pour créer un nouveau user
router.post("/login", loginLimiter, login); // appelle la function login() pour authentifier un user
router.post("/forgot-password", passwordResetLimiter, forgotPassword); // envoie un email pour réinitialiser le mot de passe
router.post("/reset-password/:token", resetPassword); // :token permet de valider la demande de réinitialisation

router.get("/all", getAllUsers); // récupère tous les utilisateurs pour la page discover
router.get("/verifyMail/:token", verifyMail); // :token capture la valeur dans l'url pour la vérification d'email
router.get("/game-settings/:userId", getUserGameSettings); // récupère les paramètres de jeu d'un utilisateur public par son id

router.get("/current", protect, currentUser); // récupère les informations de l'utilisateur connecté

router.put("/profile-settings", protect, updateProfile); // met à jour les infos du profil
router.delete("/delete-account", protect, deleteAccount); // supprime le compte de l'utilisateur connecté

router.get("/game-settings", protect, getGameSettings); // récupère les paramètres de jeu de l'utilisateur connecté
router.put("/game-settings", protect, updateGameSettings); // met à jour les paramètres de jeu de l'utilisateur connecté

router.delete("/deleteToken", logoutUser); // déconnecte l'utilisateur en supprimant le cookie token

export default router;
