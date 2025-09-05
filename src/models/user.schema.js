import mongoose from "mongoose"; // import pour intéragir avec mongodb

const userSchema = new mongoose.Schema( // schéma qui définit la structure des infos user
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true } // ajoute createAt et updateAt au doc pour suive les infos
);

const User = mongoose.model("User", userSchema); // crée le modèle User basé sur le schéma

export default User;
