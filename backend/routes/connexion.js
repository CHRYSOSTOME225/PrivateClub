const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const SECRET = "privateclub_secret_2026";

router.post("/", (req, res) => {

    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
        return res.status(400).json({
            message: "Email et mot de passe obligatoires"
        });
    }

    const sql =
        "SELECT * FROM utilisateurs WHERE email = ?";

    db.query(sql, [email], async (err, resultats) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Erreur serveur"
            });
        }

        if (resultats.length === 0) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        const utilisateur = resultats[0];

        const motDePasseCorrect =
            await bcrypt.compare(
                motDePasse,
                utilisateur.mot_de_passe
            );

        if (!motDePasseCorrect) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        // Création du token
        const token = jwt.sign(
            {
                id: utilisateur.id,
                role: utilisateur.role
            },
            SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            message: "Connexion réussie",

            token: token,

            utilisateur: {
                id: utilisateur.id,
                nom: utilisateur.nom,
                email: utilisateur.email,
                role: utilisateur.role,
                departement: utilisateur.departement,
                poste: utilisateur.poste,
                telephone: utilisateur.telephone,
                photo: utilisateur.photo
            }
        });
    });
});

module.exports = router;