import express from "express";
import { getUsers, bookmarkProfile } from "../controllers/users.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route publique pour récupérer la liste des utilisateurs
router.get("/", getUsers);

// Route protégée pour les bookmarks (nécessite d'être connecté)
router.post("/bookmark/:userId", protect, bookmarkProfile);

export default router;
