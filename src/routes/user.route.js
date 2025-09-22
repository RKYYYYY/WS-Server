import express from "express";
import {
  register,
  login,
  verifyMail,
  currentUser,
  logoutUser,
  updateProfile,
} from "../controllers/user.controller.js"; // importe les 3 fonction qui gèrent la logique d'inscription/connexion
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router(); // crée un routeur Express pour grouper les routes liées aux utilisateurs

router.post("/", register); // appelle la function register() pour créer un nouveau user
router.post("/login", login); // appelle la function login() pour authentifier un user

router.get("/verifyMail/:token", verifyMail); // :token capteure la valeur dans l'url pour la vérification d'email
router.get("/current", currentUser);

router.put("/profile-settings", protect, updateProfile);

router.delete("/deleteToken", logoutUser);

export default router;
