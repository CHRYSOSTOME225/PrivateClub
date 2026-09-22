const express = require("express");
const cors = require("cors");

const utilisateursRoutes = require("./routes/utilisateurs");
const connexionRoutes = require("./routes/connexion");
const annoncesRoutes = require("./routes/annonces");
const messagesRoutes = require("./routes/messages");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/utilisateurs", utilisateursRoutes);
app.use("/api/connexion", connexionRoutes);
app.use("/api/annonces", annoncesRoutes);
app.use("/api/messages", messagesRoutes);

// Route d'accueil
app.get("/", (req, res) => {
    res.json({
        message: "Bienvenue sur l'API PrivateClub"
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(
        `Serveur PrivateClub lancé sur http://localhost:${PORT}`
    );
});