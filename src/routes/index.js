import express from "express";

import userRoutes from "./user.route.js";
import usersRoutes from "./users.route.js"; // nouvelle route

const router = express.Router();

router.use("/user", userRoutes);
router.use("/users", usersRoutes); // ajout de la route pour la liste des utilisateurs

export default router;

// sur http://localhost:5000
