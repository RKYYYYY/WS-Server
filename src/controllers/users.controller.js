import User from "../models/user.schema.js";

export const getUsers = async (req, res) => {
  // ↑ fonction pour récupérer la liste des utilisateurs avec filtres pour la page discover
  try {
    console.log("🚀 Route /discover appelée");
    console.log("Query params:", req.query);

    const { search = "", sort = "recent" } = req.query;

    // Construction de la requête de recherche
    let query = {};
    if (search) {
      query.username = { $regex: search, $options: "i" }; // recherche insensible à la casse
    }

    // Configuration du tri
    let sortOptions = {};
    switch (sort) {
      case "recent":
        sortOptions = { updatedAt: -1, createdAt: -1 }; // plus récent en premier
        break;
      case "alphabetical":
        sortOptions = { username: 1 }; // ordre alphabétique
        break;
      case "saved":
        // Pour l'instant, on trie par date de création
        // Plus tard, vous pourrez ajouter un champ pour compter les bookmarks
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Récupération des utilisateurs (sans les mots de passe)
    const users = await User.find(query)
      .select("-password") // exclut le champ password
      .sort(sortOptions)
      .limit(50); // limite à 50 résultats pour les performances

    res.status(200).json({
      users,
      count: users.length,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.log("Error getting users:", error);
    res.status(500).json({
      users: [],
      message: "Error retrieving users",
    });
  }
};

export const bookmarkProfile = async (req, res) => {
  // ↑ fonction pour gérer les bookmarks de profils (à implémenter plus tard)
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id; // depuis le middleware d'auth

    if (!currentUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ici vous pourrez implémenter la logique de bookmark
    // Par exemple, ajouter un système de favoris dans votre base de données

    res.status(200).json({
      message: "Bookmark toggled successfully",
    });
  } catch (error) {
    console.log("Error bookmarking profile:", error);
    res.status(500).json({
      message: "Error bookmarking profile",
    });
  }
};
